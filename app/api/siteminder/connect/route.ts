export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSiteminderRoomTypes, getSiteminderRoomRates } from '@/lib/siteminder'

// Lie un logement StayDirect à un hôtel SiteMinder existant (le client garde SiteMinder
// comme source de vérité pour les tarifs/disponibilités). On prend le premier type de
// chambre + tarif renvoyés, StayDirect ne gérant qu'un logement = une unité simple.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { propertyId, siteminderPropertyUuid } = await req.json()
  if (!propertyId || !siteminderPropertyUuid) {
    return NextResponse.json({ error: 'propertyId et siteminderPropertyUuid requis' }, { status: 400 })
  }

  const [property, user] = await Promise.all([
    prisma.property.findFirst({ where: { id: propertyId, userId: session.user.id } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { siteminderApiKey: true } }),
  ])

  if (!property) return NextResponse.json({ error: 'Logement introuvable' }, { status: 404 })
  if (!user?.siteminderApiKey) {
    return NextResponse.json({ error: "Renseignez d'abord votre clé API SiteMinder dans Mon site." }, { status: 400 })
  }

  try {
    const [roomTypes, roomRates] = await Promise.all([
      getSiteminderRoomTypes(user.siteminderApiKey, siteminderPropertyUuid),
      getSiteminderRoomRates(user.siteminderApiKey, siteminderPropertyUuid),
    ])

    const roomTypeId = roomTypes?.[0]?.id ?? roomTypes?.[0]?.uuid ?? null
    const roomRateId = roomRates?.[0]?.id ?? roomRates?.[0]?.uuid ?? null

    if (!roomTypeId || !roomRateId) {
      return NextResponse.json({ error: 'Aucun type de chambre ou tarif trouvé pour cet hôtel SiteMinder' }, { status: 502 })
    }

    await prisma.property.update({
      where: { id: propertyId },
      data: {
        siteminderPropertyId: siteminderPropertyUuid,
        siteminderRoomTypeId: roomTypeId,
        siteminderRoomRateId: roomRateId,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('SiteMinder connect error:', e)
    return NextResponse.json({ error: 'Échec de la connexion à SiteMinder' }, { status: 502 })
  }
}
