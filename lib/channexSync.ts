import { prisma } from '@/lib/prisma'

// Marque un logement comme "à resynchroniser" vers Channex, au lieu de pousser
// immédiatement chaque changement (ce qui dépasserait vite la limite de 20 req/min
// imposée par Channex). Le job périodique /api/channex/sync regroupe ensuite tous les
// changements accumulés en un seul envoi par logement. Ne doit jamais faire échouer
// l'action principale de l'utilisateur : erreurs avalées volontairement.
export async function markPropertyDirty(propertyId: string) {
  try {
    await prisma.property.updateMany({
      where: { id: propertyId, channexPropertyId: { not: null } },
      data: { channexDirty: true },
    })
  } catch (e) {
    console.error('markPropertyDirty error:', e)
  }
}

export interface AriDay {
  date: string
  available: number
  price: number
}

// Calcule la disponibilité + le tarif des N prochains jours pour un logement,
// à partir de l'état actuel en base (dates bloquées, prix de base, surcharges).
export async function buildAriForProperty(propertyId: string, days = 365): Promise<AriDay[]> {
  const property = await prisma.property.findUnique({ where: { id: propertyId } })
  if (!property) return []

  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const horizon = new Date(today)
  horizon.setDate(horizon.getDate() + days)

  const [blockedDates, priceOverrides] = await Promise.all([
    prisma.blockedDate.findMany({
      where: { propertyId, date: { gte: today, lt: horizon } },
      select: { date: true },
    }),
    prisma.priceOverride.findMany({
      where: { propertyId, date: { gte: today, lt: horizon } },
      select: { date: true, price: true },
    }),
  ])

  const blocked = new Set(blockedDates.map(b => b.date.toISOString().split('T')[0]))
  const overridesByDate = new Map(priceOverrides.map(o => [o.date.toISOString().split('T')[0], o.price]))

  const result: AriDay[] = []
  const cur = new Date(today)
  while (cur < horizon) {
    const dateStr = cur.toISOString().split('T')[0]
    result.push({
      date: dateStr,
      available: property.isActive && !blocked.has(dateStr) ? 1 : 0,
      price: overridesByDate.get(dateStr) ?? property.pricePerNight,
    })
    cur.setDate(cur.getDate() + 1)
  }

  return result
}
