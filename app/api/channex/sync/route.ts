export const dynamic = 'force-dynamic'
export const maxDuration = 60
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { pushAri } from '@/lib/channex'
import { buildAriForProperty } from '@/lib/channexSync'

// Vercel Cron — regroupe tous les changements de prix/disponibilité accumulés depuis le
// dernier passage (Property.channexDirty) et les pousse en un seul appel par logement,
// pour rester sous la limite de 20 requêtes/minute imposée par Channex.
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const properties = await prisma.property.findMany({
    where: { channexDirty: true, channexPropertyId: { not: null } },
    include: { user: { select: { channexApiKey: true } } },
  })

  let synced = 0
  let errors = 0

  for (const property of properties) {
    const apiKey = property.user.channexApiKey
    if (!apiKey || !property.channexRoomTypeId || !property.channexRatePlanId) {
      errors++
      continue
    }

    try {
      const days = await buildAriForProperty(property.id)
      await pushAri(apiKey, property.channexRoomTypeId, property.channexRatePlanId, days)
      await prisma.property.update({
        where: { id: property.id },
        data: { channexDirty: false, channexSyncedAt: new Date() },
      })
      synced++
    } catch (e) {
      console.error(`Channex sync error for property ${property.id}:`, e)
      errors++
    }

    // Espacement pour rester sous la limite de 20 requêtes/minute de Channex.
    await new Promise(r => setTimeout(r, 3000))
  }

  return NextResponse.json({ success: true, synced, errors, total: properties.length })
}
