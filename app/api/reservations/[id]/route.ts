export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getActiveRoomUnitCount, countOverlappingReservations } from '@/lib/roomUnits'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const { guestName, guestEmail, guestPhone, guestAddress, totalPrice, source, roomUnitId, checkIn, checkOut } = await req.json()

  const reservation = await prisma.reservation.findFirst({
    where: { id, property: { userId: session.user.id } },
  })
  if (!reservation) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  // Attribution/déplacement de chambre et/ou changement de dates (depuis la grille planning) :
  // on revalide la disponibilité de la chambre cible avant d'appliquer.
  const newStart = checkIn ? new Date(checkIn) : reservation.checkIn
  const newEnd = checkOut ? new Date(checkOut) : reservation.checkOut
  const newRoomUnitId = roomUnitId !== undefined ? (roomUnitId || null) : reservation.roomUnitId
  const datesOrRoomChanged = checkIn !== undefined || checkOut !== undefined || roomUnitId !== undefined

  if (datesOrRoomChanged) {
    if (!(newStart < newEnd)) {
      return NextResponse.json({ error: 'La date de départ doit être après la date d\'arrivée' }, { status: 400 })
    }
    if (newRoomUnitId) {
      const roomUnit = await prisma.roomUnit.findFirst({ where: { id: newRoomUnitId, propertyId: reservation.propertyId } })
      if (!roomUnit) return NextResponse.json({ error: 'Chambre introuvable' }, { status: 404 })
      const conflict = await prisma.reservation.findFirst({
        where: { roomUnitId: newRoomUnitId, status: 'confirmed', id: { not: id }, checkIn: { lt: newEnd }, checkOut: { gt: newStart } },
      })
      if (conflict) return NextResponse.json({ error: `${roomUnit.label} est déjà réservée sur ces dates` }, { status: 400 })
    } else if (checkIn !== undefined || checkOut !== undefined) {
      // Pas de chambre précise attribuée : sur un logement simple, vérifier qu'aucune autre
      // résa confirmée n'occupe déjà ces dates ; sur un logement multi-unités, vérifier qu'il
      // reste une chambre libre dans le pool non-attribué.
      const activeRoomUnits = await getActiveRoomUnitCount(reservation.propertyId)
      const overlapping = await countOverlappingReservations(reservation.propertyId, newStart, newEnd, id)
      if (activeRoomUnits === 0 && overlapping > 0) {
        return NextResponse.json({ error: 'Ce logement est déjà réservé sur ces dates' }, { status: 400 })
      }
      if (activeRoomUnits > 0 && overlapping >= activeRoomUnits) {
        return NextResponse.json({ error: 'Plus aucune chambre disponible sur ces dates' }, { status: 400 })
      }
    }
  }

  const VALID_SOURCES = ['direct', 'airbnb', 'booking', 'abritel', 'greengo', 'ical']
  const nights = datesOrRoomChanged ? Math.round((newEnd.getTime() - newStart.getTime()) / 86400000) : undefined

  const updated = await prisma.reservation.update({
    where: { id },
    data: {
      guestName,
      guestEmail,
      guestPhone: guestPhone || null,
      ...(guestAddress !== undefined ? { guestAddress: guestAddress || null } : {}),
      ...(totalPrice !== undefined ? { totalPrice: Number(totalPrice) } : {}),
      ...(source !== undefined && VALID_SOURCES.includes(source) ? { source } : {}),
      ...(roomUnitId !== undefined ? { roomUnitId: newRoomUnitId } : {}),
      ...(checkIn !== undefined ? { checkIn: newStart } : {}),
      ...(checkOut !== undefined ? { checkOut: newEnd } : {}),
      ...(nights !== undefined ? { nights } : {}),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params

  // Vérifier que la réservation appartient à l'utilisateur
  const reservation = await prisma.reservation.findFirst({
    where: { id, property: { userId: session.user.id } },
  })

  if (!reservation) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  // Une résa importée depuis un iCal (icalUid non nul) est annulée plutôt que supprimée :
  // si on la supprimait vraiment, le prochain sync ne la retrouverait plus par son UID et la
  // recréerait aussitôt. En passant par "cancelled", elle disparaît des résas actives mais reste
  // connue du sync, qui ne la touche plus jamais.
  if (reservation.icalUid) {
    await prisma.reservation.update({ where: { id }, data: { status: 'cancelled' } })
  } else {
    await prisma.reservation.delete({ where: { id } })
  }

  return NextResponse.json({ ok: true })
}
