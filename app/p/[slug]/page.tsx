'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'

interface Property {
  id: string
  name: string
  description: string
  city: string
  country: string
  address: string
  pricePerNight: number
  maxGuests: number
  images: string[]
  blockedDates: { date: string }[]
}

interface Owner {
  name: string
  slug: string
  image: string
  properties: Property[]
}

export default function PublicPage() {
  const { slug } = useParams()
  const [owner, setOwner] = useState<Owner | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  useEffect(() => {
    fetch(`/api/public/${slug}`)
      .then((r) => r.json())
      .then((data) => { setOwner(data); setLoading(false) })
  }, [slug])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gray-400">Chargement...</div>
    </div>
  )
  if (!owner?.properties) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">Page introuvable</div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {owner.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-bold text-gray-900">{owner.name}</h1>
              <p className="text-xs text-gray-400">Réservation directe · 0% commission</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
            🔒 Paiement sécurisé
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {owner.properties.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <div className="text-5xl mb-4">🏠</div>
            <p>Aucun logement disponible pour le moment.</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {owner.properties.length === 1 ? 'Mon logement' : `Mes ${owner.properties.length} logements`}
              </h2>
              <p className="text-gray-500 mt-1">Réservez directement, sans intermédiaire</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {owner.properties.map((p) => (
                <PropertyCard key={p.id} property={p} onBook={() => setSelectedProperty(p)} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal réservation */}
      {selectedProperty && (
        <BookingModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />
      )}

      <footer className="text-center text-xs text-gray-300 py-8 mt-10 border-t border-gray-100">
        Propulsé par <span className="font-semibold text-gray-400">StayDirect</span> · Réservations directes sans commission
      </footer>
    </div>
  )
}

function PropertyCard({ property, onBook }: { property: Property; onBook: () => void }) {
  const [imgIndex, setImgIndex] = useState(0)

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100">
      {/* Photos */}
      <div className="relative h-56 bg-gradient-to-br from-blue-100 to-blue-50">
        {property.images && property.images.length > 0 ? (
          <>
            <Image
              src={property.images[imgIndex]}
              alt={property.name}
              fill
              className="object-cover"
            />
            {property.images.length > 1 && (
              <div className="absolute bottom-3 right-3 flex gap-1">
                {property.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={`w-2 h-2 rounded-full transition ${i === imgIndex ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            )}
            {property.images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIndex(i => Math.max(0, i - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center hover:bg-white transition"
                >‹</button>
                <button
                  onClick={() => setImgIndex(i => Math.min(property.images.length - 1, i + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center hover:bg-white transition"
                >›</button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🏠</div>
        )}
      </div>

      {/* Infos */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-gray-900 text-lg">{property.name}</h3>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
          <span>📍 {property.city}{property.country !== 'France' ? `, ${property.country}` : ''}</span>
          <span>👤 {property.maxGuests} pers. max</span>
        </div>
        {property.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{property.description}</p>
        )}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div>
            <span className="text-2xl font-bold text-gray-900">{formatPrice(property.pricePerNight)}</span>
            <span className="text-gray-400 text-sm"> / nuit</span>
          </div>
          <button
            onClick={onBook}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Réserver
          </button>
        </div>
      </div>
    </div>
  )
}

function BookingModal({ property, onClose }: { property: Property; onClose: () => void }) {
  const [form, setForm] = useState({ checkIn: '', checkOut: '', guestName: '', guestEmail: '', guestPhone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [nights, setNights] = useState(0)

  const blockedDates = new Set(property.blockedDates.map((d) => d.date.split('T')[0]))

  useEffect(() => {
    if (form.checkIn && form.checkOut) {
      const diff = (new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) / (1000 * 60 * 60 * 24)
      setNights(diff > 0 ? diff : 0)
    }
  }, [form.checkIn, form.checkOut])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    if (nights <= 0) { setError('Dates invalides'); setLoading(false); return }

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId: property.id, ...form }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Erreur'); setLoading(false); return }
    window.location.href = data.url
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-md max-h-[95vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl md:rounded-t-2xl">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Réserver</h2>
            <p className="text-sm text-gray-500">{property.name} · {formatPrice(property.pricePerNight)}/nuit</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Arrivée</label>
              <input type="date" required min={new Date().toISOString().split('T')[0]}
                value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Départ</label>
              <input type="date" required min={form.checkIn || new Date().toISOString().split('T')[0]}
                value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
          </div>

          {nights > 0 && (
            <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between">
              <div className="text-sm text-blue-700">{nights} nuit{nights > 1 ? 's' : ''}</div>
              <div className="font-bold text-blue-900 text-lg">{formatPrice(nights * property.pricePerNight)}</div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input required value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Jean Dupont" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input required type="email" value={form.guestEmail} onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="jean@exemple.fr" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input value={form.guestPhone} onChange={(e) => setForm({ ...form, guestPhone: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="+33 6 00 00 00 00" />
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

          <button type="submit" disabled={loading || nights <= 0}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-lg">
            {loading ? 'Redirection...' : nights > 0 ? `Payer ${formatPrice(nights * property.pricePerNight)}` : 'Choisir les dates'}
          </button>

          <p className="text-xs text-center text-gray-400">🔒 Paiement 100% sécurisé par Stripe</p>
        </form>
      </div>
    </div>
  )
}
