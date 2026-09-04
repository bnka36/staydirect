export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getActiveRoomUnitCount } from '@/lib/roomUnits'

const VALID_SOURCES = ['direct', 'airbnb', 'booking', 'abritel', 'ical']
const MAX_ROWS = 2000

interface ImportRow {
  guestName: string
  guestEmail?: string
  checkIn: string
  checkOut: string
  totalPrice: number
  nights: number
}

// Import en masse de réservations passées (issues d'un fichier CSV) : à la différence de l'ajout
// manuel, on ne bloque pas l'import sur des conflits de dates — ce sont des résas déjà survenues,
// on veut juste reconstituer l'historique. Seule protection : ne pas dupliquer une résa déjà connue
// (même logique que la synchro iCal : une par logement+date d'arrivée).
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { propertyId, source, rows } = await req.json() as { propertyId: string; source?: string; rows: ImportRow[] }

  if (!propertyId || !Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'Logement et lignes requis' }, { status: 400 })
  }
  if (rows.length > MAX_ROWS) {
    return NextResponse.json({ error: `Trop de lignes (max ${MAX_ROWS}).` }, { status: 400 })
  }

  const property = await prisma.property.findFirst({ where: { id: propertyId, userId: session.user.id } })
  if (!property) return NextResponse.json({ error: 'Logement introuvable' }, { status: 404 })

  const finalSource = VALID_SOURCES.includes(source || '') ? source! : 'direct'
  const isMultiUnit = (await getActiveRoomUnitCount(propertyId)) > 0
  const today = new Date(); today.setHours(0, 0, 0, 0)

  let created = 0
  let skippedDuplicates = 0
  let skippedInvalid = 0

  for (const row of rows) {
    const start = new Date(row.checkIn)
    const end = new Date(row.checkOut)
    if (!row.guestName || isNaN(start.getTime()) || isNaN(end.getTime()) || !(start < end)) {
      skippedInvalid++
      continue
    }

    const existing = await prisma.reservation.findFirst({ where: { propertyId, checkIn: start } })
    if (existing) {
      skippedDuplicates++
      continue
    }

    await prisma.reservation.create({
      data: {
        propertyId,
        guestName: row.guestName,
        guestEmail: row.guestEmail || 'import@import.local',
        checkIn: start,
        checkOut: end,
        nights: row.nights || Math.round((end.getTime() - start.getTime()) / 86400000),
        totalPrice: row.totalPrice || 0,
        status: 'confirmed',
        source: finalSource,
        roomUnitId: null,
      },
    })
    created++

    if (!isMultiUnit && end >= today) {
      const current = new Date(start)
      while (current < end) {
        await prisma.blockedDate.upsert({
          where: { propertyId_date: { propertyId, date: new Date(current) } },
          update: {},
          create: { propertyId, date: new Date(current), source: 'manual' },
        })
        current.setDate(current.getDate() + 1)
      }
    }
  }

  return NextResponse.json({ success: true, created, skippedDuplicates, skippedInvalid })
}
