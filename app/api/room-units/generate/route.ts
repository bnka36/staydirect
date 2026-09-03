export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST — génère automatiquement N chambres (Ch01, Ch02...) pour un logement multi-unités.
// Complète jusqu'à atteindre "count" chambres au total, sans toucher aux chambres existantes.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { propertyId, count } = await req.json()
  const target = parseInt(count)
  if (!propertyId || !Number.isFinite(target) || target < 1) {
    return NextResponse.json({ error: 'Logement et nombre de chambres requis' }, { status: 400 })
  }
  if (target > 500) return NextResponse.json({ error: 'Trop de chambres à générer en une fois' }, { status: 400 })

  const property = await prisma.property.findFirst({ where: { id: propertyId, userId: session.user.id } })
  if (!property) return NextResponse.json({ error: 'Logement introuvable' }, { status: 404 })

  const existing = await prisma.roomUnit.findMany({ where: { propertyId }, select: { label: true } })
  const existingLabels = new Set(existing.map(r => r.label))
  const toCreate = Math.max(0, target - existing.length)

  if (toCreate === 0) {
    return NextResponse.json({ created: 0, message: 'Ce logement a déjà au moins ce nombre de chambres.' })
  }

  let n = 1
  const newLabels: string[] = []
  while (newLabels.length < toCreate) {
    const label = `Ch${String(n).padStart(2, '0')}`
    if (!existingLabels.has(label)) newLabels.push(label)
    n++
  }

  await prisma.roomUnit.createMany({
    data: newLabels.map((label, i) => ({ propertyId, label, order: existing.length + i })),
  })

  return NextResponse.json({ created: newLabels.length })
}
