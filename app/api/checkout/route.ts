export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { getNights } from '@/lib/utils'

const stripe = getStripe()

export async function POST(req: Request) {
  const { propertyId, checkIn, checkOut, guestName, guestEmail, guestPhone } = await req.json()

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { user: true },
  })

  if (!property) return NextResponse.json({ error: 'Logement introuvable' }, { status: 404 })

  const nights = getNights(new Date(checkIn), new Date(checkOut))

  // Calculer le prix total avec les prix dynamiques par jour
  const priceOverrides = await prisma.priceOverride.findMany({
    where: {
      propertyId,
      date: { gte: new Date(checkIn), lt: new Date(checkOut) },
    },
  })

  let totalPrice = 0
  const current = new Date(checkIn)
  current.setHours(12, 0, 0, 0)
  const end = new Date(checkOut)
  end.setHours(12, 0, 0, 0)

  while (current < end) {
    const dateStr = current.toISOString().split('T')[0]
    const override = priceOverrides.find(o => o.date.toISOString().split('T')[0] === dateStr)
    totalPrice += override ? override.price : property.pricePerNight
    current.setDate(current.getDate() + 1)
  }

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
      status: { in: ['confirmed'] },
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

  // Vérifier que le propriétaire a connecté son Stripe
  if (!property.user.stripeConnectId) {
    return NextResponse.json({ error: 'Le propriétaire n\'a pas encore connecté son compte Stripe.' }, { status: 400 })
  }

  // Commission StayDirect : 0% (abonnement déjà payé)
  const applicationFee = 0

  // Créer session Stripe vers le compte du propriétaire
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
    payment_intent_data: {
      application_fee_amount: applicationFee,
      transfer_data: { destination: property.user.stripeConnectId },
    },
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
