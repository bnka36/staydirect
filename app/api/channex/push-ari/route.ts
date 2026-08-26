export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { pushARI, formatDate } from '@/lib/channex'

// Pousser disponibilités + tarifs vers Channex pour les 365 prochains jours
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { propertyId } = await req.json()

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { channexApiKey: true, channexPropertyId: true },
  })

  const property = await prisma.property.findFirst({
    where: { id: propertyId, userId: session.user.id },
    include: {
      blockedDates: { where: { date: { gte: new Date() } } },
      priceOverrides: { where: { date: { gte: new Date() } } },
    },
  })

  if (!property) return NextResponse.json({ error: 'Logement introuvable' }, { status: 404 })
  if (!user?.channexApiKey) return NextResponse.json({ error: 'Clé API Channex manquante' }, { status: 400 })
  if (!property.channexRoomTypeId || !property.channexRatePlanId) {
    return NextResponse.json({ error: 'Logement non connecté à Channex. Connectez-le d\'abord.' }, { status: 400 })
  }

  const blockedSet = new Set(property.blockedDates.map(b => formatDate(b.date)))
  const priceMap = new Map(property.priceOverrides.map(p => [formatDate(p.date), p.price]))

  const updates = []
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    const ds = formatDate(d)
    updates.push({
      date: ds,
      available: property.stock,
      price: priceMap.get(ds) ?? property.pricePerNight,
      closed: blockedSet.has(ds),
    })
  }

  try {
    await pushARI(
      user.channexApiKey,
      user.channexPropertyId!,
      property.channexRoomTypeId,
      property.channexRatePlanId,
      updates
    )
    return NextResponse.json({ ok: true, daysUpdated: updates.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur Channex' }, { status: 500 })
  }
}
