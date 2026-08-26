// Client pour la Direct Booking API de SiteMinder — API en libre-service (pas de
// partenariat requis) : le client génère lui-même sa clé depuis son compte SiteMinder
// (Multi-Property Platform → Direct Booking → onglet API), et nous transmet cette clé.
//
// ⚠️ Endpoints "GET" (properties, room-types, room-rates, quotes) confirmés par la
// documentation publique SiteMinder. En revanche, aucun endpoint de création/mise à jour
// de réservation n'a pu être confirmé — l'accès réseau vers developer.siteminder.com est
// bloqué dans cet environnement, donc rien n'a pu être vérifié en direct. Tant que ce
// point n'est pas confirmé auprès du support SiteMinder, une réservation confirmée sur
// StayDirect n'est PAS répercutée automatiquement dans SiteMinder — voir README du module.

const SITEMINDER_API_BASE = process.env.SITEMINDER_API_BASE_URL || 'https://directbooking.siteminder.com/public-api/api'

class SiteminderError extends Error {
  constructor(message: string, public status: number, public body: unknown) {
    super(message)
  }
}

async function siteminderFetch(apiKey: string, path: string) {
  const res = await fetch(`${SITEMINDER_API_BASE}${path}`, {
    method: 'GET',
    headers: { 'x-sm-api-key': apiKey },
    signal: AbortSignal.timeout(15000),
  })

  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    throw new SiteminderError(`SiteMinder GET ${path} a échoué (${res.status})`, res.status, data)
  }

  return data
}

export interface SiteminderProperty {
  uuid: string
  name: string
}

export async function listSiteminderProperties(apiKey: string): Promise<SiteminderProperty[]> {
  const res = await siteminderFetch(apiKey, '/properties')
  return res?.data || res?.items || res || []
}

export async function getSiteminderRoomTypes(apiKey: string, propertyUuid: string) {
  const res = await siteminderFetch(apiKey, `/properties/${propertyUuid}/room-types`)
  return res?.data || res?.items || res || []
}

export async function getSiteminderRoomRates(apiKey: string, propertyUuid: string) {
  const res = await siteminderFetch(apiKey, `/properties/${propertyUuid}/room-rates`)
  return res?.data || res?.items || res || []
}

export interface SiteminderQuoteDay {
  date: string
  available: boolean
  price: number
}

// Récupère les tarifs + disponibilités réels pour une plage de dates, tels que gérés
// par le client dans SiteMinder (source de vérité conservée côté SiteMinder).
export async function getSiteminderQuotes(apiKey: string, propertyUuid: string, from: string, to: string): Promise<SiteminderQuoteDay[]> {
  const res = await siteminderFetch(apiKey, `/properties/${propertyUuid}/quotes?from=${from}&to=${to}`)
  const rows: Record<string, unknown>[] = res?.data || res?.items || res || []
  return rows.map(r => ({
    date: r.date as string,
    available: Number(r.available ?? r.availability ?? 0) > 0,
    price: Number(r.price ?? r.rate ?? r.amount ?? 0),
  }))
}
