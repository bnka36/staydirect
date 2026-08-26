import { prisma } from '@/lib/prisma'
import { sendNotificationToOwner } from '@/lib/emails'
import { markPropertyDirty } from '@/lib/channexSync'

// ⚠️ Champs du booking Channex inférés de la doc publique connue (arrival_date/
// departure_date, customer.name/surname/mail/phone, amount, ota_name) — non vérifiés
// en direct (accès réseau bloqué). À confirmer avec une vraie réservation Channex.
export interface ChannexBooking {
  id: string
  arrival_date?: string
  checkin?: string
  departure_date?: string
  checkout?: string
  customer?: { name?: string; surname?: string; mail?: string; phone?: string }
  amount?: number
  total?: number
  ota_name?: string
  channel_id?: string
}

// Enregistre (ou met à jour) une réservation OTA reçue via Channex : upsert idempotent
// sur channexBookingId, blocage des dates, marquage "à resynchroniser", notification hôte.
// Partagé entre le webhook temps réel et le repli par polling.
export async function reconcileChannexBooking(
  property: { id: string; name: string; user: { name: string | null; email: string } },
  booking: ChannexBooking
) {
  const checkIn = new Date(booking.arrival_date || booking.checkin || '')
  const checkOut = new Date(booking.departure_date || booking.checkout || '')
  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    console.error('reconcileChannexBooking: dates invalides', booking)
    return null
  }

  const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000))
  const guestName = [booking.customer?.name, booking.customer?.surname].filter(Boolean).join(' ') || 'Voyageur Channex'
  const guestEmail = booking.customer?.mail || 'channex@import.local'
  const guestPhone = booking.customer?.phone || null
  const totalPrice = Number(booking.amount ?? booking.total ?? 0)
  const source = (booking.ota_name || booking.channel_id || 'channex').toString().toLowerCase()

  const reservation = await prisma.reservation.upsert({
    where: { channexBookingId: booking.id },
    update: { guestName, guestEmail, guestPhone, checkIn, checkOut, nights, totalPrice, status: 'confirmed', source },
    create: {
      propertyId: property.id,
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      nights,
      totalPrice,
      status: 'confirmed',
      source,
      channexBookingId: booking.id,
    },
  })

  const current = new Date(checkIn)
  while (current < checkOut) {
    await prisma.blockedDate.upsert({
      where: { propertyId_date: { propertyId: property.id, date: new Date(current) } },
      update: { source },
      create: { propertyId: property.id, date: new Date(current), source },
    })
    current.setDate(current.getDate() + 1)
  }

  await markPropertyDirty(property.id)

  try {
    await sendNotificationToOwner({
      guestName: reservation.guestName,
      guestEmail: reservation.guestEmail,
      propertyName: property.name,
      ownerName: property.user.name || 'Hôte',
      ownerEmail: property.user.email,
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      nights,
      totalPrice,
    })
  } catch (e) {
    console.error('Email error (Channex booking):', e)
  }

  return reservation
}
