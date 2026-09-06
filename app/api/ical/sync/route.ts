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

  if (property.icalUrls.length === 0) {
    return NextResponse.json({ error: 'Aucune URL iCal configurée pour ce logement. Ajoutez-en une dans les paramètres du logement.' }, { status: 400 })
  }

  let totalBlocked = 0
  let totalReservations = 0
  let totalSkippedExisting = 0
  let totalEventsFound = 0
  const errors: string[] = []

  for (const url of property.icalUrls) {
    const source = detectSource(url)
    try {
      const events = await ical.async.fromURL(url)
      const vevents = (Object.values(events) as any[]).filter(e => e && e.type === 'VEVENT')
      totalEventsFound += vevents.length

      for (const event of vevents) {
        if (!event.start || !event.end) continue

        const start = new Date(event.start)
        const end = new Date(event.end)
        const nights = getNights(start, end)
        if (nights <= 0) continue

        const summary = (event as any).summary || ''
        const isManualBlock = summary.toLowerCase() === 'blocked' || summary.toLowerCase() === 'unavailable'

        const ANONYMOUS = ['airbnb (not available)', 'not available', 'closed', 'fermé', 'reserved']
        const isAnonymous = !summary || ANONYMOUS.some(k => summary.toLowerCase().includes(k))
        const sourceLabel = source === 'airbnb' ? 'Airbnb' : source === 'booking' ? 'Booking.com' : source
        const guestName = isAnonymous ? `Client ${sourceLabel}` : summary

        if (!isManualBlock) {
          const uid = (event as any).uid as string | undefined
          // Une résa déjà connue (par UID iCal stable, ou par date si le flux ne fournit pas
          // d'UID) n'est JAMAIS retouchée par un sync suivant — sinon une modif ou suppression
          // faite par l'hôte reviendrait au sync suivant. Le calendrier StayDirect fait
          // autorité une fois la résa importée une première fois.
          const existing = uid
            ? await prisma.reservation.findFirst({ where: { propertyId, icalUid: uid } })
            : await prisma.reservation.findFirst({ where: { propertyId, checkIn: start } })

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
                icalUid: uid || null,
              },
            })
            totalReservations++
          } else {
            totalSkippedExisting++
          }
        }

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
    } catch (err: any) {
      errors.push(`Échec (${source}): ${err?.message || 'erreur inconnue'}`)
      console.error(`Erreur sync iCal:`, err)
    }
  }

  if (errors.length > 0 && totalEventsFound === 0) {
    return NextResponse.json({ error: errors.join(' | ') }, { status: 500 })
  }

  // Message détaillé pour aider au diagnostic
  let msg = ''
  if (totalEventsFound === 0) {
    msg = 'Calendrier vide — aucune réservation trouvée dans l\'URL iCal. Vérifiez que l\'URL est correcte et à jour.'
  } else if (totalReservations === 0 && totalSkippedExisting > 0) {
    msg = `${totalEventsFound} événements trouvés — déjà tous importés (${totalSkippedExisting} existants). ${totalBlocked} dates bloquées à jour.`
  } else {
    msg = `${totalReservations} nouvelle(s) résa importée(s), ${totalBlocked} dates bloquées.`
  }

  // Même en cas de succès partiel (une URL a marché, une autre non), il faut le dire —
  // sinon une URL en échec (ex: GreenGo) reste invisible tant qu'une autre URL fonctionne.
  if (errors.length > 0) {
    msg += ` ⚠️ ${errors.join(' | ')}`
  }

  return NextResponse.json({ success: true, blockedDates: totalBlocked, reservations: totalReservations, eventsFound: totalEventsFound, message: msg, errors: errors.length > 0 ? errors : undefined })
}
