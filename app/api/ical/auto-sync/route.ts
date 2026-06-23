// Vercel Cron Job - Auto sync iCal every 15 minutes
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import ical from 'node-ical'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function detectSource(url: string): string {
  if (url.includes('airbnb')) return 'airbnb'
  if (url.includes('booking.com')) return 'booking'
  if (url.includes('abritel') || url.includes('vrbo')) return 'abritel'
  return 'ical'
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const properties = await prisma.property.findMany({
      where: { icalUrls: { isEmpty: false } },
      select: { id: true, name: true, icalUrls: true },
    })

    let synced = 0
    let errors = 0

    for (const property of properties) {
      for (const url of property.icalUrls) {
        const source = detectSource(url)
        try {
          const events = await ical.async.fromURL(url)
          for (const event of Object.values(events)) {
            if (!event || event.type !== 'VEVENT') continue
            const start = event.start instanceof Date ? event.start : new Date((event.start as unknown) as string)
            const end = event.end instanceof Date ? event.end : new Date((event.end as unknown) as string)
            if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) continue

            const nights = Math.round((end.getTime() - start.getTime()) / 86400000)
            if (nights <= 0) continue

            const summary = (event as any).summary || ''
            const isManualBlock = summary.toLowerCase() === 'blocked' || summary.toLowerCase() === 'unavailable'
            const ANONYMOUS = ['airbnb (not available)', 'not available', 'closed', 'fermé', 'reserved']
            const isAnonymous = !summary || ANONYMOUS.some(k => summary.toLowerCase().includes(k))
            const sourceLabel = source === 'airbnb' ? 'Airbnb' : source === 'booking' ? 'Booking.com' : source
            const guestName = isAnonymous ? `Client ${sourceLabel}` : summary

            // Créer réservation si pas un blocage manuel
            if (!isManualBlock) {
              const existing = await prisma.reservation.findFirst({
                where: { propertyId: property.id, source, checkIn: start },
              })
              if (!existing) {
                await prisma.reservation.create({
                  data: {
                    propertyId: property.id,
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
              }
            }

            // Bloquer les dates
            const current = new Date(start)
            while (current < end) {
              await prisma.blockedDate.upsert({
                where: { propertyId_date: { propertyId: property.id, date: new Date(current) } },
                create: { propertyId: property.id, date: new Date(current), source },
                update: { source },
              })
              current.setDate(current.getDate() + 1)
            }
          }
          synced++
        } catch {
          errors++
        }
      }
    }

    return NextResponse.json({ success: true, synced, errors, properties: properties.length, timestamp: new Date().toISOString() })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
