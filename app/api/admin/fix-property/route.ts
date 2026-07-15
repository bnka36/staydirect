export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('secret') !== 'fix-property-2024-sd') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  const email = searchParams.get('email')
  const city = searchParams.get('city')
  const siteTitle = searchParams.get('siteTitle')
  if (!email) return NextResponse.json({ error: 'email requis' }, { status: 400 })

  const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } }, include: { properties: true } })
  if (!user) return NextResponse.json({ error: 'introuvable' }, { status: 404 })

  const updates: any = {}
  if (city) {
    await prisma.property.updateMany({ where: { userId: user.id }, data: { city } })
  }
  if (siteTitle) {
    await prisma.user.update({ where: { id: user.id }, data: { siteTitle } })
  }

  return NextResponse.json({ ok: true, email: user.email, properties: user.properties.length })
}
