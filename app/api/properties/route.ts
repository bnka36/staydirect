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
    include: { reservations: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(properties)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

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
    },
  })

  return NextResponse.json(property)
}
