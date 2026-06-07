export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { sendConfirmationToGuest, sendNotificationToOwner } from '@/lib/emails'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Webhook invalide' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const reservationId = session.metadata?.reservationId

    if (reservationId) {
      const reservation = await prisma.reservation.update({
        where: { id: reservationId },
        data: { status: 'confirmed' },
        include: { property: { include: { user: true } } },
      })

      // Bloquer les dates dans le calendrier
      const current = new Date(reservation.checkIn)
      while (current < reservation.checkOut) {
        await prisma.blockedDate.create({
          data: { propertyId: reservation.propertyId, date: new Date(current), source: 'direct' },
        }).catch(() => {})
        current.setDate(current.getDate() + 1)
      }

      // Envoyer les emails
      const emailData = {
        guestName: reservation.guestName,
        guestEmail: reservation.guestEmail,
        propertyName: reservation.property.name,
        ownerName: reservation.property.user.name || 'Propriétaire',
        ownerEmail: reservation.property.user.email,
        checkIn: reservation.checkIn.toISOString(),
        checkOut: reservation.checkOut.toISOString(),
        nights: reservation.nights,
        totalPrice: reservation.totalPrice,
      }

      await Promise.allSettled([
        sendConfirmationToGuest(emailData),
        sendNotificationToOwner(emailData),
      ])
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session
    const reservationId = session.metadata?.reservationId
    if (reservationId) {
      await prisma.reservation.update({
        where: { id: reservationId },
        data: { status: 'cancelled' },
      })
    }
  }

  return NextResponse.json({ received: true })
}
