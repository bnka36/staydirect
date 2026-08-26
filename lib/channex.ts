// Client pour l'API Channex (channel manager multi-OTA : Airbnb, Booking.com, Expedia...).
//
// ⚠️ Implémenté à partir de la documentation publique connue de Channex (docs.channex.io).
// L'accès réseau sortant vers channex.io est bloqué dans cet environnement de développement,
// donc les noms exacts de champs/endpoints n'ont pas pu être vérifiés en direct. À tester
// contre un vrai compte staging Channex avant la certification / mise en production.

const CHANNEX_API_BASE = process.env.CHANNEX_API_BASE_URL || 'https://staging.channex.io/api/v1'

class ChannexError extends Error {
  constructor(message: string, public status: number, public body: unknown) {
    super(message)
  }
}

async function channexFetch(apiKey: string, method: string, path: string, body?: unknown) {
  const res = await fetch(`${CHANNEX_API_BASE}${path}`, {
    method,
    headers: {
      'user-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
  })

  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    throw new ChannexError(`Channex ${method} ${path} a échoué (${res.status})`, res.status, data)
  }

  return data
}

export interface ChannexPropertyInput {
  title: string
  currency: string // 'EUR'
  timezone?: string
  country_code?: string // 'FR'
  city?: string
  address?: string
}

// Déclare le logement comme "hôtel" côté Channex, avec un type de chambre et un tarif
// uniques (chaque Property StayDirect = un logement entier, pas un multi-chambres).
export async function createChannexProperty(apiKey: string, input: ChannexPropertyInput) {
  const property = await channexFetch(apiKey, 'POST', '/properties', {
    property: {
      title: input.title,
      currency: input.currency,
      timezone: input.timezone || 'Europe/Paris',
      country: input.country_code || 'FR',
      city: input.city,
      address: input.address,
    },
  })
  const propertyId = property?.data?.id
  if (!propertyId) throw new ChannexError('Réponse Channex sans id de propriété', 502, property)

  const roomType = await channexFetch(apiKey, 'POST', '/room_types', {
    room_type: {
      property_id: propertyId,
      title: 'Logement entier',
      count_of_rooms: 1,
      occ_adults: 1,
    },
  })
  const roomTypeId = roomType?.data?.id
  if (!roomTypeId) throw new ChannexError('Réponse Channex sans id de type de chambre', 502, roomType)

  const ratePlan = await channexFetch(apiKey, 'POST', '/rate_plans', {
    rate_plan: {
      title: 'Tarif standard',
      property_id: propertyId,
      room_type_id: roomTypeId,
      currency: input.currency,
      sell_mode: 'per_room',
    },
  })
  const ratePlanId = ratePlan?.data?.id
  if (!ratePlanId) throw new ChannexError('Réponse Channex sans id de tarif', 502, ratePlan)

  return { propertyId, roomTypeId, ratePlanId }
}

export interface AriDay {
  date: string // 'YYYY-MM-DD'
  available: number // 0 ou 1
  price: number
}

// Pousse la disponibilité + les tarifs pour une plage de jours. Un seul appel par
// propriété et par cycle de synchro, pour respecter la limite de 20 requêtes/minute.
export async function pushAri(apiKey: string, roomTypeId: string, ratePlanId: string, days: AriDay[]) {
  const values = days.map(d => ({
    property_id: undefined, // renseigné automatiquement par Channex via room_type_id/rate_plan_id
    date: d.date,
    availability: d.available,
    rate: d.price,
  }))

  return channexFetch(apiKey, 'POST', '/restrictions', {
    values: values.map(v => ({
      room_type_id: roomTypeId,
      rate_plan_id: ratePlanId,
      date: v.date,
      availability: v.availability,
      rate: v.rate,
    })),
  })
}

export async function getChannexBooking(apiKey: string, bookingId: string) {
  const res = await channexFetch(apiKey, 'GET', `/bookings/${bookingId}`)
  return res?.data
}

export async function listChannexBookings(apiKey: string, propertyId: string, sinceIso: string) {
  const res = await channexFetch(apiKey, 'GET', `/bookings?property_id=${encodeURIComponent(propertyId)}&updated_since=${encodeURIComponent(sinceIso)}`)
  return res?.data || []
}
