export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const reservations = await prisma.reservation.findMany({
    where: { property: { userId: session.user.id } },
    include: { property: true },
    orderBy: { checkIn: 'asc' },
  })

  return NextResponse.json(reservations)
}

const VALID_SOURCES = ['direct', 'airbnb', 'booking', 'abritel', 'ical']

// POST — ajout manuel d'une réservation (ex: résa passée, antérieure à la config StayDirect,
// ou prise par téléphone/bouche-à-oreille)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const data = await req.json()
  const { propertyId, guestName, guestEmail, guestPhone, guestAddress, checkIn, checkOut, totalPrice, source } = data

  if (!propertyId || !guestName || !checkIn || !checkOut) {
    return NextResponse.json({ error: 'Logement, nom du voyageur et dates requis' }, { status: 400 })
  }

  const property = await prisma.property.findFirst({ where: { id: propertyId, userId: session.user.id } })
  if (!property) return NextResponse.json({ error: 'Logement introuvable' }, { status: 404 })

  const start = new Date(checkIn)
  const end = new Date(checkOut)
  if (!(start < end)) {
    return NextResponse.json({ error: 'La date de départ doit être après la date d\'arrivée' }, { status: 400 })
  }
  const nights = Math.round((end.getTime() - start.getTime()) / 86400000)

  const reservation = await prisma.reservation.create({
    data: {
      propertyId,
      guestName,
      guestEmail: guestEmail || `manuel@import.local`,
      guestPhone: guestPhone || null,
      guestAddress: guestAddress || null,
      checkIn: start,
      checkOut: end,
      nights,
      totalPrice: totalPrice ? parseFloat(totalPrice) : 0,
      status: 'confirmed',
      source: VALID_SOURCES.includes(source) ? source : 'direct',
    },
  })

  // Bloquer les dates correspondantes pour éviter tout conflit avec une future réservation directe
  const current = new Date(start)
  while (current < end) {
    await prisma.blockedDate.upsert({
      where: { propertyId_date: { propertyId, date: new Date(current) } },
      update: {},
      create: { propertyId, date: new Date(current), source: 'manual' },
    })
    current.setDate(current.getDate() + 1)
  }

  return NextResponse.json(reservation)
}
