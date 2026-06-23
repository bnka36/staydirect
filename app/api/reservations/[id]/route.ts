export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const { guestName, guestEmail, guestPhone, totalPrice } = await req.json()

  const reservation = await prisma.reservation.findFirst({
    where: { id, property: { userId: session.user.id } },
  })
  if (!reservation) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  const updated = await prisma.reservation.update({
    where: { id },
    data: { guestName, guestEmail, guestPhone: guestPhone || null, ...(totalPrice !== undefined ? { totalPrice: Number(totalPrice) } : {}) },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params

  // Vérifier que la réservation appartient à l'utilisateur
  const reservation = await prisma.reservation.findFirst({
    where: { id, property: { userId: session.user.id } },
  })

  if (!reservation) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  await prisma.reservation.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
