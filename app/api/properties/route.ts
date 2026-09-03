export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sanitizeLengthDiscounts } from '@/lib/utils'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const properties = await prisma.property.findMany({
    where: { userId: session.user.id },
    include: {
      reservations: true,
      blockedDates: true,
      roomUnits: { where: { isActive: true }, select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(properties)
}

// Limites par entrées (meublé/maison/chambre)
const PLAN_LIMITS: Record<string, number> = {
  starter: 1,
  solo: 1,
  petit: 5,
  pro: 15,
  business: 15,
  livret: 0,
}

// Limites par stock total (hotel/appart_hotel/camping)
const STOCK_LIMITS: Record<string, number> = {
  starter: 5,   // essai
  solo: 5,
  petit: 20,
  hotel: 20,
  pro: 50,
  business: 100,
}

const HOTEL_TYPES = ['hotel', 'appart_hotel', 'camping']

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  // Vérifier la limite du plan
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  const plan = user?.plan || 'starter'
  const isTrial = !!(user?.planExpiresAt && new Date(user.planExpiresAt) > new Date())
  const btype = user?.businessType || 'meuble'
  const isHotelType = HOTEL_TYPES.includes(btype)

  const data = await req.json()
  const newStock = parseInt(data.stock) || 1

  if (isHotelType) {
    // Limite par stock total
    const stockLimit = isTrial ? Math.max(STOCK_LIMITS[plan] ?? 20, 20) : (STOCK_LIMITS[plan] ?? 20)
    const existingProps = await prisma.property.findMany({ where: { userId: session.user.id }, select: { stock: true } })
    const currentStock = existingProps.reduce((s, p) => s + (p.stock || 1), 0)
    if (currentStock + newStock > stockLimit) {
      return NextResponse.json({
        error: `Limite atteinte. Votre plan permet ${stockLimit} unités au total (vous en avez ${currentStock}, vous ajoutez ${newStock}). Passez à un plan supérieur.`,
        upgrade: true,
      }, { status: 403 })
    }
  } else {
    // Limite par nombre d'entrées
    const limit = isTrial ? Math.max(PLAN_LIMITS[plan] ?? 1, 5) : (PLAN_LIMITS[plan] ?? 1)
    const count = await prisma.property.count({ where: { userId: session.user.id } })
    if (count >= limit) {
      return NextResponse.json({
        error: `Limite atteinte. Votre plan ${plan} permet ${limit} logement(s). Passez à un plan supérieur.`,
        upgrade: true,
      }, { status: 403 })
    }
  }

  const property = await prisma.property.create({
    data: {
      userId: session.user.id,
      name: data.name,
      description: data.description,
      address: data.address,
      city: data.city,
      country: data.country || 'France',
      pricePerNight: parseFloat(data.pricePerNight),
      maxGuests: parseInt(data.maxGuests),
      images: data.images || [],
      icalUrls: data.icalUrls || [],
      baseGuests: data.baseGuests ? parseInt(data.baseGuests) : null,
      pricePerExtraGuest: data.pricePerExtraGuest ? parseFloat(data.pricePerExtraGuest) : null,
      touristTaxEnabled: !!data.touristTaxEnabled,
      touristTaxPerAdult: data.touristTaxEnabled && data.touristTaxPerAdult ? parseFloat(data.touristTaxPerAdult) : null,
      lengthDiscounts: sanitizeLengthDiscounts(data.lengthDiscounts),
      amenities: data.amenities || [],
      stock: newStock,
    },
  })

  return NextResponse.json(property)
}
