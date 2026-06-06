export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

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
        include: { property: true },
      })

      // Bloquer les dates dans le calendrier
      const current = new Date(reservation.checkIn)
      while (current < reservation.checkOut) {
        await prisma.blockedDate.create({
          data: {
            propertyId: reservation.propertyId,
            date: new Date(current),
            source: 'direct',
          },
        }).catch(() => {}) // Ignorer si déjà existant
        current.setDate(current.getDate() + 1)
      }
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
