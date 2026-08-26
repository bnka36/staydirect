export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Webhook Channex — reçoit les nouvelles réservations depuis Booking, Airbnb, etc.
export async function POST(req: Request) {
  const body = await req.json()

  try {
    const event = body?.event
    const booking = body?.payload

    if (event !== 'booking' || !booking) {
      return NextResponse.json({ ok: true, skipped: true })
    }

    const channexPropertyId = booking.property_id
    if (!channexPropertyId) return NextResponse.json({ ok: true })

    // Trouver le propriétaire via channexPropertyId
    const owner = await prisma.user.findFirst({
      where: { channexPropertyId },
      include: {
        properties: {
          where: { channexRoomTypeId: booking.rooms?.[0]?.room_type_id },
        },
      },
    })

    if (!owner || owner.properties.length === 0) {
      return NextResponse.json({ ok: true, skipped: 'property not found' })
    }

    const property = owner.properties[0]
    const checkIn = new Date(booking.arrival_date)
    const checkOut = new Date(booking.departure_date)
    const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000)
    const source = booking.ota_name?.toLowerCase().includes('booking') ? 'booking'
      : booking.ota_name?.toLowerCase().includes('airbnb') ? 'airbnb'
      : booking.ota_name?.toLowerCase() || 'channex'

    // Éviter les doublons
    const existing = await prisma.reservation.findFirst({
      where: { propertyId: property.id, checkIn, source },
    })
    if (existing) return NextResponse.json({ ok: true, skipped: 'duplicate' })

    // Créer la réservation
    await prisma.reservation.create({
      data: {
        propertyId: property.id,
        guestName: `${booking.guest?.first_name || ''} ${booking.guest?.last_name || ''}`.trim() || `Client ${source}`,
        guestEmail: booking.guest?.email || `${source}@import.channex`,
        guestPhone: booking.guest?.phone || null,
        checkIn,
        checkOut,
        nights,
        totalPrice: booking.amount || 0,
        status: 'confirmed',
        source,
      },
    })

    // Bloquer les dates
    const current = new Date(checkIn)
    while (current < checkOut) {
      await prisma.blockedDate.upsert({
        where: { propertyId_date: { propertyId: property.id, date: new Date(current) } },
        update: { source },
        create: { propertyId: property.id, date: new Date(current), source },
      })
      current.setDate(current.getDate() + 1)
    }

    return NextResponse.json({ ok: true, created: true })
  } catch (err: any) {
    console.error('Channex webhook error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
