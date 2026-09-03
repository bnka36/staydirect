import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Limites par stock total (hotel/appart_hotel/camping) — même barème qu'à la création
const STOCK_LIMITS: Record<string, number> = {
  starter: 5,
  solo: 5,
  petit: 20,
  hotel: 20,
  pro: 50,
  business: 100,
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const data = await req.json()
  const newStock = parseInt(data.stock) || 1

  const existing = await prisma.property.findFirst({ where: { id, userId: session.user.id } })
  if (!existing) return NextResponse.json({ error: 'Logement introuvable' }, { status: 404 })

  if (newStock !== existing.stock) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    const plan = user?.plan || 'starter'
    const isTrial = !!(user?.planExpiresAt && new Date(user.planExpiresAt) > new Date())
    const stockLimit = isTrial ? Math.max(STOCK_LIMITS[plan] ?? 20, 20) : (STOCK_LIMITS[plan] ?? 20)
    const otherProps = await prisma.property.findMany({ where: { userId: session.user.id, id: { not: id } }, select: { stock: true } })
    const otherStock = otherProps.reduce((s, p) => s + (p.stock || 1), 0)
    if (otherStock + newStock > stockLimit) {
      return NextResponse.json({
        error: `Limite atteinte. Votre plan permet ${stockLimit} unités au total (vous en avez déjà ${otherStock} ailleurs). Passez à un plan supérieur.`,
        upgrade: true,
      }, { status: 403 })
    }
  }

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
      baseGuests: data.baseGuests ? parseInt(data.baseGuests) : null,
      pricePerExtraGuest: data.pricePerExtraGuest ? parseFloat(data.pricePerExtraGuest) : null,
      touristTaxEnabled: !!data.touristTaxEnabled,
      touristTaxPerAdult: data.touristTaxEnabled && data.touristTaxPerAdult ? parseFloat(data.touristTaxPerAdult) : null,
      amenities: data.amenities || [],
      icalUrls: data.icalUrls || [],
      images: data.images || [],
      isActive: data.isActive ?? true,
      stock: newStock,
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
