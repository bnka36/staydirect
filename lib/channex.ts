const CHANNEX_BASE = process.env.CHANNEX_STAGING === 'true'
  ? 'https://staging.channex.io/api/v1'
  : 'https://app.channex.io/api/v1'

export async function channexRequest(apiKey: string, method: string, path: string, body?: object) {
  const res = await fetch(`${CHANNEX_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'user-api-key': apiKey,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.errors?.[0]?.detail || JSON.stringify(data))
  return data
}

// Créer une propriété dans Channex
export async function createChannexProperty(apiKey: string, name: string, city: string, country: string) {
  const data = await channexRequest(apiKey, 'POST', '/properties', {
    property: {
      title: name,
      city,
      country_code: country === 'France' ? 'FR' : country === 'Espagne' ? 'ES' : country === 'Maroc' ? 'MA' : 'FR',
      currency: 'EUR',
      timezone: 'Europe/Paris',
      email: '',
      phone: '',
    },
  })
  return data.data?.id
}

// Créer un room type dans Channex
export async function createChannexRoomType(apiKey: string, propertyId: string, name: string, capacity: number, count: number) {
  const data = await channexRequest(apiKey, 'POST', '/room_types', {
    room_type: {
      property_id: propertyId,
      title: name,
      count_of_rooms: count,
      occ_adults: capacity,
      occ_children: 0,
      occ_infants: 0,
    },
  })
  return data.data?.id
}

// Créer un rate plan dans Channex
export async function createChannexRatePlan(apiKey: string, propertyId: string, roomTypeId: string, name: string) {
  const data = await channexRequest(apiKey, 'POST', '/rate_plans', {
    rate_plan: {
      property_id: propertyId,
      room_type_id: roomTypeId,
      title: name,
      currency: 'EUR',
      sell_mode: 'per_room',
    },
  })
  return data.data?.id
}

// Pousser disponibilités + tarifs vers Channex (ARI)
export async function pushARI(apiKey: string, propertyId: string, roomTypeId: string, ratePlanId: string, updates: {
  date: string // YYYY-MM-DD
  available: number
  price: number
  closed?: boolean
}[]) {
  const availability = updates.map(u => ({
    property_id: propertyId,
    room_type_id: roomTypeId,
    date: u.date,
    availability: u.closed ? 0 : u.available,
  }))

  const rates = updates.map(u => ({
    property_id: propertyId,
    rate_plan_id: ratePlanId,
    date: u.date,
    rate: u.price,
  }))

  await channexRequest(apiKey, 'POST', '/availability_bulk_update', { availability })
  await channexRequest(apiKey, 'POST', '/rate_bulk_update', { rates })
}

// Formater une date en YYYY-MM-DD
export function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}
