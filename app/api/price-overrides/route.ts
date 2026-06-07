export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — récupérer les prix d'un logement
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const propertyId = searchParams.get('propertyId')
  if (!propertyId) return NextResponse.json({ error: 'propertyId requis' }, { status: 400 })

  const overrides = await prisma.priceOverride.findMany({
    where: { propertyId },
    orderBy: { date: 'asc' },
  })

  return NextResponse.json(overrides)
}

// POST — définir un prix pour une date (ou une plage)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { propertyId, date, dateEnd, price } = await req.json()
  if (!propertyId || !date || !price) return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })

  // Vérifier que le logement appartient au propriétaire
  const property = await prisma.property.findFirst({
    where: { id: propertyId, userId: session.user.id },
  })
  if (!property) return NextResponse.json({ error: 'Logement introuvable' }, { status: 404 })

  const results = []
  const start = new Date(date)
  const end = dateEnd ? new Date(dateEnd) : new Date(date)
  end.setHours(12, 0, 0, 0)

  const current = new Date(start)
  current.setHours(12, 0, 0, 0)

  while (current <= end) {
    const d = new Date(current)
    const result = await prisma.priceOverride.upsert({
      where: { propertyId_date: { propertyId, date: d } },
      create: { propertyId, date: d, price: parseFloat(price) },
      update: { price: parseFloat(price) },
    })
    results.push(result)
    current.setDate(current.getDate() + 1)
  }

  return NextResponse.json(results)
}

// DELETE — supprimer un prix spécial (revenir au prix de base)
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { propertyId, date } = await req.json()

  await prisma.priceOverride.deleteMany({
    where: { propertyId, date: new Date(date) },
  })

  return NextResponse.json({ success: true })
}
