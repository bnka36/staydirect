export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH — activer/désactiver un code promo
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { id } = await params
  const { isActive } = await req.json()

  const updated = await prisma.guestPromoCode.updateMany({
    where: { id, userId: session.user.id },
    data: { isActive: !!isActive },
  })
  if (updated.count === 0) return NextResponse.json({ error: 'Code introuvable' }, { status: 404 })

  return NextResponse.json({ success: true })
}

// DELETE — supprimer un code promo
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { id } = await params
  await prisma.guestPromoCode.deleteMany({ where: { id, userId: session.user.id } })

  return NextResponse.json({ success: true })
}
