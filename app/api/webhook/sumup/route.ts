export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendConfirmationToGuest, sendNotificationToOwner } from '@/lib/emails'
import { markPropertyDirty } from '@/lib/channexSync'

export async function POST(req: Request) {
  const body = await req.json()

  // SumUp envoie event_type: "PAYMENT" avec status "SUCCESSFUL"
  if (body.event_type !== 'PAYMENT' || body.payload?.status !== 'SUCCESSFUL') {
    return NextResponse.json({ received: true })
  }

  const checkoutRef = body.payload?.checkout_reference || ''
  // Notre ref: SD-XXXXXXXX → on extrait le suffixe de l'id de réservation
  const reservationSuffix = checkoutRef.replace('SD-', '').toLowerCase()
  if (!reservationSuffix) return NextResponse.json({ received: true })

  // Cible précisément LA réservation liée à ce paiement — sans ça, deux paiements SumUp
  // simultanés pouvaient confirmer n'importe quelle réservation "pending" au hasard.
  const reservation = await prisma.reservation.findFirst({
    where: {
      id: { endsWith: reservationSuffix },
      status: 'pending',
    },
    include: { property: { include: { user: true } } },
  })

  if (!reservation) return NextResponse.json({ received: true })

  await prisma.reservation.update({
    where: { id: reservation.id },
    data: { status: 'confirmed' },
  })

  // Bloquer les dates
  const current = new Date(reservation.checkIn)
  while (current < reservation.checkOut) {
    await prisma.blockedDate.create({
      data: { propertyId: reservation.propertyId, date: new Date(current), source: 'direct' },
    }).catch(() => {})
    current.setDate(current.getDate() + 1)
  }

  await markPropertyDirty(reservation.propertyId)

  // Emails
  await Promise.allSettled([
    sendConfirmationToGuest({
      guestName: reservation.guestName, guestEmail: reservation.guestEmail,
      propertyName: reservation.property.name, ownerName: reservation.property.user.name || '',
      ownerEmail: reservation.property.user.email,
      checkIn: reservation.checkIn.toISOString(), checkOut: reservation.checkOut.toISOString(),
      nights: reservation.nights, totalPrice: reservation.totalPrice,
    }),
    sendNotificationToOwner({
      guestName: reservation.guestName, guestEmail: reservation.guestEmail,
      propertyName: reservation.property.name, ownerName: reservation.property.user.name || '',
      ownerEmail: reservation.property.user.email,
      checkIn: reservation.checkIn.toISOString(), checkOut: reservation.checkOut.toISOString(),
      nights: reservation.nights, totalPrice: reservation.totalPrice,
    }),
  ])

  return NextResponse.json({ received: true })
}
