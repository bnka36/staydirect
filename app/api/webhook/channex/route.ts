export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getChannexBooking } from '@/lib/channex'
import { reconcileChannexBooking } from '@/lib/channexBooking'

// Channex notifie ici qu'une réservation a changé (nouvelle résa OTA — Airbnb, Booking,
// Expedia...). On ne fait jamais confiance au contenu du webhook lui-même : on relit la
// réservation complète via l'API Channex avant de l'enregistrer, comme recommandé par
// leur doc de certification PMS.
//
// ⚠️ Forme exacte du payload non vérifiée en direct (accès réseau vers channex.io bloqué
// dans cet environnement) — à confirmer avec un vrai webhook Channex avant certification.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ received: true })

  const bookingId: string | undefined = body.booking_id || body.id || body.payload?.id || body.payload?.booking_id
  const channexPropertyId: string | undefined = body.property_id || body.payload?.property_id

  if (!bookingId || !channexPropertyId) {
    console.error('Webhook Channex: payload incomplet', body)
    return NextResponse.json({ received: true })
  }

  const property = await prisma.property.findFirst({
    where: { channexPropertyId },
    include: { user: { select: { channexApiKey: true, name: true, email: true } } },
  })

  if (!property || !property.user.channexApiKey) {
    console.error(`Webhook Channex: logement introuvable pour channexPropertyId=${channexPropertyId}`)
    return NextResponse.json({ received: true })
  }

  try {
    const booking = await getChannexBooking(property.user.channexApiKey, bookingId)
    if (booking) await reconcileChannexBooking(property, { ...booking, id: bookingId })
  } catch (e) {
    console.error('Webhook Channex error:', e)
  }

  return NextResponse.json({ received: true })
}
