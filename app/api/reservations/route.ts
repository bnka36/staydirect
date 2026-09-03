export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getActiveRoomUnitCount, countOverlappingReservations } from '@/lib/roomUnits'

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
  const { propertyId, guestName, guestEmail, guestPhone, guestAddress, checkIn, checkOut, totalPrice, source, roomUnitId } = data

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

  const activeRoomUnits = await getActiveRoomUnitCount(propertyId)
  const isMultiUnit = activeRoomUnits > 0

  if (isMultiUnit && roomUnitId) {
    const roomUnit = await prisma.roomUnit.findFirst({ where: { id: roomUnitId, propertyId } })
    if (!roomUnit) return NextResponse.json({ error: 'Chambre introuvable' }, { status: 404 })
    const conflict = await prisma.reservation.findFirst({
      where: { roomUnitId, status: 'confirmed', checkIn: { lt: end }, checkOut: { gt: start } },
    })
    if (conflict) return NextResponse.json({ error: `${roomUnit.label} est déjà réservée sur ces dates` }, { status: 400 })
  } else if (isMultiUnit) {
    const overlapping = await countOverlappingReservations(propertyId, start, end)
    if (overlapping >= activeRoomUnits) {
      return NextResponse.json({ error: 'Plus aucune chambre disponible sur ces dates' }, { status: 400 })
    }
  } else {
    const conflict = await prisma.reservation.findFirst({
      where: { propertyId, status: 'confirmed', checkIn: { lt: end }, checkOut: { gt: start } },
    })
    if (conflict) return NextResponse.json({ error: 'Ce logement est déjà réservé sur ces dates' }, { status: 400 })
  }

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
      roomUnitId: isMultiUnit && roomUnitId ? roomUnitId : null,
    },
  })

  // Sur un logement multi-unités, bloquer le logement entier casserait la dispo des autres
  // chambres — la disponibilité y est calculée par comptage de réservations, pas par BlockedDate.
  if (!isMultiUnit) {
    const current = new Date(start)
    while (current < end) {
      await prisma.blockedDate.upsert({
        where: { propertyId_date: { propertyId, date: new Date(current) } },
        update: {},
        create: { propertyId, date: new Date(current), source: 'manual' },
      })
      current.setDate(current.getDate() + 1)
    }
  }

  return NextResponse.json(reservation)
}
