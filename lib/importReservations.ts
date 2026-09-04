// Détection souple de colonnes pour l'import CSV de réservations (exports Airbnb/Booking/
// fichiers maison), FR/EN. On matche par inclusion sur un en-tête normalisé (minuscule, sans accents).

export type FieldKey = 'guestName' | 'checkIn' | 'checkOut' | 'totalPrice' | 'nights' | 'guestEmail'

const FIELD_ALIASES: Record<FieldKey, string[]> = {
  guestName: ['guest name', 'guest', 'nom', 'client', 'voyageur', 'name'],
  checkIn: ['check-in', 'checkin', 'arrivee', 'date arrivee', 'start date', 'date debut', 'arrival'],
  checkOut: ['check-out', 'checkout', 'depart', 'date depart', 'end date', 'date fin', 'departure'],
  totalPrice: ['payout', 'earnings', 'price', 'prix', 'montant', 'total', 'revenu', 'amount'],
  nights: ['nights', 'nuits', 'nuitees'],
  guestEmail: ['email', 'e-mail', 'courriel'],
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

export function detectColumnMapping(headers: string[]): Partial<Record<FieldKey, number>> {
  const normalized = headers.map(normalize)
  const mapping: Partial<Record<FieldKey, number>> = {}

  for (const field of Object.keys(FIELD_ALIASES) as FieldKey[]) {
    const aliases = FIELD_ALIASES[field]
    let bestIndex = -1
    for (let i = 0; i < normalized.length; i++) {
      if (aliases.some(a => normalized[i].includes(a))) {
        bestIndex = i
        break
      }
    }
    if (bestIndex !== -1) mapping[field] = bestIndex
  }

  return mapping
}

// Accepte ISO (2026-09-05), FR (05/09/2026 ou 05-09-2026) et US (09/05/2026 en dernier recours).
export function parseFlexibleDate(value: string): Date | null {
  if (!value) return null
  const v = value.trim()
  if (!v) return null

  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(v)
  if (iso) {
    const d = new Date(v)
    return isNaN(d.getTime()) ? null : d
  }

  const frMatch = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(v)
  if (frMatch) {
    const [, day, month, year] = frMatch
    const d = new Date(Number(year), Number(month) - 1, Number(day))
    return isNaN(d.getTime()) ? null : d
  }

  const d = new Date(v)
  return isNaN(d.getTime()) ? null : d
}

export function parseFlexiblePrice(value: string): number | null {
  if (!value) return null
  const cleaned = value.replace(/[€$\s]/g, '').replace(',', '.')
  const n = parseFloat(cleaned)
  return isNaN(n) ? null : n
}
