export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const properties = await prisma.property.findMany({
    where: { userId: session.user.id },
    include: { reservations: true, blockedDates: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(properties)
}

const PLAN_LIMITS: Record<string, number> = {
  starter: 1,
  pro: 5,
  business: 15,
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  // Vérifier la limite du plan
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  const plan = user?.plan || 'starter'
  const limit = PLAN_LIMITS[plan] || 1
  const count = await prisma.property.count({ where: { userId: session.user.id } })

  if (count >= limit) {
    return NextResponse.json({
      error: `Limite atteinte. Votre plan ${plan} permet ${limit} logement(s). Passez à un plan supérieur.`,
      upgrade: true,
    }, { status: 403 })
  }

  const data = await req.json()

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
      amenities: data.amenities || [],
    },
  })

  return NextResponse.json(property)
}
