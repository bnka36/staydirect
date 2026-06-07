// Vercel Cron Job - Auto sync iCal every 15 minutes
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import ical from 'node-ical'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: Request) {
  // Sécurité: vérifier le header Vercel Cron
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Récupérer tous les logements avec des liens iCal
    const properties = await prisma.property.findMany({
      where: { icalUrls: { isEmpty: false } },
      select: { id: true, name: true, icalUrls: true },
    })

    let synced = 0
    let errors = 0

    for (const property of properties) {
      for (const url of property.icalUrls) {
        try {
          const events = await ical.async.fromURL(url)
          for (const event of Object.values(events)) {
            if (!event || event.type !== 'VEVENT') continue
            const start = event.start instanceof Date ? event.start : new Date((event.start as unknown) as string)
            const end = event.end instanceof Date ? event.end : new Date((event.end as unknown) as string)
            if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) continue

            const dates: Date[] = []
            const current = new Date(start)
            while (current < end) {
              dates.push(new Date(current))
              current.setDate(current.getDate() + 1)
            }

            for (const date of dates) {
              await prisma.blockedDate.upsert({
                where: { propertyId_date: { propertyId: property.id, date } },
                create: { propertyId: property.id, date },
                update: {},
              })
            }
          }
          synced++
        } catch {
          errors++
        }
      }
    }

    return NextResponse.json({
      success: true,
      synced,
      errors,
      properties: properties.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
