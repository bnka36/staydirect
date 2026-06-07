export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const PLAN_LABELS: Record<string, string> = {
  solo: 'Solo',
  petit: 'Petit propriétaire',
  pro: 'Pro / Agence',
}

// GET /api/promo?code=XXX — vérifier un code (avant activation)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')?.toUpperCase()
  if (!code) return NextResponse.json({ error: 'Code manquant' }, { status: 400 })

  const promo = await prisma.promoCode.findUnique({ where: { code } })
  if (!promo) return NextResponse.json({ error: 'Code invalide' }, { status: 404 })
  if (promo.uses >= promo.maxUses) return NextResponse.json({ error: 'Code déjà utilisé au maximum' }, { status: 400 })
  if (promo.expiresAt && promo.expiresAt < new Date()) return NextResponse.json({ error: 'Code expiré' }, { status: 400 })

  return NextResponse.json({
    valid: true,
    type: promo.type,
    plan: promo.plan,
    planLabel: promo.plan ? (PLAN_LABELS[promo.plan] || promo.plan) : null,
    discountPercent: promo.discountPercent,
  })
}

// POST /api/promo — activer un code gratuit (plan offert)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { code } = await req.json()
  if (!code) return NextResponse.json({ error: 'Code manquant' }, { status: 400 })

  const promo = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase() },
    include: { redemptions: { where: { userId: session.user.id } } },
  })

  if (!promo) return NextResponse.json({ error: 'Code invalide' }, { status: 404 })
  if (promo.uses >= promo.maxUses) return NextResponse.json({ error: 'Code déjà utilisé au maximum' }, { status: 400 })
  if (promo.expiresAt && promo.expiresAt < new Date()) return NextResponse.json({ error: 'Code expiré' }, { status: 400 })
  if (promo.redemptions.length > 0) return NextResponse.json({ error: 'Tu as déjà utilisé ce code' }, { status: 400 })

  if (promo.type === 'discount') {
    // Les codes réduction s'appliquent au moment de l'abonnement Stripe, pas ici
    return NextResponse.json({
      success: true,
      type: 'discount',
      discountPercent: promo.discountPercent,
      message: `Code -${promo.discountPercent}% validé ! Il sera appliqué lors de ton abonnement.`,
    })
  }

  // Code plan gratuit → activer directement
  if (!promo.plan) return NextResponse.json({ error: 'Code mal configuré' }, { status: 400 })

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { plan: promo.plan },
    }),
    prisma.promoRedemption.create({
      data: { promoCodeId: promo.id, userId: session.user.id },
    }),
    prisma.promoCode.update({
      where: { id: promo.id },
      data: { uses: promo.uses + 1 },
    }),
  ])

  return NextResponse.json({
    success: true,
    type: 'free_plan',
    plan: promo.plan,
    planLabel: PLAN_LABELS[promo.plan] || promo.plan,
  })
}
