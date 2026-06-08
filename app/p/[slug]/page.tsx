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
  siteTitle?: string
  tagline?: string
  logo?: string
  theme?: string
  primaryColor?: string
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
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!owner?.properties) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">Page introuvable</div>
  )

  const theme = owner.theme || 'modern'
  const color = owner.primaryColor || '#2563eb'
  const title = owner.siteTitle || owner.name
  const tagline = owner.tagline || 'Réservation directe · Sans commission'

  return (
    <div className="min-h-screen" style={{ fontFamily: theme === 'luxury' ? 'Georgia, serif' : 'inherit' }}>
      <style>{`
        :root { --primary: ${color}; }
        .btn-primary { background-color: ${color}; }
        .btn-primary:hover { filter: brightness(0.9); }
        .text-primary { color: ${color}; }
        .border-primary { border-color: ${color}; }
        .bg-primary-light { background-color: ${color}15; }
      `}</style>

      {/* ══ THÈME MODERN ══ */}
      {theme === 'modern' && <ModernTheme owner={owner} title={title} tagline={tagline} color={color} onBook={setSelectedProperty} />}

      {/* ══ THÈME LUXURY ══ */}
      {theme === 'luxury' && <LuxuryTheme owner={owner} title={title} tagline={tagline} color={color} onBook={setSelectedProperty} />}

      {/* ══ THÈME NATURE ══ */}
      {theme === 'nature' && <NatureTheme owner={owner} title={title} tagline={tagline} color={color} onBook={setSelectedProperty} />}

      {/* ══ THÈME MINIMAL ══ */}
      {theme === 'minimal' && <MinimalTheme owner={owner} title={title} tagline={tagline} color={color} onBook={setSelectedProperty} />}

      {/* Modal réservation */}
      {selectedProperty && (
        <BookingModal property={selectedProperty} color={color} onClose={() => setSelectedProperty(null)} />
      )}

      {/* Footer */}
      <footer className="text-center py-6 border-t border-gray-100 mt-8">
        <Link href="/" className="text-xs text-gray-300 hover:text-gray-400 transition">
          Propulsé par <span className="font-semibold">StayDirect</span>
        </Link>
      </footer>
    </div>
  )
}

// ══════════════════════════════════════════
// THÈME 1 — MODERN (bleu, épuré)
// ══════════════════════════════════════════
function ModernTheme({ owner, title, tagline, color, onBook }: any) {
  return (
    <div className="bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {owner.logo ? (
              <img src={owner.logo} alt={title} className="h-9 w-auto object-contain" />
            ) : (
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md" style={{ backgroundColor: color }}>
                {title.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="font-bold text-gray-900 text-sm">{title}</div>
              <div className="text-xs text-gray-400">{tagline}</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-green-100">
            🔒 Paiement sécurisé
          </div>
        </div>
      </header>

      {/* Hero avec photo du 1er logement */}
      {owner.properties[0]?.images?.[0] && (
        <div className="relative h-72 md:h-96 overflow-hidden">
          <Image src={owner.properties[0].images[0]} alt={title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-8 left-6 right-6 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-1">{title}</h1>
            <p className="text-white/80">{tagline}</p>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-10">
        {owner.properties.length > 1 && (
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{owner.properties.length} logements disponibles</h2>
        )}
        <div className={owner.properties.length === 1 ? 'max-w-2xl mx-auto' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}>
          {owner.properties.map((p: Property) => (
            <ModernCard key={p.id} property={p} color={color} onBook={() => onBook(p)} />
          ))}
        </div>
      </div>
      <WhyDirect />
    </div>
  )
}

function ModernCard({ property, color, onBook }: { property: Property; color: string; onBook: () => void }) {
  const [idx, setIdx] = useState(0)
  const imgs = property.images || []
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition border border-gray-100 group">
      <div className="relative h-56 bg-gray-100">
        {imgs[idx] ? <Image src={imgs[idx]} alt={property.name} fill className="object-cover group-hover:scale-105 transition duration-500" /> : <div className="w-full h-full flex items-center justify-center text-4xl">🏠</div>}
        {imgs.length > 1 && <>
          <button onClick={() => setIdx(i => (i - 1 + imgs.length) % imgs.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition shadow">‹</button>
          <button onClick={() => setIdx(i => (i + 1) % imgs.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition shadow">›</button>
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">{idx + 1}/{imgs.length}</div>
        </>}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-lg mb-1">{property.name}</h3>
        <p className="text-sm text-gray-400 mb-3">📍 {property.city} · 👥 {property.maxGuests} pers.</p>
        {property.description && <p className="text-gray-500 text-sm mb-4 line-clamp-2">{property.description}</p>}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div><span className="text-2xl font-bold text-gray-900">{formatPrice(property.pricePerNight)}</span><span className="text-gray-400 text-sm"> / nuit</span></div>
          <button onClick={onBook} className="btn-primary text-white px-5 py-2.5 rounded-xl font-bold transition shadow-md">Réserver</button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════
// THÈME 2 — LUXURY (sombre, élégant)
// ══════════════════════════════════════════
function LuxuryTheme({ owner, title, tagline, color, onBook }: any) {
  return (
    <div className="bg-stone-950 text-white min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-stone-950/95 backdrop-blur border-b border-stone-800 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {owner.logo ? (
              <img src={owner.logo} alt={title} className="h-8 w-auto" />
            ) : (
              <div className="text-xl font-bold tracking-widest uppercase" style={{ color }}>{title}</div>
            )}
          </div>
          <div className="text-xs text-stone-400 tracking-widest uppercase">Réservation directe</div>
        </div>
      </header>

      {/* Hero */}
      {owner.properties[0]?.images?.[0] && (
        <div className="relative h-[60vh] overflow-hidden">
          <Image src={owner.properties[0].images[0]} alt={title} fill className="object-cover opacity-60" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <p className="text-stone-300 text-sm tracking-widest uppercase mb-4">{tagline}</p>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{title}</h1>
            <a href="#logements" className="border border-white text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-white hover:text-black transition">
              Découvrir
            </a>
          </div>
        </div>
      )}

      {/* Logements */}
      <div id="logements" className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-stone-500 text-xs tracking-widest uppercase mb-2">Nos propriétés</p>
          <h2 className="text-2xl font-bold">{owner.properties.length > 1 ? `${owner.properties.length} logements d'exception` : 'Votre logement'}</h2>
        </div>
        <div className={owner.properties.length === 1 ? 'max-w-2xl mx-auto' : 'grid grid-cols-1 md:grid-cols-2 gap-8'}>
          {owner.properties.map((p: Property) => (
            <LuxuryCard key={p.id} property={p} color={color} onBook={() => onBook(p)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function LuxuryCard({ property, color, onBook }: { property: Property; color: string; onBook: () => void }) {
  const [idx, setIdx] = useState(0)
  const imgs = property.images || []
  return (
    <div className="group cursor-pointer" onClick={onBook}>
      <div className="relative h-72 overflow-hidden mb-4">
        {imgs[idx] ? <Image src={imgs[idx]} alt={property.name} fill className="object-cover group-hover:scale-105 transition duration-700" /> : <div className="w-full h-full bg-stone-800 flex items-center justify-center text-4xl">🏠</div>}
        {imgs.length > 1 && (
          <div className="absolute bottom-3 right-3 flex gap-1">
            {imgs.map((_: any, i: number) => <button key={i} onClick={e => { e.stopPropagation(); setIdx(i) }} className={`w-1.5 h-1.5 rounded-full transition ${i === idx ? 'bg-white' : 'bg-white/40'}`} />)}
          </div>
        )}
      </div>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-white text-lg mb-1">{property.name}</h3>
          <p className="text-stone-400 text-sm">📍 {property.city} · 👥 {property.maxGuests} pers.</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold" style={{ color }}>{formatPrice(property.pricePerNight)}</div>
          <div className="text-stone-500 text-xs">/ nuit</div>
        </div>
      </div>
      <button className="mt-4 w-full border py-3 text-sm tracking-widest uppercase hover:bg-white hover:text-black transition" style={{ borderColor: color, color }} onClick={e => { e.stopPropagation(); onBook() }}>
        Réserver
      </button>
    </div>
  )
}

// ══════════════════════════════════════════
// THÈME 3 — NATURE (vert, organique)
// ══════════════════════════════════════════
function NatureTheme({ owner, title, tagline, color, onBook }: any) {
  const natureColor = color === '#2563eb' ? '#16a34a' : color
  return (
    <div className="bg-stone-50">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-stone-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {owner.logo ? <img src={owner.logo} alt={title} className="h-9 w-auto" /> : (
              <div className="font-bold text-xl" style={{ color: natureColor }}>{title}</div>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: `${natureColor}15`, color: natureColor }}>
            🌿 Réservation directe
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${natureColor}20, ${natureColor}05)` }}>
        <div className="max-w-5xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: natureColor }}>🌿 {tagline}</div>
            <h1 className="text-4xl md:text-5xl font-bold text-stone-800 mb-4 leading-tight">{title}</h1>
            <p className="text-stone-500 mb-6">Réservez directement et profitez du meilleur prix garanti</p>
            <a href="#logements" className="inline-block text-white px-6 py-3 rounded-2xl font-semibold transition" style={{ backgroundColor: natureColor }}>
              Voir les logements →
            </a>
          </div>
          {owner.properties[0]?.images?.[0] && (
            <div className="flex-1 relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-xl">
              <Image src={owner.properties[0].images[0]} alt={title} fill className="object-cover" />
            </div>
          )}
        </div>
      </div>

      <div id="logements" className="max-w-5xl mx-auto px-6 py-12">
        <div className={owner.properties.length === 1 ? 'max-w-2xl mx-auto' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}>
          {owner.properties.map((p: Property) => (
            <ModernCard key={p.id} property={p} color={natureColor} onBook={() => onBook(p)} />
          ))}
        </div>
      </div>
      <WhyDirect color={natureColor} />
    </div>
  )
}

// ══════════════════════════════════════════
// THÈME 4 — MINIMAL (blanc, typographie)
// ══════════════════════════════════════════
function MinimalTheme({ owner, title, tagline, color, onBook }: any) {
  return (
    <div className="bg-white">
      <header className="px-8 py-6 flex items-center justify-between border-b border-gray-100 max-w-5xl mx-auto">
        <div>
          {owner.logo ? <img src={owner.logo} alt={title} className="h-8 w-auto" /> : (
            <div className="text-xl font-bold tracking-tight text-gray-900">{title}</div>
          )}
          <div className="text-xs text-gray-400 mt-0.5">{tagline}</div>
        </div>
        <a href="#logements" className="text-sm font-semibold underline underline-offset-4" style={{ color }}>
          Voir les logements
        </a>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-16">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-none mb-4">{title}</h1>
          <p className="text-xl text-gray-400">{tagline}</p>
        </div>

        <div id="logements" className={owner.properties.length === 1 ? 'max-w-2xl' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}>
          {owner.properties.map((p: Property) => (
            <MinimalCard key={p.id} property={p} color={color} onBook={() => onBook(p)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function MinimalCard({ property, color, onBook }: { property: Property; color: string; onBook: () => void }) {
  const [idx, setIdx] = useState(0)
  const imgs = property.images || []
  return (
    <div className="group border border-gray-100 hover:border-gray-200 transition rounded-xl overflow-hidden">
      <div className="relative h-64 bg-gray-50 overflow-hidden">
        {imgs[idx] ? <Image src={imgs[idx]} alt={property.name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl text-gray-200">🏠</div>}
        {imgs.length > 1 && <>
          <button onClick={() => setIdx(i => (i - 1 + imgs.length) % imgs.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 opacity-0 group-hover:opacity-100 transition border border-gray-200">‹</button>
          <button onClick={() => setIdx(i => (i + 1) % imgs.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 opacity-0 group-hover:opacity-100 transition border border-gray-200">›</button>
        </>}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{property.name}</h3>
        <p className="text-sm text-gray-400 mb-4">{property.city} · {property.maxGuests} voyageurs</p>
        <div className="flex items-center justify-between">
          <div><span className="text-2xl font-bold text-gray-900">{formatPrice(property.pricePerNight)}</span><span className="text-gray-400 text-sm">/nuit</span></div>
          <button onClick={onBook} className="text-sm font-semibold px-5 py-2.5 rounded-lg border-2 transition" style={{ borderColor: color, color }} onMouseOver={e => { (e.target as HTMLElement).style.backgroundColor = color; (e.target as HTMLElement).style.color = 'white' }} onMouseOut={e => { (e.target as HTMLElement).style.backgroundColor = 'transparent'; (e.target as HTMLElement).style.color = color }}>
            Réserver →
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════
// SECTION "POURQUOI RÉSERVER EN DIRECT"
// ══════════════════════════════════════════
function WhyDirect({ color = '#2563eb' }: { color?: string }) {
  return (
    <section className="border-t border-gray-100 py-12 px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-center text-base font-bold text-gray-700 mb-8">Pourquoi réserver en direct ?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-center">
          {[
            { icon: '💰', title: 'Meilleur prix', desc: 'Pas de commission Airbnb ou Booking' },
            { icon: '🔒', title: 'Paiement sécurisé', desc: 'Stripe, leader mondial du paiement' },
            { icon: '📞', title: 'Contact direct', desc: 'Échangez directement avec le propriétaire' },
          ].map(item => (
            <div key={item.title} className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="font-semibold text-gray-900 text-sm mb-1">{item.title}</div>
              <div className="text-xs text-gray-400">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════
// CALENDRIER (sélection de plage de dates)
// ══════════════════════════════════════════
function BookingCalendar({ blockedDates, checkIn, checkOut, onSelect, color }: {
  blockedDates: string[]
  checkIn: string
  checkOut: string
  onSelect: (ci: string, co: string) => void
  color: string
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [hoverDate, setHoverDate] = useState('')

  const blocked = new Set(blockedDates.map(d => d.split('T')[0]))

  const toStr = (d: Date) => d.toISOString().split('T')[0]

  const isBlocked = (ds: string) => blocked.has(ds)
  const isPast = (ds: string) => ds < toStr(today)
  const isDisabled = (ds: string) => isBlocked(ds) || isPast(ds)

  const isInRange = (ds: string) => {
    if (!checkIn) return false
    const end = checkOut || hoverDate
    if (!end || end <= checkIn) return false
    return ds > checkIn && ds < end
  }
  const isStart = (ds: string) => ds === checkIn
  const isEnd = (ds: string) => ds === (checkOut || hoverDate)

  const handleClick = (ds: string) => {
    if (isDisabled(ds)) return
    if (!checkIn || (checkIn && checkOut)) {
      onSelect(ds, '')
    } else {
      if (ds <= checkIn) { onSelect(ds, ''); return }
      // Vérifier qu'aucune date bloquée n'est dans la plage
      const ci = new Date(checkIn), co = new Date(ds)
      let cur = new Date(ci); cur.setDate(cur.getDate() + 1)
      let hasBlocked = false
      while (cur < co) {
        if (blocked.has(toStr(cur))) { hasBlocked = true; break }
        cur.setDate(cur.getDate() + 1)
      }
      if (hasBlocked) { onSelect(ds, ''); return }
      onSelect(checkIn, ds)
    }
  }

  const getDays = (year: number, month: number) => {
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)
    const days: (string | null)[] = []
    const startDow = (first.getDay() + 6) % 7
    for (let i = 0; i < startDow; i++) days.push(null)
    for (let d = 1; d <= last.getDate(); d++) {
      days.push(toStr(new Date(year, month, d)))
    }
    return days
  }

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) } else setViewMonth(m => m - 1) }
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) } else setViewMonth(m => m + 1) }
  const canPrev = viewYear > today.getFullYear() || viewMonth > today.getMonth()

  const monthName = new Date(viewYear, viewMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const days = getDays(viewYear, viewMonth)
  const weekDays = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']

  return (
    <div className="select-none">
      {/* Navigation mois */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} disabled={!canPrev} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center disabled:opacity-30 transition text-gray-600">‹</button>
        <span className="font-semibold text-gray-900 capitalize text-sm">{monthName}</span>
        <button onClick={nextMonth} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition text-gray-600">›</button>
      </div>

      {/* Jours semaine */}
      <div className="grid grid-cols-7 mb-1">
        {weekDays.map(d => <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>)}
      </div>

      {/* Grille */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((ds, i) => {
          if (!ds) return <div key={i} />
          const disabled = isDisabled(ds)
          const start = isStart(ds)
          const end = isEnd(ds) && !!checkOut
          const inRange = isInRange(ds)
          const hover = ds === hoverDate && checkIn && !checkOut && ds > checkIn

          return (
            <button
              key={ds}
              type="button"
              disabled={disabled}
              onClick={() => handleClick(ds)}
              onMouseEnter={() => !disabled && setHoverDate(ds)}
              onMouseLeave={() => setHoverDate('')}
              className={`
                relative h-9 w-full text-xs font-medium rounded-lg transition-all
                ${disabled ? 'text-gray-200 cursor-not-allowed line-through' : 'cursor-pointer hover:opacity-80'}
                ${start || end ? 'text-white' : ''}
                ${inRange ? 'rounded-none' : ''}
                ${!disabled && !start && !end && !inRange ? 'text-gray-700 hover:bg-gray-100' : ''}
              `}
              style={{
                backgroundColor: start || end ? color : inRange ? `${color}20` : undefined,
                color: start || end ? 'white' : inRange ? color : undefined,
              }}
            >
              {parseInt(ds.split('-')[2])}
            </button>
          )
        })}
      </div>

      {/* Légende */}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-200" />
          <span>Indisponible</span>
        </div>
        {checkIn && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
            <span>Sélectionné</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════
// BOOKING MODAL (partagé entre tous les thèmes)
// ══════════════════════════════════════════
function BookingModal({ property, color, onClose }: { property: Property; color: string; onClose: () => void }) {
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [form, setForm] = useState({ guestName: '', guestEmail: '', guestPhone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'dates' | 'info'>('dates')

  const nights = checkIn && checkOut
    ? Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
    : 0

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''
  const blockedDates = property.blockedDates?.map(b => b.date) || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId: property.id, checkIn, checkOut, ...form }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Erreur'); setLoading(false); return }
    window.location.href = data.url
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-lg max-h-[95vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Réserver · {property.name}</h2>
            <p className="text-sm text-gray-400">{formatPrice(property.pricePerNight)}/nuit · {property.maxGuests} voyageurs max</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500 transition">✕</button>
        </div>

        <div className="p-6">
          {/* Résumé dates sélectionnées */}
          {(checkIn || checkOut) && (
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl border" style={{ backgroundColor: `${color}08`, borderColor: `${color}25` }}>
              <div className="flex-1 text-center">
                <div className="text-xs text-gray-400 font-semibold uppercase mb-0.5">Arrivée</div>
                <div className="font-bold text-sm" style={{ color }}>{checkIn ? fmtDate(checkIn) : '—'}</div>
              </div>
              <div className="text-gray-300">→</div>
              <div className="flex-1 text-center">
                <div className="text-xs text-gray-400 font-semibold uppercase mb-0.5">Départ</div>
                <div className="font-bold text-sm" style={{ color }}>{checkOut ? fmtDate(checkOut) : '—'}</div>
              </div>
              {nights > 0 && (
                <>
                  <div className="text-gray-300">·</div>
                  <div className="text-center">
                    <div className="font-black text-base" style={{ color }}>{formatPrice(nights * property.pricePerNight)}</div>
                    <div className="text-xs text-gray-400">{nights} nuit{nights > 1 ? 's' : ''}</div>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 'dates' ? (
            <>
              <p className="text-xs text-gray-500 mb-3 font-medium">
                {!checkIn ? '👆 Cliquez sur la date d\'arrivée' : !checkOut ? '👆 Cliquez maintenant sur la date de départ' : '✅ Dates sélectionnées — continuez'}
              </p>
              <BookingCalendar
                blockedDates={blockedDates}
                checkIn={checkIn}
                checkOut={checkOut}
                onSelect={(ci, co) => { setCheckIn(ci); setCheckOut(co) }}
                color={color}
              />
              <button
                type="button"
                disabled={nights <= 0}
                onClick={() => setStep('info')}
                className="w-full mt-5 py-3.5 rounded-xl font-bold text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: color }}
              >
                {nights > 0 ? `Continuer — ${formatPrice(nights * property.pricePerNight)} →` : 'Sélectionnez les dates'}
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <button type="button" onClick={() => setStep('dates')} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-2">
                ← Modifier les dates
              </button>

              {[
                { label: 'Nom complet', key: 'guestName', type: 'text', placeholder: 'Jean Dupont', required: true },
                { label: 'Email', key: 'guestEmail', type: 'email', placeholder: 'jean@exemple.fr', required: true },
                { label: 'Téléphone (optionnel)', key: 'guestPhone', type: 'tel', placeholder: '+33 6 00 00 00 00', required: false },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <input
                    type={field.type}
                    required={field.required}
                    placeholder={field.placeholder}
                    value={(form as any)[field.key]}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 text-sm"
                  />
                </div>
              ))}

              {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">⚠️ {error}</div>}

              <button type="submit" disabled={loading}
                className="w-full text-white py-4 rounded-xl font-bold transition disabled:opacity-50 text-base shadow-lg"
                style={{ backgroundColor: color }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Redirection...
                  </span>
                ) : `Payer ${formatPrice(nights * property.pricePerNight)} →`}
              </button>
              <p className="text-xs text-center text-gray-400">🔒 Paiement sécurisé par <strong>Stripe</strong></p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
