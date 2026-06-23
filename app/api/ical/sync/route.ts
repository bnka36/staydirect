export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ical from 'node-ical'

function detectSource(url: string): string {
  if (url.includes('airbnb')) return 'airbnb'
  if (url.includes('booking.com')) return 'booking'
  if (url.includes('abritel') || url.includes('vrbo')) return 'abritel'
  return 'ical'
}

function getNights(start: Date, end: Date) {
  return Math.round((end.getTime() - start.getTime()) / 86400000)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { propertyId } = await req.json()

  const property = await prisma.property.findFirst({
    where: { id: propertyId, userId: session.user.id },
  })

  if (!property) return NextResponse.json({ error: 'Logement introuvable' }, { status: 404 })

  let totalBlocked = 0
  let totalReservations = 0

  for (const url of property.icalUrls) {
    const source = detectSource(url)
    try {
      const events = await ical.async.fromURL(url)

      for (const event of Object.values(events)) {
        if (!event || event.type !== 'VEVENT') continue
        if (!event.start || !event.end) continue

        const start = new Date(event.start)
        const end = new Date(event.end)
        const nights = getNights(start, end)
        if (nights <= 0) continue

        const summary = (event as any).summary || ''
        const uid = (event as any).uid || `${source}-${start.toISOString()}-${propertyId}`

        // Blocage manuel sans voyageur → pas de réservation
        const isManualBlock = summary.toLowerCase() === 'blocked' || summary.toLowerCase() === 'unavailable'

        // Nom du voyageur — plateformes cachent souvent l'identité
        const ANONYMOUS = ['airbnb (not available)', 'not available', 'closed', 'fermé', 'reserved']
        const isAnonymous = !summary || ANONYMOUS.some(k => summary.toLowerCase().includes(k))
        const sourceLabel = source === 'airbnb' ? 'Airbnb' : source === 'booking' ? 'Booking.com' : source
        const guestName = isAnonymous ? `Client ${sourceLabel}` : summary

        // Créer ou mettre à jour la réservation iCal (sauf blocages manuels)
        if (!isManualBlock) {
          const existing = await prisma.reservation.findFirst({
            where: { propertyId, source, checkIn: start },
          })

          if (!existing) {
            await prisma.reservation.create({
              data: {
                propertyId,
                guestName,
                guestEmail: `${source}@import.local`,
                checkIn: start,
                checkOut: end,
                nights,
                totalPrice: 0,
                status: 'confirmed',
                source,
              },
            })
            totalReservations++
          }
        }

        // Bloquer les dates
        const current = new Date(start)
        while (current < end) {
          await prisma.blockedDate.upsert({
            where: { propertyId_date: { propertyId, date: new Date(current) } },
            update: { source },
            create: { propertyId, date: new Date(current), source },
          })
          current.setDate(current.getDate() + 1)
          totalBlocked++
        }
      }
    } catch (err) {
      console.error(`Erreur sync iCal pour ${url}:`, err)
    }
  }

  return NextResponse.json({ success: true, blockedDates: totalBlocked, reservations: totalReservations })
}
