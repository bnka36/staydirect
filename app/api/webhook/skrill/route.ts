export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendConfirmationToGuest, sendNotificationToOwner } from '@/lib/emails'
import crypto from 'crypto'

// Skrill envoie un POST IPN (Instant Payment Notification)
export async function POST(req: Request) {
  const formData = await req.formData()
  const params = Object.fromEntries(formData.entries()) as Record<string, string>

  const {
    status,         // 2 = processed (payé), 0 = pending, -1 = cancelled, -2 = failed, -3 = chargeback
    reservationId,
    amount,
    currency,
    md5sig,
    merchant_id,
    transaction_id,
    mb_amount,
    mb_currency,
  } = params

  // Vérification MD5 (sécurité Skrill)
  const secretKey = process.env.SKRILL_SECRET_KEY
  if (secretKey && md5sig) {
    const expectedSig = crypto
      .createHash('md5')
      .update(
        (merchant_id || '') +
        (transaction_id || '') +
        (mb_amount || amount || '') +
        (mb_currency || currency || '') +
        (Number(status) || 0).toString() +
        crypto.createHash('md5').update(secretKey.toUpperCase()).digest('hex').toUpperCase()
      )
      .digest('hex')
      .toUpperCase()
    if (expectedSig !== (md5sig || '').toUpperCase()) {
      console.error('Skrill IPN: signature invalide')
      return new Response('INVALID', { status: 400 })
    }
  }

  // Seulement traiter les paiements confirmés
  if (status !== '2') {
    return new Response('OK', { status: 200 })
  }

  if (!reservationId) {
    return new Response('MISSING_ID', { status: 400 })
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { property: { include: { user: true } } },
  })

  if (!reservation || reservation.status === 'confirmed') {
    return new Response('OK', { status: 200 })
  }

  // Confirmer la réservation
  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: 'confirmed', stripePaymentId: `skrill_${transaction_id}` },
  })

  // Bloquer les dates
  const dates: Date[] = []
  const cur = new Date(reservation.checkIn)
  cur.setHours(12, 0, 0, 0)
  const end = new Date(reservation.checkOut)
  end.setHours(12, 0, 0, 0)
  while (cur < end) {
    dates.push(new Date(cur))
    cur.setDate(cur.getDate() + 1)
  }
  await Promise.all(
    dates.map(date =>
      prisma.blockedDate.upsert({
        where: { propertyId_date: { propertyId: reservation.propertyId, date } },
        update: {},
        create: { propertyId: reservation.propertyId, date, source: 'direct' },
      })
    )
  )

  // Emails
  const emailData = {
    guestName: reservation.guestName,
    guestEmail: reservation.guestEmail,
    propertyName: reservation.property.name,
    checkIn: reservation.checkIn.toISOString(),
    checkOut: reservation.checkOut.toISOString(),
    nights: reservation.nights,
    totalPrice: reservation.totalPrice,
    ownerEmail: reservation.property.user.email,
    ownerName: reservation.property.user.name || 'Hôte',
  }
  try {
    await sendConfirmationToGuest(emailData)
    await sendNotificationToOwner(emailData)
  } catch (e) {
    console.error('Email error:', e)
  }

  return new Response('OK', { status: 200 })
}
