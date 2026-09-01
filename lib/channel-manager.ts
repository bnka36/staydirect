/**
 * Channel Manager abstraction layer.
 * StayDirect does not couple directly to any provider.
 * Switch providers by changing CHANNEL_MANAGER_PROVIDER env var.
 *
 * Providers: 'channex' | 'siteminder' | 'none'
 */

export type ChannelManagerProvider = 'channex' | 'siteminder' | 'none'

export interface CMProperty {
  id: string
  name: string
  city: string
  country: string
}

export interface CMRoomType {
  id: string
  propertyId: string
  name: string
  capacity: number
  count: number
}

export interface CMRatePlan {
  id: string
  propertyId: string
  roomTypeId: string
  name: string
  baseRate: number
}

export interface CMAvailabilityUpdate {
  date: string   // YYYY-MM-DD
  available: number
  closed?: boolean
}

export interface CMRateUpdate {
  date: string
  price: number
  minNights?: number
}

export interface CMReservation {
  externalId: string
  channel: string
  guestName: string
  guestEmail: string
  checkIn: string
  checkOut: string
  nights: number
  totalPrice: number
  roomTypeId?: string
  status: 'confirmed' | 'cancelled'
}

export interface ChannelManagerAdapter {
  connectProperty(apiKey: string, name: string, city: string, country: string): Promise<CMProperty>
  disconnectProperty(apiKey: string, propertyId: string): Promise<void>
  createRoomType(apiKey: string, propertyId: string, name: string, capacity: number, count: number): Promise<CMRoomType>
  createRatePlan(apiKey: string, propertyId: string, roomTypeId: string, name: string, baseRate: number): Promise<CMRatePlan>
  getChannels(apiKey: string, propertyId: string): Promise<string[]>
  updateAvailability(apiKey: string, propertyId: string, roomTypeId: string, updates: CMAvailabilityUpdate[]): Promise<void>
  updateRates(apiKey: string, propertyId: string, roomTypeId: string, ratePlanId: string, updates: CMRateUpdate[]): Promise<void>
  getReservations(apiKey: string, propertyId: string): Promise<CMReservation[]>
  handleWebhook(payload: unknown): CMReservation | null
}

// ── Channex adapter ──────────────────────────────────────────────────────────
// Real implementation delegated to lib/channex.ts functions.
// Only wired when CHANNEL_MANAGER_PROVIDER=channex.
class ChannexAdapter implements ChannelManagerAdapter {
  private base: string

  constructor() {
    this.base = process.env.CHANNEX_STAGING === 'true'
      ? 'https://staging.channex.io/api/v1'
      : 'https://app.channex.io/api/v1'
  }

  private async req(apiKey: string, method: string, path: string, body?: unknown) {
    const res = await fetch(`${this.base}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', 'user-api-key': apiKey },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) throw new Error(`Channex ${method} ${path} → ${res.status}`)
    return res.json()
  }

  async connectProperty(apiKey: string, name: string, city: string, country: string): Promise<CMProperty> {
    const data = await this.req(apiKey, 'POST', '/properties', {
      property: { title: name, city, country_code: country, currency: 'EUR', timezone: 'Europe/Paris', email: 'contact@staydirect.fr' }
    })
    return { id: data.data?.attributes?.id ?? data.data?.id, name, city, country }
  }

  async disconnectProperty(_apiKey: string, _propertyId: string): Promise<void> {
    // Channex does not support deletion via API — mark as inactive instead
  }

  async createRoomType(apiKey: string, propertyId: string, name: string, capacity: number, count: number): Promise<CMRoomType> {
    const data = await this.req(apiKey, 'POST', '/room_types', {
      room_type: { property_id: propertyId, title: name, occupancy: capacity, count_of_rooms: count }
    })
    const id = data.data?.id
    return { id, propertyId, name, capacity, count }
  }

  async createRatePlan(apiKey: string, propertyId: string, roomTypeId: string, name: string, baseRate: number): Promise<CMRatePlan> {
    const data = await this.req(apiKey, 'POST', '/rate_plans', {
      rate_plan: { property_id: propertyId, room_type_id: roomTypeId, title: name, options: [{ rate: baseRate, is_primary: true }] }
    })
    const id = data.data?.id
    return { id, propertyId, roomTypeId, name, baseRate }
  }

  async getChannels(apiKey: string, propertyId: string): Promise<string[]> {
    const data = await this.req(apiKey, 'GET', `/channels?filter[property_id]=${propertyId}`)
    return (data.data || []).map((c: any) => c.attributes?.title || c.id)
  }

  async updateAvailability(apiKey: string, propertyId: string, roomTypeId: string, updates: CMAvailabilityUpdate[]): Promise<void> {
    const values: Record<string, Record<string, number>> = {}
    updates.forEach(u => { values[u.date] = { [roomTypeId]: u.available } })
    await this.req(apiKey, 'POST', '/availability_bulk_update', {
      values, property_id: propertyId
    })
  }

  async updateRates(apiKey: string, propertyId: string, roomTypeId: string, ratePlanId: string, updates: CMRateUpdate[]): Promise<void> {
    const values: Record<string, Record<string, Record<string, number>>> = {}
    updates.forEach(u => {
      values[u.date] = { [ratePlanId]: { rate: u.price } }
    })
    await this.req(apiKey, 'POST', '/rate_bulk_update', {
      values, property_id: propertyId, room_type_id: roomTypeId
    })
  }

  async getReservations(_apiKey: string, _propertyId: string): Promise<CMReservation[]> {
    // Channex pushes via webhook — pull not typically needed
    return []
  }

  handleWebhook(payload: unknown): CMReservation | null {
    const p = payload as any
    if (p?.event !== 'booking' || !p?.payload) return null
    const b = p.payload
    return {
      externalId: b.booking_id || b.id,
      channel: b.ota_name || 'unknown',
      guestName: `${b.rooms?.[0]?.guest_name || 'Voyageur'}`,
      guestEmail: b.rooms?.[0]?.guest_email || '',
      checkIn: b.arrival_date,
      checkOut: b.departure_date,
      nights: b.nights || 1,
      totalPrice: parseFloat(b.amount || '0'),
      roomTypeId: b.rooms?.[0]?.room_type_id,
      status: b.status === 'cancelled' ? 'cancelled' : 'confirmed',
    }
  }
}

// ── SiteMinder adapter (stub — implement when docs available) ─────────────────
class SiteMinderAdapter implements ChannelManagerAdapter {
  private notImplemented(): never {
    throw new Error('SiteMinder adapter not yet implemented. Add implementation when API docs are available.')
  }
  async connectProperty() { return this.notImplemented() }
  async disconnectProperty() { return this.notImplemented() }
  async createRoomType() { return this.notImplemented() }
  async createRatePlan() { return this.notImplemented() }
  async getChannels() { return this.notImplemented() }
  async updateAvailability() { return this.notImplemented() }
  async updateRates() { return this.notImplemented() }
  async getReservations() { return this.notImplemented() }
  handleWebhook() { return null }
}

// ── No-op adapter (when no provider configured) ──────────────────────────────
class NoneAdapter implements ChannelManagerAdapter {
  private noop<T>(fallback: T) { return Promise.resolve(fallback) }
  async connectProperty() { return this.noop({} as CMProperty) }
  async disconnectProperty() { return this.noop(undefined) }
  async createRoomType() { return this.noop({} as CMRoomType) }
  async createRatePlan() { return this.noop({} as CMRatePlan) }
  async getChannels() { return this.noop([] as string[]) }
  async updateAvailability() { return this.noop(undefined) }
  async updateRates() { return this.noop(undefined) }
  async getReservations() { return this.noop([] as CMReservation[]) }
  handleWebhook() { return null }
}

// ── Factory ───────────────────────────────────────────────────────────────────
export function getChannelManager(): ChannelManagerAdapter {
  const provider = (process.env.CHANNEL_MANAGER_PROVIDER || 'channex') as ChannelManagerProvider
  switch (provider) {
    case 'channex': return new ChannexAdapter()
    case 'siteminder': return new SiteMinderAdapter()
    default: return new NoneAdapter()
  }
}
