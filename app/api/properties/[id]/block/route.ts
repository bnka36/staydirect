export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { markPropertyDirty } from '@/lib/channexSync'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const { checkIn, checkOut } = await req.json()

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!property) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  const start = new Date(checkIn)
  const end = new Date(checkOut)
  let count = 0

  const current = new Date(start)
  while (current < end) {
    await prisma.blockedDate.upsert({
      where: { propertyId_date: { propertyId: id, date: new Date(current) } },
      create: { propertyId: id, date: new Date(current), source: 'manual' },
      update: { source: 'manual' },
    })
    current.setDate(current.getDate() + 1)
    count++
  }

  await markPropertyDirty(id)

  return NextResponse.json({ success: true, blocked: count })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const { checkIn, checkOut } = await req.json()

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!property) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  const start = new Date(checkIn)
  const end = new Date(checkOut)

  await prisma.blockedDate.deleteMany({
    where: {
      propertyId: id,
      source: 'manual',
      date: { gte: start, lt: end },
    },
  })

  await markPropertyDirty(id)

  return NextResponse.json({ success: true })
}
