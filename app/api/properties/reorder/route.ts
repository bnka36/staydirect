export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { orderedIds } = await req.json()
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return NextResponse.json({ error: 'orderedIds manquant' }, { status: 400 })
  }

  const owned = await prisma.property.findMany({
    where: { id: { in: orderedIds }, userId: session.user.id },
    select: { id: true },
  })
  if (owned.length !== orderedIds.length) {
    return NextResponse.json({ error: 'Logement introuvable' }, { status: 404 })
  }

  await prisma.$transaction(
    orderedIds.map((id: string, index: number) =>
      prisma.property.update({ where: { id }, data: { order: index } })
    )
  )

  return NextResponse.json({ success: true })
}
