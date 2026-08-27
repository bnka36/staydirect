export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('secret') !== 'extend-trial-2024-sd') {
    return NextResponse.json({ error: 'Non autorisÃ©' }, { status: 401 })
  }

  const email = searchParams.get('email')
  const name = searchParams.get('name')
  const city = searchParams.get('city')
  const price = searchParams.get('price')
  const stock = parseInt(searchParams.get('stock') || '1')

  if (!email || !name || !city || !price) {
    return NextResponse.json({ error: 'email, name, city, price requis' }, { status: 400 })
  }

  const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })
  if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })

  const property = await prisma.property.create({
    data: {
      userId: user.id,
      name,
      city,
      pricePerNight: parseFloat(price),
      maxGuests: 2,
      stock,
      isActive: true,
    },
  })

  return NextResponse.json({ ok: true, property })
}
