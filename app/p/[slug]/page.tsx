'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

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
      .then(r => r.json())
      .then(data => { setOwner(data); setLoading(false) })
  }, [slug])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Chargement...</p>
      </div>
    </div>
  )

  if (!owner?.properties) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">Page introuvable</div>
  )

  const hasOneProperty = owner.properties.length === 1
  const heroProperty = hasOneProperty ? owner.properties[0] : null

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-blue-100">
              {owner.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm leading-tight">{owner.name}</div>
              <div className="text-xs text-gray-400">Réservation directe</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-green-100">
              🔒 Paiement sécurisé Stripe
            </div>
            {owner.properties.length > 1 && (
              <a href="#logements" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition">
                Voir les logements
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero — si 1 seul logement */}
      {heroProperty && heroProperty.images?.length > 0 && (
        <HeroSection property={heroProperty} onBook={() => setSelectedProperty(heroProperty)} />
      )}

      {/* Liste logements */}
      <section id="logements" className="max-w-5xl mx-auto px-6 py-12">
        {owner.properties.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏠</div>
            <p className="text-gray-400">Aucun logement disponible pour le moment.</p>
          </div>
        ) : (
          <>
            {owner.properties.length > 1 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  {owner.properties.length} logements disponibles
                </h2>
                <p className="text-gray-500 mt-1 text-sm">Réservez directement · Sans commission · Paiement sécurisé</p>
              </div>
            )}

            <div className={owner.properties.length === 1 ? 'max-w-2xl mx-auto' : 'grid grid-cols-1 md:grid-cols-2 gap-8'}>
              {owner.properties.map(p => (
                <PropertyCard key={p.id} property={p} onBook={() => setSelectedProperty(p)} single={hasOneProperty} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Pourquoi réserver en direct */}
      <section className="bg-blue-50 border-y border-blue-100 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h3 className="text-center text-lg font-bold text-gray-900 mb-8">Pourquoi réserver en direct ?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { icon: '💰', title: 'Meilleur prix', desc: 'Pas de commission Airbnb ou Booking. Vous payez le vrai prix.' },
              { icon: '🔒', title: 'Paiement sécurisé', desc: 'Stripe, le leader mondial du paiement en ligne.' },
              { icon: '📞', title: 'Contact direct', desc: 'Échangez directement avec le propriétaire.' },
            ].map(item => (
              <div key={item.title} className="bg-white rounded-2xl p-5 border border-blue-100">
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="font-bold text-gray-900 mb-1">{item.title}</div>
                <div className="text-sm text-gray-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal réservation */}
      {selectedProperty && (
        <BookingModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />
      )}

      {/* Footer */}
      <footer className="text-center py-8 mt-4 border-t border-gray-100">
        <Link href="/" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition text-sm">
          Propulsé par <span className="font-bold text-gray-500">StayDirect</span> · Réservations directes sans commission
        </Link>
      </footer>
    </div>
  )
}

// ── HERO section (1 logement avec grandes photos) ──
function HeroSection({ property, onBook }: { property: Property; onBook: () => void }) {
  const [imgIndex, setImgIndex] = useState(0)
  const images = property.images || []

  return (
    <div className="relative">
      {/* Grande photo hero */}
      <div className="relative h-[55vh] min-h-[380px] bg-gray-100 overflow-hidden">
        {images[imgIndex] && (
          <Image src={images[imgIndex]} alt={property.name} fill className="object-cover" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Flèches navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setImgIndex(i => (i - 1 + images.length) % images.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition shadow-md text-lg"
            >‹</button>
            <button
              onClick={() => setImgIndex(i => (i + 1) % images.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition shadow-md text-lg"
            >›</button>
          </>
        )}

        {/* Miniatures en bas */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={() => setImgIndex(i)}
                className={`w-2 h-2 rounded-full transition ${i === imgIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
              />
            ))}
          </div>
        )}

        {/* Compteur photos */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
            📷 {imgIndex + 1} / {images.length}
          </div>
        )}

        {/* Infos en bas de la photo */}
        <div className="absolute bottom-8 left-6 right-6 text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-1 drop-shadow">{property.name}</h1>
          <p className="text-white/80 text-sm">📍 {property.city}</p>
        </div>
      </div>

      {/* Bande miniatures si plusieurs photos */}
      {images.length > 1 && (
        <div className="hidden md:flex gap-2 px-6 py-3 bg-gray-50 border-b border-gray-100 overflow-x-auto">
          {images.map((url, i) => (
            <button key={i} onClick={() => setImgIndex(i)} className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition ${i === imgIndex ? 'border-blue-500' : 'border-transparent hover:border-gray-300'}`}>
              <Image src={url} alt="" width={80} height={56} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Prix + CTA sous la photo */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <span className="text-3xl font-bold text-gray-900">{formatPrice(property.pricePerNight)}</span>
              <span className="text-gray-400 text-sm"> / nuit</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>👥 {property.maxGuests} voyageurs max</span>
              {property.city && <span>📍 {property.city}</span>}
            </div>
          </div>
          <button
            onClick={onBook}
            className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-md shadow-blue-100 text-base whitespace-nowrap"
          >
            Réserver maintenant
          </button>
        </div>
      </div>

      {/* Description */}
      {property.description && (
        <div className="max-w-5xl mx-auto px-6 pb-8">
          <h2 className="font-bold text-gray-900 mb-3 text-lg">À propos de ce logement</h2>
          <p className="text-gray-600 leading-relaxed">{property.description}</p>
        </div>
      )}
    </div>
  )
}

// ── PROPERTY CARD (multi-logements) ──
function PropertyCard({ property, onBook, single }: { property: Property; onBook: () => void; single: boolean }) {
  const [imgIndex, setImgIndex] = useState(0)
  const images = property.images || []

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
      {/* Photo */}
      <div className="relative h-60 bg-gray-100 overflow-hidden">
        {images[imgIndex] ? (
          <Image src={images[imgIndex]} alt={property.name} fill className="object-cover group-hover:scale-105 transition duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-gray-300">🏠</div>
        )}

        {images.length > 1 && (
          <>
            <button onClick={() => setImgIndex(i => (i - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition shadow opacity-0 group-hover:opacity-100">‹</button>
            <button onClick={() => setImgIndex(i => (i + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition shadow opacity-0 group-hover:opacity-100">›</button>
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
              {imgIndex + 1}/{images.length}
            </div>
          </>
        )}
      </div>

      {/* Infos */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-gray-900 text-lg leading-tight">{property.name}</h3>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
          <span>📍 {property.city}</span>
          <span>👥 {property.maxGuests} pers.</span>
        </div>
        {property.description && (
          <p className="text-gray-500 text-sm mb-4 line-clamp-2">{property.description}</p>
        )}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div>
            <span className="text-2xl font-bold text-gray-900">{formatPrice(property.pricePerNight)}</span>
            <span className="text-gray-400 text-sm"> / nuit</span>
          </div>
          <button
            onClick={onBook}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-sm shadow-blue-100"
          >
            Réserver
          </button>
        </div>
      </div>
    </div>
  )
}

// ── BOOKING MODAL ──
function BookingModal({ property, onClose }: { property: Property; onClose: () => void }) {
  const [form, setForm] = useState({ checkIn: '', checkOut: '', guestName: '', guestEmail: '', guestPhone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [nights, setNights] = useState(0)

  const blockedDates = new Set(property.blockedDates.map(d => d.date.split('T')[0]))

  useEffect(() => {
    if (form.checkIn && form.checkOut) {
      const diff = (new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) / 86400000
      setNights(diff > 0 ? diff : 0)
    }
  }, [form.checkIn, form.checkOut])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    if (nights <= 0) { setError('Les dates sont invalides'); setLoading(false); return }

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId: property.id, ...form }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Une erreur est survenue'); setLoading(false); return }
    window.location.href = data.url
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-lg max-h-[95vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header modal */}
        <div className="sticky top-0 bg-white rounded-t-3xl md:rounded-t-2xl border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Réserver</h2>
            <p className="text-sm text-gray-400">{property.name}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition text-gray-500 font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Arrivée</label>
              <input type="date" required min={new Date().toISOString().split('T')[0]}
                value={form.checkIn} onChange={e => setForm({ ...form, checkIn: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Départ</label>
              <input type="date" required min={form.checkIn || new Date().toISOString().split('T')[0]}
                value={form.checkOut} onChange={e => setForm({ ...form, checkOut: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
          </div>

          {/* Récap prix */}
          {nights > 0 && (
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-blue-700">{formatPrice(property.pricePerNight)} × {nights} nuit{nights > 1 ? 's' : ''}</span>
                <span className="font-bold text-blue-900 text-lg">{formatPrice(nights * property.pricePerNight)}</span>
              </div>
              <div className="text-xs text-blue-500">✓ Pas de frais de service · Paiement sécurisé</div>
            </div>
          )}

          {/* Séparateur */}
          <div className="border-t border-gray-100 pt-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Vos coordonnées</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input required value={form.guestName} onChange={e => setForm({ ...form, guestName: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Jean Dupont" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input required type="email" value={form.guestEmail} onChange={e => setForm({ ...form, guestEmail: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="jean@exemple.fr" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone <span className="text-gray-400 font-normal">(optionnel)</span></label>
            <input value={form.guestPhone} onChange={e => setForm({ ...form, guestPhone: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="+33 6 00 00 00 00" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <button type="submit" disabled={loading || nights <= 0}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 text-base shadow-md shadow-blue-100">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Redirection vers le paiement...
              </span>
            ) : nights > 0 ? (
              `Payer ${formatPrice(nights * property.pricePerNight)} →`
            ) : 'Choisir les dates'}
          </button>

          <p className="text-xs text-center text-gray-400">🔒 Paiement 100% sécurisé par <strong>Stripe</strong></p>
        </form>
      </div>
    </div>
  )
}
