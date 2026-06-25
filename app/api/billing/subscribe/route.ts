export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

const PLANS = {
  starter: process.env.STRIPE_PRICE_STARTER!,
  pro: process.env.STRIPE_PRICE_PRO!,
  business: process.env.STRIPE_PRICE_BUSINESS!,
  livret: process.env.STRIPE_PRICE_LIVRET!,
}

export async function POST(req: Request) {
  const stripe = getStripe()
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { plan, promoCode } = await req.json()
  if (!PLANS[plan as keyof typeof PLANS]) {
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

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{ price: PLANS[plan as keyof typeof PLANS], quantity: 1 }],
    ...(discounts.length > 0 ? { discounts } : {}),
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscribed=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { userId: user.id, plan },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
