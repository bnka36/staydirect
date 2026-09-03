export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { PLAN_PRICE_IDS as PLANS } from '@/lib/plans'
import { hotelTierForRoomCount } from '@/lib/hotelTiers'

export async function POST(req: Request) {
  const stripe = getStripe()
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { plan, promoCode, roomCount } = await req.json()

  // Le plan Hôtel a plusieurs Price Stripe selon le nombre de chambres déclaré (paliers
  // affichés sur /pricing) — on résout le bon Price ID à partir de roomCount plutôt que
  // d'utiliser un tarif fixe unique.
  let priceId: string | undefined
  if (plan === 'hotel') {
    const tier = hotelTierForRoomCount(parseInt(roomCount) || 1)
    priceId = process.env[tier.envVar]
    if (!priceId) {
      return NextResponse.json({ error: `Tarif non configuré pour ce palier (${tier.envVar}). Contactez le support.` }, { status: 500 })
    }
  } else {
    priceId = PLANS[plan as keyof typeof PLANS]
  }
  if (!priceId) {
    return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })

  // Créer ou récupérer le customer Stripe
  let customerId = user.stripeAccountId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: { userId: user.id },
    })
    customerId = customer.id
    await prisma.user.update({ where: { id: user.id }, data: { stripeAccountId: customerId } })
  }

  // Vérifier le code promo réduction si fourni
  let discounts: { coupon: string }[] = []
  if (promoCode) {
    const promo = await prisma.promoCode.findUnique({
      where: { code: promoCode.toUpperCase() },
      include: { redemptions: { where: { userId: session.user.id } } },
    })

    if (promo && promo.type === 'discount' && promo.stripeCouponId) {
      if (promo.uses < promo.maxUses && (!promo.expiresAt || promo.expiresAt > new Date()) && promo.redemptions.length === 0) {
        discounts = [{ coupon: promo.stripeCouponId }]
        // Marquer comme utilisé
        await prisma.$transaction([
          prisma.promoRedemption.create({ data: { promoCodeId: promo.id, userId: session.user.id } }),
          prisma.promoCode.update({ where: { id: promo.id }, data: { uses: promo.uses + 1 } }),
        ])
      }
    }
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      ...(discounts.length > 0 ? { discounts } : {}),
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscribed=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: { userId: user.id, plan },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    // Erreur Stripe (prix mal configuré côté Vercel/Stripe, etc.) : on renvoie un message
    // exploitable plutôt que de laisser planter la requête sans réponse JSON.
    const message = err instanceof Error ? err.message : 'Erreur lors de la création de la session de paiement'
    console.error('Erreur billing/subscribe:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
