export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ical from 'node-ical'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { propertyId } = await req.json()

  const property = await prisma.property.findFirst({
    where: { id: propertyId, userId: session.user.id },
  })

  if (!property) return NextResponse.json({ error: 'Logement introuvable' }, { status: 404 })

  let totalBlocked = 0

  for (const url of property.icalUrls) {
    try {
      const events = await ical.async.fromURL(url)

      for (const event of Object.values(events)) {
        if (!event || event.type !== 'VEVENT') continue
        if (!event.start || !event.end) continue

        const start = new Date(event.start)
        const end = new Date(event.end)

        // Créer les dates bloquées pour chaque nuit
        const current = new Date(start)
        while (current < end) {
          await prisma.blockedDate.upsert({
            where: {
              propertyId_date: { propertyId, date: new Date(current) },
            },
            update: {},
            create: {
              propertyId,
              date: new Date(current),
              source: 'ical',
            },
          })
          current.setDate(current.getDate() + 1)
          totalBlocked++
        }
      }
    } catch (err) {
      console.error(`Erreur sync iCal pour ${url}:`, err)
    }
  }

  return NextResponse.json({ success: true, blockedDates: totalBlocked })
}
