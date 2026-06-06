// v2.1
'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { formatPrice, formatDate } from '@/lib/utils'
import Calendar from '@/app/components/Calendar'

interface Property {
  id: string
  name: string
  description?: string
  address?: string
  city: string
  pricePerNight: number
  maxGuests: number
  isActive: boolean
  icalUrls: string[]
  images: string[]
  reservations: Reservation[]
}

interface Reservation {
  id: string
  guestName: string
  guestEmail: string
  checkIn: string
  checkOut: string
  nights: number
  totalPrice: number
  status: string
  property?: { name: string }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [tab, setTab] = useState<'overview' | 'properties' | 'reservations' | 'calendar'>('overview')
  const [loading, setLoading] = useState(true)
  const [showAddProperty, setShowAddProperty] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    }
  }, [status])

  const fetchData = async () => {
    const [propsRes, resvRes] = await Promise.all([
      fetch('/api/properties'),
      fetch('/api/reservations'),
    ])
    setProperties(await propsRes.json())
    setReservations(await resvRes.json())
    setLoading(false)
  }

  const syncIcal = async (propertyId: string) => {
    await fetch('/api/ical/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId }),
    })
    alert('Calendriers synchronisés !')
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Chargement...</div>
      </div>
    )
  }

  const totalRevenue = reservations
    .filter((r) => r.status === 'confirmed')
    .reduce((sum, r) => sum + r.totalPrice, 0)

  const upcomingReservations = reservations.filter(
    (r) => new Date(r.checkIn) >= new Date() && r.status === 'confirmed'
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-xl text-gray-900">StayDirect</span>
          </div>
          <div className="flex items-center gap-4">
            {session?.user?.slug && (
              <Link
                href={`/p/${session.user.slug}`}
                target="_blank"
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                Voir mon site public →
              </Link>
            )}
            <span className="text-gray-500 text-sm">{session?.user?.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-8 flex-wrap">
          {(['overview', 'calendar', 'properties', 'reservations'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'overview' ? "Vue d'ensemble" : t === 'calendar' ? '📅 Calendrier' : t === 'properties' ? 'Mes logements' : 'Réservations'}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="text-sm text-gray-500 mb-1">Revenus confirmés</div>
                <div className="text-3xl font-bold text-gray-900">{formatPrice(totalRevenue)}</div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="text-sm text-gray-500 mb-1">Logements actifs</div>
                <div className="text-3xl font-bold text-gray-900">
                  {properties.filter((p) => p.isActive).length}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="text-sm text-gray-500 mb-1">À venir</div>
                <div className="text-3xl font-bold text-gray-900">{upcomingReservations.length} séjour{upcomingReservations.length > 1 ? 's' : ''}</div>
              </div>
            </div>

            {upcomingReservations.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Prochains séjours</h2>
                <div className="space-y-3">
                  {upcomingReservations.slice(0, 5).map((r) => (
                    <div key={r.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <div>
                        <div className="font-medium text-gray-900">{r.guestName}</div>
                        <div className="text-sm text-gray-500">{r.property?.name} · {formatDate(r.checkIn)} → {formatDate(r.checkOut)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatPrice(r.totalPrice)}</div>
                        <div className="text-xs text-green-600 font-medium">Confirmé</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {properties.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                <div className="text-4xl mb-4">🏠</div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Ajoutez votre premier logement</h2>
                <p className="text-gray-500 mb-6">Créez votre page de réservation en quelques minutes</p>
                <button
                  onClick={() => { setTab('properties'); setShowAddProperty(true) }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Ajouter un logement
                </button>
              </div>
            )}
          </div>
        )}

        {/* Calendrier */}
        {tab === 'calendar' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Calendrier unifié</h2>
            <Calendar reservations={reservations} />
          </div>
        )}

        {/* Properties */}
        {tab === 'properties' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Mes logements</h2>
              <button
                onClick={() => setShowAddProperty(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                + Ajouter
              </button>
            </div>

            {showAddProperty && (
              <AddPropertyForm
                onClose={() => setShowAddProperty(false)}
                onSaved={() => { setShowAddProperty(false); fetchData() }}
              />
            )}

            {editingProperty && (
              <EditPropertyForm
                property={editingProperty}
                onClose={() => setEditingProperty(null)}
                onSaved={() => { setEditingProperty(null); fetchData() }}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {properties.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                  {/* Miniature photos */}
                  {p.images && p.images.length > 0 && (
                    <div className="flex gap-2 mb-4 overflow-x-auto">
                      {p.images.slice(0, 4).map((img, i) => (
                        <img key={i} src={img} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" alt="" />
                      ))}
                      {p.images.length > 4 && (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-xs text-gray-500">
                          +{p.images.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{p.name}</h3>
                      <p className="text-sm text-gray-500">{p.city}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-4">{formatPrice(p.pricePerNight)}<span className="text-sm font-normal text-gray-400">/nuit</span></div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingProperty(p)}
                      className="flex-1 text-sm border border-blue-200 text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition font-medium"
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      onClick={() => syncIcal(p.id)}
                      className="flex-1 text-sm border border-gray-200 py-2 rounded-lg hover:bg-gray-50 transition"
                    >
                      🔄 Sync iCal
                    </button>
                    <Link
                      href={`/p/${session?.user?.slug}`}
                      target="_blank"
                      className="flex-1 text-sm text-center border border-gray-200 py-2 rounded-lg hover:bg-gray-50 transition"
                    >
                      👁 Voir
                    </Link>
                  </div>
                  {p.icalUrls.length > 0 && (
                    <p className="text-xs text-gray-400 mt-2">{p.icalUrls.length} calendrier(s) connecté(s)</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reservations */}
        {tab === 'reservations' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Toutes les réservations</h2>
            {reservations.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                Aucune réservation pour le moment
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Voyageur</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Logement</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Dates</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Montant</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {reservations.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{r.guestName}</div>
                          <div className="text-xs text-gray-400">{r.guestEmail}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{r.property?.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(r.checkIn)} → {formatDate(r.checkOut)}<br />
                          <span className="text-xs text-gray-400">{r.nights} nuit{r.nights > 1 ? 's' : ''}</span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">{formatPrice(r.totalPrice)}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            r.status === 'confirmed' ? 'bg-green-50 text-green-700' :
                            r.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                            'bg-red-50 text-red-600'
                          }`}>
                            {r.status === 'confirmed' ? 'Confirmé' : r.status === 'pending' ? 'En attente' : 'Annulé'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function AddPropertyForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    pricePerNight: '',
    maxGuests: '2',
    icalUrls: '',
  })
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    setUploading(true)
    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) setImages(prev => [...prev, data.url])
    }
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        images,
        icalUrls: form.icalUrls ? form.icalUrls.split('\n').filter(Boolean) : [],
      }),
    })

    setLoading(false)
    onSaved()
  }

  return (
    <div className="bg-white rounded-2xl border border-blue-100 p-6 mb-6">
      <h3 className="font-semibold text-gray-900 mb-4">Nouveau logement</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom du logement</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Appartement vue mer à Nice" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3} placeholder="Décrivez votre logement..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
          <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nice" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="10 rue de la Mer" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prix par nuit (€)</label>
          <input required type="number" min="1" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="80" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nb voyageurs max</label>
          <input required type="number" min="1" value={form.maxGuests} onChange={(e) => setForm({ ...form, maxGuests: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Photos du logement</label>
          <input type="file" accept="image/*" multiple onChange={handleImageUpload}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {uploading && <p className="text-xs text-blue-500 mt-1">Upload en cours...</p>}
          {images.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {images.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} className="w-16 h-16 object-cover rounded-lg" alt="" />
                  <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Liens iCal (un par ligne)</label>
          <textarea value={form.icalUrls} onChange={(e) => setForm({ ...form, icalUrls: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            rows={3} placeholder="https://www.airbnb.fr/calendar/ical/...&#10;https://www.booking.com/calendar/ical/..." />
          <p className="text-xs text-gray-400 mt-1">Collez vos liens iCal Airbnb et Booking pour synchroniser les disponibilités</p>
        </div>
        <div className="col-span-2 flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
            Annuler
          </button>
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition">
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
}

function EditPropertyForm({ property, onClose, onSaved }: { property: Property; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: property.name,
    description: (property as any).description || '',
    address: (property as any).address || '',
    city: property.city,
    pricePerNight: property.pricePerNight.toString(),
    maxGuests: (property as any).maxGuests?.toString() || '2',
    icalUrls: property.icalUrls.join('\n'),
  })
  const [images, setImages] = useState<string[]>((property as any).images || [])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    setUploading(true)
    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) setImages(prev => [...prev, data.url])
    }
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch(`/api/properties/${property.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        images,
        icalUrls: form.icalUrls ? form.icalUrls.split('\n').filter(Boolean) : [],
      }),
    })
    setLoading(false)
    onSaved()
  }

  return (
    <div className="bg-white rounded-2xl border border-blue-100 p-6 mb-6">
      <h3 className="font-semibold text-gray-900 mb-4">Modifier — {property.name}</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom du logement</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
          <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prix/nuit (€)</label>
          <input required type="number" min="1" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nb voyageurs max</label>
          <input required type="number" min="1" value={form.maxGuests} onChange={(e) => setForm({ ...form, maxGuests: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Photos ({images.length} actuellement)</label>
          <input type="file" accept="image/*" multiple onChange={handleImageUpload}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {uploading && <p className="text-xs text-blue-500 mt-1">Upload en cours...</p>}
          {images.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {images.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} className="w-16 h-16 object-cover rounded-lg" alt="" />
                  <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Liens iCal (un par ligne)</label>
          <textarea value={form.icalUrls} onChange={(e) => setForm({ ...form, icalUrls: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" rows={3}
            placeholder="https://www.airbnb.fr/calendar/ical/..." />
        </div>
        <div className="col-span-2 flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Annuler</button>
          <button type="submit" disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition">
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  )
}
