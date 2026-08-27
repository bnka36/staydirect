export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { createChannexProperty, createChannexRoomType, createChannexRatePlan } from '@/lib/channex'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('secret') !== 'extend-trial-2024-sd') {
    return NextResponse.json({ error: 'Non autorisÃ©' }, { status: 401 })
  }
  const slug = searchParams.get('slug')
  const apiKey = searchParams.get('key')
  if (!slug || !apiKey) return NextResponse.json({ error: 'slug et key requis' }, { status: 400 })

  const user = await prisma.user.findUnique({
    where: { slug },
    include: { properties: true },
  })
  if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  if (user.properties.length === 0) return NextResponse.json({ error: 'Aucun logement trouvÃ©' }, { status: 404 })

  const property = user.properties[0]

  try {
    const channexPropertyId = await createChannexProperty(apiKey, property.name, property.city, property.country)
    const channexRoomTypeId = await createChannexRoomType(apiKey, channexPropertyId, property.name, property.maxGuests, property.stock)
    const channexRatePlanId = await createChannexRatePlan(apiKey, channexPropertyId, channexRoomTypeId, 'Tarif Standard')

    await prisma.user.update({
      where: { id: user.id },
      data: { channexApiKey: apiKey, channexPropertyId },
    })

    await prisma.property.update({
      where: { id: property.id },
      data: { channexRoomTypeId, channexRatePlanId },
    })

    return NextResponse.json({ ok: true, channexPropertyId, channexRoomTypeId, channexRatePlanId, property: property.name })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
