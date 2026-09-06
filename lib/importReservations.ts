// Détection souple de colonnes pour l'import CSV de réservations (exports Airbnb/Booking/
// fichiers maison), FR/EN. Chaque alias est une liste de mots qui doivent TOUS apparaître comme
// tokens dans l'en-tête (peu importe l'ordre ou les mots intercalés) — un simple `.includes()` sur
// la phrase entière échoue sur des en-têtes réels comme "Date de début" (le "de" casse le match
// contre l'alias "date debut").

export type FieldKey = 'guestName' | 'checkIn' | 'checkOut' | 'totalPrice' | 'nights' | 'guestEmail'

const FIELD_ALIASES: Record<FieldKey, string[][]> = {
  guestName: [['guest', 'name'], ['guest'], ['nom'], ['client'], ['voyageur']],
  checkIn: [['check', 'in'], ['arrivee'], ['date', 'debut'], ['start', 'date'], ['arrival']],
  checkOut: [['check', 'out'], ['depart'], ['date', 'fin'], ['end', 'date'], ['departure']],
  totalPrice: [['payout'], ['earnings'], ['price'], ['prix'], ['montant'], ['revenu'], ['revenus'], ['amount']],
  nights: [['nights'], ['nuits'], ['nuitees']],
  guestEmail: [['email'], ['e', 'mail'], ['courriel']],
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

function tokenize(s: string): Set<string> {
  return new Set(normalize(s).split(/[^a-z0-9]+/).filter(Boolean))
}

export function detectColumnMapping(headers: string[]): Partial<Record<FieldKey, number>> {
  const tokenSets = headers.map(tokenize)
  const mapping: Partial<Record<FieldKey, number>> = {}

  for (const field of Object.keys(FIELD_ALIASES) as FieldKey[]) {
    const aliasGroups = FIELD_ALIASES[field]
    let bestIndex = -1
    for (let i = 0; i < tokenSets.length; i++) {
      const matches = aliasGroups.some(group => group.every(word => tokenSets[i].has(word)))
      if (matches) { bestIndex = i; break }
    }
    if (bestIndex !== -1) mapping[field] = bestIndex
  }

  return mapping
}

const FR_MONTHS: Record<string, number> = {
  'janv': 0, 'janvier': 0, 'fevr': 1, 'fevrier': 1, 'mars': 2, 'avr': 3, 'avril': 3,
  'mai': 4, 'juin': 5, 'juil': 6, 'juillet': 6, 'aout': 7, 'sept': 8, 'septembre': 8,
  'oct': 9, 'octobre': 9, 'nov': 10, 'novembre': 10, 'dec': 11, 'decembre': 11,
}

// Accepte ISO (2026-09-05), FR numérique (05/09/2026 ou 05-09-2026), FR en lettres
// (6 sept. 2026, 6 septembre 2026 — format des exports Airbnb) et US en dernier recours.
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

  const frLettersMatch = /^(\d{1,2})\s+([a-zûéè.]+)\.?\s+(\d{4})$/i.exec(normalizeFrDate(v))
  if (frLettersMatch) {
    const [, day, monthRaw, year] = frLettersMatch
    const monthKey = monthRaw.replace(/\.$/, '')
    const month = FR_MONTHS[monthKey] ?? FR_MONTHS[monthKey.slice(0, 4)]
    if (month !== undefined) {
      const d = new Date(Number(year), month, Number(day))
      return isNaN(d.getTime()) ? null : d
    }
  }

  const d = new Date(v)
  return isNaN(d.getTime()) ? null : d
}

function normalizeFrDate(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function parseFlexiblePrice(value: string): number | null {
  if (!value) return null
  const cleaned = value.replace(/[€$\s]/g, '').replace(',', '.')
  const n = parseFloat(cleaned)
  return isNaN(n) ? null : n
}
