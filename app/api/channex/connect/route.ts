export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createChannexProperty, createChannexRoomType, createChannexRatePlan } from '@/lib/channex'

// Connecter un logement StayDirect à Channex
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { propertyId, apiKey } = await req.json()
  if (!propertyId || !apiKey) return NextResponse.json({ error: 'propertyId et apiKey requis' }, { status: 400 })

  const property = await prisma.property.findFirst({
    where: { id: propertyId, userId: session.user.id },
  })
  if (!property) return NextResponse.json({ error: 'Logement introuvable' }, { status: 404 })

  try {
    // 1. Sauvegarder la clé API sur l'utilisateur
    await prisma.user.update({
      where: { id: session.user.id },
      data: { channexApiKey: apiKey },
    })

    // 2. Créer la propriété dans Channex
    const channexPropertyId = await createChannexProperty(apiKey, property.name, property.city, property.country)

    // 3. Créer le room type
    const channexRoomTypeId = await createChannexRoomType(apiKey, channexPropertyId, property.name, property.maxGuests, property.stock)

    // 4. Créer le rate plan
    const channexRatePlanId = await createChannexRatePlan(apiKey, channexPropertyId, channexRoomTypeId, 'Tarif Standard')

    // 5. Sauvegarder les IDs Channex sur le logement
    await prisma.property.update({
      where: { id: propertyId },
      data: { channexRoomTypeId, channexRatePlanId },
    })

    // 6. Sauvegarder l'ID propriété Channex sur l'utilisateur
    await prisma.user.update({
      where: { id: session.user.id },
      data: { channexPropertyId: channexPropertyId },
    })

    return NextResponse.json({ ok: true, channexPropertyId, channexRoomTypeId, channexRatePlanId })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur Channex' }, { status: 500 })
  }
}
