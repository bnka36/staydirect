export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Papa from 'papaparse'
import { detectColumnMapping, parseFlexibleDate, parseFlexiblePrice, type FieldKey } from '@/lib/importReservations'

const MAX_ROWS = 2000

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const mappingOverride = formData.get('mapping') as string | null

  if (!file) return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 })
  if (!file.name.toLowerCase().endsWith('.csv')) {
    return NextResponse.json({ error: 'Seuls les fichiers .csv sont acceptés. Si votre fichier est en Excel (.xlsx), ouvrez-le et faites "Enregistrer sous" → CSV.' }, { status: 400 })
  }

  const text = await file.text()
  const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true })
  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    return NextResponse.json({ error: 'Fichier CSV illisible.' }, { status: 400 })
  }

  const [headers, ...dataRows] = parsed.data
  if (!headers || dataRows.length === 0) {
    return NextResponse.json({ error: 'Fichier vide ou sans données.' }, { status: 400 })
  }
  if (dataRows.length > MAX_ROWS) {
    return NextResponse.json({ error: `Trop de lignes (max ${MAX_ROWS}).` }, { status: 400 })
  }

  const mapping: Partial<Record<FieldKey, number>> = mappingOverride
    ? JSON.parse(mappingOverride)
    : detectColumnMapping(headers)

  const rows = dataRows.map(cols => {
    const get = (field: FieldKey) => (mapping[field] !== undefined ? cols[mapping[field]!]?.trim() : undefined)

    const guestName = get('guestName') || ''
    const checkInRaw = get('checkIn') || ''
    const checkOutRaw = get('checkOut') || ''
    const priceRaw = get('totalPrice') || ''
    const guestEmail = get('guestEmail') || ''

    const checkIn = parseFlexibleDate(checkInRaw)
    const checkOut = parseFlexibleDate(checkOutRaw)
    const totalPrice = parseFlexiblePrice(priceRaw)
    const nights = checkIn && checkOut ? Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000) : null

    let error: string | undefined
    if (!guestName) error = 'Nom du voyageur manquant'
    else if (!checkIn) error = 'Date d\'arrivée illisible'
    else if (!checkOut) error = 'Date de départ illisible'
    else if (nights !== null && nights <= 0) error = 'Départ avant ou égal à l\'arrivée'
    else if (totalPrice === null) error = 'Prix illisible'

    return {
      raw: cols,
      guestName,
      guestEmail,
      checkIn: checkIn ? checkIn.toISOString() : null,
      checkOut: checkOut ? checkOut.toISOString() : null,
      nights,
      totalPrice,
      valid: !error,
      error,
    }
  })

  return NextResponse.json({
    headers,
    mapping,
    rows,
    validCount: rows.filter(r => r.valid).length,
    totalCount: rows.length,
  })
}
