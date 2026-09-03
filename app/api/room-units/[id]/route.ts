export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH — modifier une chambre (nom, prix, capacité, active/inactive)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { id } = await params
  const data = await req.json()

  const roomUnit = await prisma.roomUnit.findFirst({ where: { id, property: { userId: session.user.id } } })
  if (!roomUnit) return NextResponse.json({ error: 'Chambre introuvable' }, { status: 404 })

  if (data.label !== undefined) {
    const trimmed = String(data.label).trim()
    if (!trimmed) return NextResponse.json({ error: 'Le nom ne peut pas être vide' }, { status: 400 })
    const conflict = await prisma.roomUnit.findFirst({ where: { propertyId: roomUnit.propertyId, label: trimmed, id: { not: id } } })
    if (conflict) return NextResponse.json({ error: 'Une chambre porte déjà ce nom' }, { status: 400 })
  }

  const updated = await prisma.roomUnit.update({
    where: { id },
    data: {
      ...(data.label !== undefined ? { label: String(data.label).trim() } : {}),
      ...(data.pricePerNight !== undefined ? { pricePerNight: data.pricePerNight ? parseFloat(data.pricePerNight) : null } : {}),
      ...(data.maxGuests !== undefined ? { maxGuests: data.maxGuests ? parseInt(data.maxGuests) : null } : {}),
      ...(data.isActive !== undefined ? { isActive: !!data.isActive } : {}),
    },
  })

  return NextResponse.json(updated)
}

// DELETE — supprimer une chambre (les réservations liées repassent en "non attribuée")
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { id } = await params
  const roomUnit = await prisma.roomUnit.findFirst({ where: { id, property: { userId: session.user.id } } })
  if (!roomUnit) return NextResponse.json({ error: 'Chambre introuvable' }, { status: 404 })

  await prisma.roomUnit.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
