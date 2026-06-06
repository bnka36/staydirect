export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { getNights } from '@/lib/utils'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { propertyId, checkIn, checkOut, guestName, guestEmail, guestPhone } = await req.json()

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { user: true },
  })

  if (!property) return NextResponse.json({ error: 'Logement introuvable' }, { status: 404 })

  const nights = getNights(new Date(checkIn), new Date(checkOut))
  const totalPrice = nights * property.pricePerNight

  // Vérifier disponibilité
  const blocked = await prisma.blockedDate.findFirst({
    where: {
      propertyId,
      date: { gte: new Date(checkIn), lt: new Date(checkOut) },
    },
  })

  const existingReservation = await prisma.reservation.findFirst({
    where: {
      propertyId,
      status: { in: ['pending', 'confirmed'] },
      OR: [
        { checkIn: { lte: new Date(checkIn) }, checkOut: { gt: new Date(checkIn) } },
        { checkIn: { lt: new Date(checkOut) }, checkOut: { gte: new Date(checkOut) } },
      ],
    },
  })

  if (blocked || existingReservation) {
    return NextResponse.json({ error: 'Dates non disponibles' }, { status: 400 })
  }

  // Créer la réservation en attente
  const reservation = await prisma.reservation.create({
    data: {
      propertyId,
      guestName,
      guestEmail,
      guestPhone,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      nights,
      totalPrice,
      status: 'pending',
    },
  })

  // Créer session Stripe
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${property.name} — ${nights} nuit${nights > 1 ? 's' : ''}`,
            description: `Du ${new Date(checkIn).toLocaleDateString('fr-FR')} au ${new Date(checkOut).toLocaleDateString('fr-FR')}`,
          },
          unit_amount: Math.round(totalPrice * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/reservation/success?id=${reservation.id}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/reservation/cancel?id=${reservation.id}`,
    metadata: { reservationId: reservation.id },
    customer_email: guestEmail,
  })

  // Sauvegarder l'ID de session Stripe
  await prisma.reservation.update({
    where: { id: reservation.id },
    data: { stripePaymentId: session.id },
  })

  return NextResponse.json({ url: session.url })
}
