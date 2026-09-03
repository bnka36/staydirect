export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { findValidGuestPromoCode } from '@/lib/promoCodes'

// POST — vérification publique d'un code promo par un voyageur, depuis le widget de réservation
export async function POST(req: Request) {
  const { propertyId, code } = await req.json()
  if (!propertyId || !code) {
    return NextResponse.json({ valid: false, error: 'Code requis' }, { status: 400 })
  }

  const property = await prisma.property.findUnique({ where: { id: propertyId }, select: { userId: true } })
  if (!property) return NextResponse.json({ valid: false, error: 'Logement introuvable' }, { status: 404 })

  const promo = await findValidGuestPromoCode(property.userId, propertyId, code)
  if (!promo) {
    return NextResponse.json({ valid: false, error: 'Code promo invalide ou expiré' })
  }

  return NextResponse.json({
    valid: true,
    discountPercent: promo.discountPercent,
    discountAmount: promo.discountAmount,
  })
}
