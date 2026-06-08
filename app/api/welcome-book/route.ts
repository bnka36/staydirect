export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — récupérer le livret d'un logement
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const propertyId = searchParams.get('propertyId')
  if (!propertyId) return NextResponse.json({ error: 'propertyId requis' }, { status: 400 })

  // Vérifier que le logement appartient à l'utilisateur
  const property = await prisma.property.findFirst({
    where: { id: propertyId, userId: session.user.id },
  })
  if (!property) return NextResponse.json({ error: 'Logement introuvable' }, { status: 404 })

  const book = await prisma.welcomeBook.findUnique({ where: { propertyId } })
  return NextResponse.json(book || {})
}

// POST — créer ou mettre à jour le livret
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const body = await req.json()
  const { propertyId, ...data } = body
  if (!propertyId) return NextResponse.json({ error: 'propertyId requis' }, { status: 400 })

  const property = await prisma.property.findFirst({
    where: { id: propertyId, userId: session.user.id },
  })
  if (!property) return NextResponse.json({ error: 'Logement introuvable' }, { status: 404 })

  const book = await prisma.welcomeBook.upsert({
    where: { propertyId },
    update: { ...data, updatedAt: new Date() },
    create: { propertyId, ...data },
  })

  return NextResponse.json(book)
}
