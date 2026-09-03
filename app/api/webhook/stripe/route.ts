export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { sendConfirmationToGuest, sendNotificationToOwner } from '@/lib/emails'
import { planFromPriceId } from '@/lib/plans'
import { getActiveRoomUnitCount } from '@/lib/roomUnits'

export async function POST(req: Request) {
  const stripe = getStripe()
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

    // ── Paiement réservation ──
    if (session.mode === 'payment' && session.metadata?.reservationId) {
      const reservationId = session.metadata.reservationId
      const reservation = await prisma.reservation.update({
        where: { id: reservationId },
        data: { status: 'confirmed' },
        include: { property: { include: { user: true } } },
      })

      // Sur un logement multi-unités (hôtel), une résa confirmée occupe une chambre parmi
      // d'autres — bloquer toutes les dates du logement entier serait faux (empêcherait de
      // vendre les chambres restantes). La dispo y est calculée par comptage de réservations,
      // pas par BlockedDate.
      const activeRoomUnits = await getActiveRoomUnitCount(reservation.propertyId)
      if (activeRoomUnits === 0) {
        const current = new Date(reservation.checkIn)
        while (current < reservation.checkOut) {
          await prisma.blockedDate.create({
            data: { propertyId: reservation.propertyId, date: new Date(current), source: 'direct' },
          }).catch(() => {})
          current.setDate(current.getDate() + 1)
        }
      }

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

    // ── Abonnement activé ──
    if (session.mode === 'subscription' && session.metadata?.userId) {
      const plan = session.metadata.plan
      if (plan) {
        await prisma.user.update({
          where: { id: session.metadata.userId },
          data: { plan, planExpiresAt: null, stripeSubscriptionId: session.subscription as string },
        })
      }
    }
  }

  // ── Changement de plan (ex: via le portail Stripe "Gérer mon abonnement") ──
  // checkout.session.completed ne couvre que la création d'un nouvel abonnement ; quand un
  // abonné change de prix depuis le portail Stripe, c'est cet événement qui est émis — sans
  // ce handler, le plan affiché dans StayDirect ne bougeait jamais alors que Stripe facturait
  // déjà le nouveau tarif.
  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    const priceId = sub.items.data[0]?.price?.id
    const plan = priceId ? planFromPriceId(priceId) : null
    if (plan) {
      await prisma.user.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { plan, planExpiresAt: null },
      })
    }
  }

  // ── Abonnement annulé / expiré ──
  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    await prisma.user.updateMany({
      where: { stripeSubscriptionId: sub.id },
      data: { plan: 'starter', planExpiresAt: null },
    })
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
