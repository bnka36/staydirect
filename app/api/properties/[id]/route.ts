import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const data = await req.json()
  const property = await prisma.property.updateMany({
    where: { id, userId: session.user.id },
    data: {
      name: data.name,
      description: data.description,
      address: data.address,
      city: data.city,
      country: data.country || 'France',
      pricePerNight: parseFloat(data.pricePerNight),
      maxGuests: parseInt(data.maxGuests),
      icalUrls: data.icalUrls || [],
      images: data.images || [],
      isActive: data.isActive ?? true,
    },
  })

  return NextResponse.json(property)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  await prisma.property.deleteMany({
    where: { id, userId: session.user.id },
  })

  return NextResponse.json({ success: true })
}
