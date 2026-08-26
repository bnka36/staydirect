export const dynamic = 'force-dynamic'
export const maxDuration = 60
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSiteminderQuotes } from '@/lib/siteminder'

// Vercel Cron — SiteMinder reste la source de vérité des tarifs/disponibilités pour ces
// logements : on relit régulièrement les quotes et on répercute le résultat en local
// (PriceOverride + BlockedDate) pour que le site StayDirect et le tunnel de réservation
// affichent toujours les vrais prix/dispos gérés côté SiteMinder.
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const properties = await prisma.property.findMany({
    where: { siteminderPropertyId: { not: null } },
    include: { user: { select: { siteminderApiKey: true } } },
  })

  const from = new Date()
  from.setHours(12, 0, 0, 0)
  const to = new Date(from)
  to.setDate(to.getDate() + 365)
  const fromStr = from.toISOString().split('T')[0]
  const toStr = to.toISOString().split('T')[0]

  let synced = 0
  let errors = 0

  for (const property of properties) {
    if (!property.user.siteminderApiKey || !property.siteminderPropertyId) { errors++; continue }

    try {
      const quotes = await getSiteminderQuotes(property.user.siteminderApiKey, property.siteminderPropertyId, fromStr, toStr)

      for (const q of quotes) {
        const date = new Date(q.date)
        date.setHours(12, 0, 0, 0)

        if (q.price > 0) {
          await prisma.priceOverride.upsert({
            where: { propertyId_date: { propertyId: property.id, date } },
            update: { price: q.price },
            create: { propertyId: property.id, date, price: q.price },
          })
        }

        if (q.available) {
          // Libère la date si elle n'était bloquée que par SiteMinder (pas un blocage manuel/direct/iCal).
          await prisma.blockedDate.deleteMany({
            where: { propertyId: property.id, date, source: 'siteminder' },
          })
        } else {
          // Ne bloque que si rien d'autre (réservation directe, iCal, blocage manuel) ne
          // bloque déjà cette date — jamais écraser une source plus autoritaire.
          const existing = await prisma.blockedDate.findUnique({
            where: { propertyId_date: { propertyId: property.id, date } },
          })
          if (!existing) {
            await prisma.blockedDate.create({ data: { propertyId: property.id, date, source: 'siteminder' } })
          }
        }
      }

      await prisma.property.update({ where: { id: property.id }, data: { siteminderSyncedAt: new Date() } })
      synced++
    } catch (e) {
      console.error(`SiteMinder sync error for property ${property.id}:`, e)
      errors++
    }

    await new Promise(r => setTimeout(r, 1000))
  }

  return NextResponse.json({ success: true, synced, errors, total: properties.length })
}
