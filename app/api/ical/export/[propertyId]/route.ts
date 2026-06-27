export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      reservations: {
        where: {
          status: 'confirmed',
          checkOut: { gte: new Date() },
        },
      },
      blockedDates: {
        where: { date: { gte: new Date() } },
      },
    },
  })

  if (!property) {
    return new NextResponse('Not found', { status: 404 })
  }

  const now = new Date()
  const stamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.staydirect.fr'

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//StayDirect//Export//FR`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${property.name}`,
    `X-WR-CALDESC:Disponibilités — ${property.name}`,
  ]

  // Ajouter les réservations confirmées
  for (const res of property.reservations) {
    const uid = `res-${res.id}@staydirect.fr`
    const dtStart = res.checkIn.toISOString().split('T')[0].replace(/-/g, '')
    const dtEnd = res.checkOut.toISOString().split('T')[0].replace(/-/g, '')
    const summary = res.source ? `Réservé (${res.source})` : 'Réservé — StayDirect'

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${dtStart}`,
      `DTEND;VALUE=DATE:${dtEnd}`,
      `SUMMARY:${summary}`,
      `STATUS:CONFIRMED`,
      'END:VEVENT'
    )
  }

  // Grouper les dates bloquées en périodes continues
  const blocked = property.blockedDates
    .map(b => b.date)
    .sort((a, b) => a.getTime() - b.getTime())

  if (blocked.length > 0) {
    let periodStart = blocked[0]
    let periodEnd = new Date(blocked[0])
    periodEnd.setDate(periodEnd.getDate() + 1)

    for (let i = 1; i < blocked.length; i++) {
      const prev = blocked[i - 1]
      const curr = blocked[i]
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000)

      if (diffDays === 1) {
        periodEnd = new Date(curr)
        periodEnd.setDate(periodEnd.getDate() + 1)
      } else {
        const uid = `block-${periodStart.toISOString().split('T')[0]}@staydirect.fr`
        const dtStart = periodStart.toISOString().split('T')[0].replace(/-/g, '')
        const dtEnd = periodEnd.toISOString().split('T')[0].replace(/-/g, '')
        lines.push(
          'BEGIN:VEVENT',
          `UID:${uid}`,
          `DTSTAMP:${stamp}`,
          `DTSTART;VALUE=DATE:${dtStart}`,
          `DTEND;VALUE=DATE:${dtEnd}`,
          'SUMMARY:Blocked',
          'STATUS:CONFIRMED',
          'END:VEVENT'
        )
        periodStart = curr
        periodEnd = new Date(curr)
        periodEnd.setDate(periodEnd.getDate() + 1)
      }
    }

    // Dernière période
    const uid = `block-${periodStart.toISOString().split('T')[0]}@staydirect.fr`
    const dtStart = periodStart.toISOString().split('T')[0].replace(/-/g, '')
    const dtEnd = periodEnd.toISOString().split('T')[0].replace(/-/g, '')
    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${dtStart}`,
      `DTEND;VALUE=DATE:${dtEnd}`,
      'SUMMARY:Blocked',
      'STATUS:CONFIRMED',
      'END:VEVENT'
    )
  }

  lines.push('END:VCALENDAR')

  return new NextResponse(lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="${property.name}.ics"`,
      'Cache-Control': 'no-cache, no-store',
    },
  })
}
