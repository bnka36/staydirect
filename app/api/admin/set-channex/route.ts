export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('secret') !== 'extend-trial-2024-sd') {
    return NextResponse.json({ error: 'Non autorisÃ©' }, { status: 401 })
  }
  const slug = searchParams.get('slug')
  const apiKey = searchParams.get('key')
  const channexPropertyId = searchParams.get('propId')
  const channexRoomTypeId = searchParams.get('rtId')
  const channexRatePlanId = searchParams.get('rpId')

  if (!slug) return NextResponse.json({ error: 'slug requis' }, { status: 400 })

  const user = await prisma.user.findUnique({
    where: { slug },
    include: { properties: { take: 1 } },
  })
  if (!user) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(apiKey && { channexApiKey: apiKey }),
      ...(channexPropertyId && { channexPropertyId }),
    },
  })

  if (user.properties[0] && (channexRoomTypeId || channexRatePlanId)) {
    await prisma.property.update({
      where: { id: user.properties[0].id },
      data: {
        ...(channexRoomTypeId && { channexRoomTypeId }),
        ...(channexRatePlanId && { channexRatePlanId }),
      },
    })
  }

  // Also update businessType and property stock if provided
  const businessType = searchParams.get('businessType')
  const stock = searchParams.get('stock')
  if (businessType) {
    await prisma.user.update({ where: { slug: slug! }, data: { businessType } })
  }
  if (stock && user.properties[0]) {
    await prisma.property.update({ where: { id: user.properties[0].id }, data: { stock: parseInt(stock) } })
  }

  return NextResponse.json({ ok: true, slug, channexPropertyId, channexRoomTypeId, channexRatePlanId, businessType, stock })
}
