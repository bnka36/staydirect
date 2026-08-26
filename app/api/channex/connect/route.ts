export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createChannexProperty } from '@/lib/channex'
import { markPropertyDirty } from '@/lib/channexSync'

// Déclare un logement StayDirect côté Channex (propriété + type de chambre + tarif),
// et enregistre les identifiants renvoyés pour les synchros suivantes.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { propertyId } = await req.json()
  if (!propertyId) return NextResponse.json({ error: 'propertyId requis' }, { status: 400 })

  const [property, user] = await Promise.all([
    prisma.property.findFirst({ where: { id: propertyId, userId: session.user.id } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { channexApiKey: true } }),
  ])

  if (!property) return NextResponse.json({ error: 'Logement introuvable' }, { status: 404 })
  if (!user?.channexApiKey) {
    return NextResponse.json({ error: "Renseignez d'abord votre clé API Channex dans Mon site." }, { status: 400 })
  }
  if (property.channexPropertyId) {
    return NextResponse.json({ error: 'Ce logement est déjà connecté à Channex' }, { status: 400 })
  }

  try {
    const { propertyId: channexPropertyId, roomTypeId, ratePlanId } = await createChannexProperty(user.channexApiKey, {
      title: property.name,
      currency: 'EUR',
      country_code: property.country === 'France' ? 'FR' : property.country,
      city: property.city,
      address: property.address || undefined,
    })

    await prisma.property.update({
      where: { id: propertyId },
      data: { channexPropertyId, channexRoomTypeId: roomTypeId, channexRatePlanId: ratePlanId },
    })

    await markPropertyDirty(propertyId)

    return NextResponse.json({ ok: true, channexPropertyId, roomTypeId, ratePlanId })
  } catch (e) {
    console.error('Channex connect error:', e)
    return NextResponse.json({ error: 'Échec de la connexion à Channex — vérifiez votre clé API' }, { status: 502 })
  }
}
