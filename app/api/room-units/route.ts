export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — lister les chambres d'un logement (?propertyId=...)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const propertyId = searchParams.get('propertyId')
  if (!propertyId) return NextResponse.json({ error: 'propertyId requis' }, { status: 400 })

  const property = await prisma.property.findFirst({ where: { id: propertyId, userId: session.user.id } })
  if (!property) return NextResponse.json({ error: 'Logement introuvable' }, { status: 404 })

  const roomUnits = await prisma.roomUnit.findMany({
    where: { propertyId },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json(roomUnits)
}

// POST — créer une chambre individuelle
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { propertyId, label, pricePerNight, maxGuests } = await req.json()
  if (!propertyId || !label) return NextResponse.json({ error: 'Logement et nom de chambre requis' }, { status: 400 })

  const property = await prisma.property.findFirst({ where: { id: propertyId, userId: session.user.id } })
  if (!property) return NextResponse.json({ error: 'Logement introuvable' }, { status: 404 })

  const existing = await prisma.roomUnit.findFirst({ where: { propertyId, label: label.trim() } })
  if (existing) return NextResponse.json({ error: 'Une chambre porte déjà ce nom' }, { status: 400 })

  const count = await prisma.roomUnit.count({ where: { propertyId } })

  const roomUnit = await prisma.roomUnit.create({
    data: {
      propertyId,
      label: label.trim(),
      pricePerNight: pricePerNight ? parseFloat(pricePerNight) : null,
      maxGuests: maxGuests ? parseInt(maxGuests) : null,
      order: count,
    },
  })

  return NextResponse.json(roomUnit)
}
