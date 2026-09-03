export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — lister les codes promo de l'hôte
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const codes = await prisma.guestPromoCode.findMany({
    where: { userId: session.user.id },
    include: { property: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(codes)
}

// POST — créer un code promo
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { code, propertyId, discountPercent, discountAmount, maxUses, expiresAt } = await req.json()

  const normalized = (code || '').trim().toUpperCase()
  if (!normalized) return NextResponse.json({ error: 'Code requis' }, { status: 400 })
  if (!discountPercent && !discountAmount) {
    return NextResponse.json({ error: 'Indiquez une remise en % ou en €' }, { status: 400 })
  }

  if (propertyId) {
    const property = await prisma.property.findFirst({ where: { id: propertyId, userId: session.user.id } })
    if (!property) return NextResponse.json({ error: 'Logement introuvable' }, { status: 404 })
  }

  const existing = await prisma.guestPromoCode.findFirst({ where: { userId: session.user.id, code: normalized } })
  if (existing) return NextResponse.json({ error: 'Ce code existe déjà' }, { status: 400 })

  const promo = await prisma.guestPromoCode.create({
    data: {
      userId: session.user.id,
      propertyId: propertyId || null,
      code: normalized,
      discountPercent: discountPercent ? parseInt(discountPercent) : null,
      discountAmount: discountAmount ? parseFloat(discountAmount) : null,
      maxUses: maxUses ? parseInt(maxUses) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  })

  return NextResponse.json(promo)
}
