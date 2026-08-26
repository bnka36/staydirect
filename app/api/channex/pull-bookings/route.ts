export const dynamic = 'force-dynamic'
export const maxDuration = 60
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { listChannexBookings } from '@/lib/channex'
import { reconcileChannexBooking } from '@/lib/channexBooking'

// Vercel Cron — filet de sécurité exigé par la certification Channex : si un webhook de
// réservation est manqué, ce job repasse vérifier les réservations récentes de chaque
// logement connecté toutes les 15-20 minutes.
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const properties = await prisma.property.findMany({
    where: { channexPropertyId: { not: null } },
    include: { user: { select: { channexApiKey: true, name: true, email: true } } },
  })

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString() // dernière heure, marge de sécurité
  let checked = 0
  let reconciled = 0
  let errors = 0

  for (const property of properties) {
    if (!property.user.channexApiKey || !property.channexPropertyId) continue
    checked++
    try {
      const bookings = await listChannexBookings(property.user.channexApiKey, property.channexPropertyId, since)
      for (const booking of bookings) {
        if (!booking?.id) continue
        await reconcileChannexBooking(property, booking)
        reconciled++
      }
    } catch (e) {
      console.error(`Channex pull-bookings error for property ${property.id}:`, e)
      errors++
    }
    await new Promise(r => setTimeout(r, 1000))
  }

  return NextResponse.json({ success: true, checked, reconciled, errors })
}
