export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@staydirect.fr'

function isAdmin(email: string) {
  return email === ADMIN_EMAIL
}

// GET — lister tous les codes
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const codes = await prisma.promoCode.findMany({
    include: { redemptions: { include: { user: { select: { name: true, email: true } } } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(codes)
}

// POST — créer un code
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { code, type, plan, discountPercent, maxUses, expiresAt, note } = await req.json()
  if (!code || !type) return NextResponse.json({ error: 'Code et type requis' }, { status: 400 })

  let stripeCouponId: string | null = null

  // Si c'est un code réduction → créer un coupon Stripe automatiquement
  if (type === 'discount') {
    if (!discountPercent || discountPercent < 1 || discountPercent > 100) {
      return NextResponse.json({ error: 'Pourcentage invalide (1-100)' }, { status: 400 })
    }

    const coupon = await getStripe().coupons.create({
      id: `STAYDIRECT_${code.toUpperCase()}`,
      percent_off: discountPercent,
      duration: 'once', // s'applique sur le 1er paiement
      name: `StayDirect ${discountPercent}% - ${code.toUpperCase()}`,
      max_redemptions: maxUses || 1,
      ...(expiresAt ? { redeem_by: Math.floor(new Date(expiresAt).getTime() / 1000) } : {}),
    })
    stripeCouponId = coupon.id
  }

  const promo = await prisma.promoCode.create({
    data: {
      code: code.toUpperCase().trim(),
      type,
      plan: type === 'free_plan' ? plan : null,
      discountPercent: type === 'discount' ? discountPercent : null,
      stripeCouponId,
      maxUses: maxUses || 1,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      note: note || null,
    },
  })

  return NextResponse.json(promo)
}

// DELETE — supprimer un code
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { id } = await req.json()
  const promo = await prisma.promoCode.findUnique({ where: { id } })

  // Supprimer le coupon Stripe si c'était un code réduction
  if (promo?.stripeCouponId) {
    try { await getStripe().coupons.del(promo.stripeCouponId) } catch {}
  }

  await prisma.promoCode.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
