export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendCheckinReminder } from '@/lib/emails'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  const dayAfter = new Date(tomorrow)
  dayAfter.setDate(dayAfter.getDate() + 1)

  const reservations = await prisma.reservation.findMany({
    where: {
      status: 'confirmed',
      checkIn: { gte: tomorrow, lt: dayAfter },
      source: { in: [null, 'direct'] }, // uniquement réservations directes (pas iCal)
    },
    include: {
      property: { include: { user: true } },
    },
  })

  let sent = 0
  for (const r of reservations) {
    try {
      await sendCheckinReminder({
        guestName: r.guestName,
        guestEmail: r.guestEmail,
        propertyName: r.property.name,
        ownerName: r.property.user.name || 'Votre hôte',
        ownerEmail: r.property.user.email,
        checkIn: r.checkIn.toISOString(),
        checkOut: r.checkOut.toISOString(),
        nights: r.nights,
        totalPrice: r.totalPrice,
      })
      sent++
    } catch (e) {
      console.error('Reminder error:', e)
    }
  }

  return NextResponse.json({ success: true, sent, total: reservations.length })
}
