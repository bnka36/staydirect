'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { formatPrice } from '@/lib/utils'

interface Property {
  id: string
  name: string
  description: string
  city: string
  pricePerNight: number
  maxGuests: number
  images: string[]
  blockedDates: { date: string }[]
}

interface Owner {
  name: string
  slug: string
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
      .then((data) => {
        setOwner(data)
        setLoading(false)
      })
  }, [slug])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>
  if (!owner || owner.properties === undefined) return <div className="min-h-screen flex items-center justify-center text-gray-400">Page introuvable</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">{owner.name}</h1>
          <p className="text-gray-500 mt-1">Réservation directe · Paiement sécurisé · Aucune commission</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {owner.properties.length === 0 ? (
          <div className="text-center text-gray-400 py-20">Aucun logement disponible pour le moment.</div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {owner.properties.length} logement{owner.properties.length > 1 ? 's' : ''} disponible{owner.properties.length > 1 ? 's' : ''}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {owner.properties.map((p) => (
                <div key={p.id} id={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition">
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-5xl">
                    🏠
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{p.name}</h3>
                    <p className="text-gray-500 text-sm mb-1">📍 {p.city}</p>
                    <p className="text-gray-500 text-sm mb-4">👤 Jusqu'à {p.maxGuests} voyageurs</p>
                    {p.description && <p className="text-sm text-gray-600 mb-4 line-clamp-2">{p.description}</p>}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">{formatPrice(p.pricePerNight)}</span>
                        <span className="text-gray-400 text-sm">/nuit</span>
                      </div>
                      <button
                        onClick={() => setSelectedProperty(p)}
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition"
                      >
                        Réserver
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal réservation */}
      {selectedProperty && (
        <BookingModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}

      <footer className="text-center text-xs text-gray-300 py-8">
        Propulsé par <span className="font-semibold">StayDirect</span> · staydirect.fr
      </footer>
    </div>
  )
}

function BookingModal({ property, onClose }: { property: Property; onClose: () => void }) {
  const [form, setForm] = useState({
    checkIn: '',
    checkOut: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
  })
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

  const isDateBlocked = (date: string) => blockedDates.has(date)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (nights <= 0) {
      setError('Les dates sont invalides')
      setLoading(false)
      return
    }

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId: property.id, ...form }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Erreur lors de la réservation')
      setLoading(false)
      return
    }

    window.location.href = data.url
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Réserver</h2>
            <p className="text-sm text-gray-500">{property.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Arrivée</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={form.checkIn}
                onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Départ</label>
              <input
                type="date"
                required
                min={form.checkIn || new Date().toISOString().split('T')[0]}
                value={form.checkOut}
                onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {nights > 0 && (
            <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between">
              <span className="text-sm text-blue-700">{nights} nuit{nights > 1 ? 's' : ''}</span>
              <span className="font-bold text-blue-900">{formatPrice(nights * property.pricePerNight)}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Votre nom</label>
            <input
              required
              value={form.guestName}
              onChange={(e) => setForm({ ...form, guestName: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Jean Dupont"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              required
              type="email"
              value={form.guestEmail}
              onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="jean@exemple.fr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              value={form.guestPhone}
              onChange={(e) => setForm({ ...form, guestPhone: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+33 6 00 00 00 00"
            />
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}

          <button
            type="submit"
            disabled={loading || nights <= 0}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Redirection vers le paiement...' : `Payer ${nights > 0 ? formatPrice(nights * property.pricePerNight) : ''}`}
          </button>

          <p className="text-xs text-center text-gray-400">
            🔒 Paiement sécurisé par Stripe · Aucune commission
          </p>
        </form>
      </div>
    </div>
  )
}
