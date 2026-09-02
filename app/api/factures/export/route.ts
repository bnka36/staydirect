export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// TVA taux hébergement France
const TVA_HEBERGEMENT = 0.10 // 10%
const TVA_SERVICES = 0.20    // 20%

function calcTVA(totalTTC: number, taux: number) {
  const ht = totalTTC / (1 + taux)
  const tva = totalTTC - ht
  return { ht: Math.round(ht * 100) / 100, tva: Math.round(tva * 100) / 100, ttc: totalTTC, taux }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const year = searchParams.get('year') || new Date().getFullYear().toString()
  const format = searchParams.get('format') || 'csv'

  const properties = await prisma.property.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true },
  })
  const propertyIds = properties.map(p => p.id)

  const y = parseInt(year)
  const reservations = await prisma.reservation.findMany({
    where: {
      propertyId: { in: propertyIds },
      status: 'confirmed',
      checkIn: { gte: new Date(`${y}-01-01`), lt: new Date(`${y + 1}-01-01`) },
    },
    include: { property: { select: { name: true, city: true } } },
    orderBy: { checkIn: 'asc' },
  })

  if (format === 'csv') {
    // La taxe de séjour est hors base de TVA (collectée pour le compte de la commune) —
    // on l'exclut du calcul HT/TVA et on l'affiche dans sa propre colonne.
    const rows = [
      ['N° Facture', 'Date', 'Logement', 'Ville', 'Client', 'Email', 'Arrivée', 'Départ', 'Nuits', 'Montant TTC', 'HT (10%)', 'TVA 10%', 'Taxe de séjour', 'Source'].join(';'),
      ...reservations.map((r, i) => {
        const touristTax = r.touristTax || 0
        const { ht, tva } = calcTVA(r.totalPrice - touristTax, TVA_HEBERGEMENT)
        const num = `FAC-${y}-${String(i + 1).padStart(4, '0')}`
        return [
          num,
          new Date(r.createdAt).toLocaleDateString('fr-FR'),
          r.property.name,
          r.property.city,
          r.guestName,
          r.guestEmail,
          new Date(r.checkIn).toLocaleDateString('fr-FR'),
          new Date(r.checkOut).toLocaleDateString('fr-FR'),
          r.nights,
          r.totalPrice.toFixed(2) + ' €',
          ht.toFixed(2) + ' €',
          tva.toFixed(2) + ' €',
          touristTax.toFixed(2) + ' €',
          r.source,
        ].join(';')
      }),
    ]

    // Ligne totaux
    const totalTTC = reservations.reduce((s, r) => s + r.totalPrice, 0)
    const totalTouristTax = reservations.reduce((s, r) => s + (r.touristTax || 0), 0)
    const { ht: totalHT, tva: totalTVA } = calcTVA(totalTTC - totalTouristTax, TVA_HEBERGEMENT)
    rows.push(['', '', '', '', '', '', '', 'TOTAL', reservations.length + ' nuits', totalTTC.toFixed(2) + ' €', totalHT.toFixed(2) + ' €', totalTVA.toFixed(2) + ' €', totalTouristTax.toFixed(2) + ' €', ''].join(';'))

    const csv = '﻿' + rows.join('\n') // BOM pour Excel français
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="staydirect-ventes-${year}.csv"`,
      },
    })
  }

  return NextResponse.json({ error: 'Format non supporté' }, { status: 400 })
}
