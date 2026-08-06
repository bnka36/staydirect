// v3.0 - Dashboard Pro
'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/lib/utils'
import Calendar from '@/app/components/Calendar'
import PMSCalendar from '@/app/components/PMSCalendar'
import PriceCalendar from '@/app/components/PriceCalendar'
import PromoActivate from '@/app/components/PromoActivate'
import PromoAdmin from '@/app/components/PromoAdmin'
import WelcomeBookEditor from '@/app/components/WelcomeBookEditor'
import DepositsManager from '@/app/components/DepositsManager'

interface Property {
  id: string
  name: string
  description?: string
  address?: string
  city: string
  pricePerNight: number
  maxGuests: number
  stock: number
  isActive: boolean
  icalUrls: string[]
  images: string[]
  reservations: Reservation[]
  blockedDates?: { date: string; source: string }[]
}

interface Reservation {
  id: string
  guestName: string
  guestEmail: string
  guestPhone?: string | null
  checkIn: string
  checkOut: string
  nights: number
  totalPrice: number
  status: string
  source?: string
  propertyId?: string
  property?: { name: string; id: string }
}

type Tab = 'overview' | 'properties' | 'reservations' | 'calendar' | 'pricing' | 'analytics' | 'site' | 'settings' | 'promo-admin' | 'livret' | 'cautions'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [tab, setTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)
  const [showAddProperty, setShowAddProperty] = useState(false)

  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) setSidebarOpen(true)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  const [blockModal, setBlockModal] = useState<string | null>(null) // propertyId
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [syncResult, setSyncResult] = useState<{ id: string; ok: boolean; msg: string } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
      if (session?.user?.plan === 'livret') setTab('livret')
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
    setSyncingId(propertyId)
    setSyncResult(null)
    try {
      const res = await fetch('/api/ical/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSyncResult({ id: propertyId, ok: false, msg: data.error || 'Erreur lors de la synchronisation' })
      } else {
        setSyncResult({ id: propertyId, ok: true, msg: data.message || `✓ ${data.reservations ?? 0} résa · ${data.blockedDates ?? 0} dates bloquées` })
        fetchData()
      }
    } catch {
      setSyncResult({ id: propertyId, ok: false, msg: 'Erreur réseau — vérifiez votre connexion' })
    } finally {
      setSyncingId(null)
      setTimeout(() => setSyncResult(null), 4000)
    }
  }

  const deleteProperty = async (id: string) => {
    if (!confirm(`Supprimer ce ${propLabel} ? Cette action est irréversible.`)) return
    await fetch(`/api/properties/${id}`, { method: 'DELETE' })
    fetchData()
  }

  const deleteReservation = async (id: string) => {
    if (!confirm('Supprimer cette réservation ? Cette action est irréversible.')) return
    await fetch(`/api/reservations/${id}`, { method: 'DELETE' })
    fetchData()
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Chargement du dashboard...</p>
        </div>
      </div>
    )
  }

  // Blocage si essai expiré
  const planExpiresAt = session?.user?.planExpiresAt
  const isAdmin = session?.user?.isAdmin
  const trialExpired = !isAdmin && planExpiresAt && new Date(planExpiresAt) < new Date()
  if (trialExpired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Votre période d'essai est terminée</h1>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Pour continuer à utiliser StayDirect — réservations, calendrier, livret, cautions — choisissez un plan adapté à votre activité.
          </p>
          <a
            href="/pricing"
            className="block w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition mb-3 text-sm"
          >
            Choisir mon plan →
          </a>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-xs text-gray-400 hover:text-gray-600 transition"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    )
  }

  const confirmed = reservations.filter(r => r.status === 'confirmed')
  const totalRevenue = confirmed.reduce((s, r) => s + r.totalPrice, 0)
  const thisMonth = confirmed.filter(r => {
    const d = new Date(r.checkIn)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const monthRevenue = thisMonth.reduce((s, r) => s + r.totalPrice, 0)
  const upcoming = reservations.filter(r => new Date(r.checkIn) >= new Date() && r.status === 'confirmed')
  const pending = reservations.filter(r => r.status === 'pending')

  const isLivretOnly = session?.user?.plan === 'livret'

  const btype = (session?.user as any)?.businessType || 'meuble'
  const propLabel = btype === 'hotel' ? 'chambre' : btype === 'appart_hotel' ? 'studio' : btype === 'camping' ? 'emplacement' : btype === 'maison_hotes' || btype === 'chambre_hotes' ? 'chambre' : 'logement'
  const propLabelPlural = propLabel + (propLabel === 'chambre' ? 's' : propLabel === 'studio' ? 's' : propLabel === 'emplacement' ? 's' : 's')
  const PropLabel = propLabel.charAt(0).toUpperCase() + propLabel.slice(1)
  const PropLabelPlural = propLabelPlural.charAt(0).toUpperCase() + propLabelPlural.slice(1)

  const navItems: { key: Tab; icon: string; label: string }[] = [
    ...(!isLivretOnly ? [
      { key: 'overview' as Tab, icon: '⊞', label: 'Vue d\'ensemble' },
      { key: 'calendar' as Tab, icon: '📅', label: 'Calendrier' },
      { key: 'properties' as Tab, icon: '🏠', label: `Mes ${propLabelPlural}` },
      { key: 'reservations' as Tab, icon: '📋', label: 'Réservations' },
      { key: 'pricing' as Tab, icon: '💰', label: 'Prix dynamiques' },
      { key: 'analytics' as Tab, icon: '📊', label: 'Analytics' },
      { key: 'site' as Tab, icon: '🌐', label: 'Mon site' },
    ] : []),
    { key: 'livret', icon: '📖', label: 'Livret d\'accueil' },
    { key: 'cautions', icon: '🔒', label: 'Cautions' },
    { key: 'settings', icon: '⚙️', label: 'Paramètres' },
    ...(session?.user?.isAdmin ? [{ key: 'promo-admin' as Tab, icon: '🎟️', label: 'Codes promo' }] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay mobile */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Sidebar */}
      <aside className={`
        ${isMobile
          ? `fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
          : `${sidebarOpen ? 'w-60' : 'w-16'} transition-all duration-200 flex-shrink-0`
        } bg-white border-r border-gray-100 flex flex-col
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-gray-100 gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-100">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          {sidebarOpen && <span className="font-bold text-gray-900">StayDirect</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => { setTab(item.key); if (isMobile) setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === item.key
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
              {sidebarOpen && item.key === 'reservations' && pending.length > 0 && (
                <span className="ml-auto bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {pending.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Plan badge */}
        {sidebarOpen && <PlanBadge session={session} propertiesCount={properties.length} propLabelPlural={propLabelPlural} />}

        {/* Toggle desktop uniquement */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden md:flex m-3 p-2 rounded-lg hover:bg-gray-100 text-gray-400 text-sm items-center justify-center"
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger mobile */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
            <h1 className="font-bold text-gray-900 text-base md:text-lg">
              {tab === 'overview' && "Vue d'ensemble"}
              {tab === 'calendar' && "Calendrier"}
              {tab === 'properties' && `Mes ${propLabelPlural}`}
              {tab === 'reservations' && "Réservations"}
              {tab === 'pricing' && "Prix dynamiques"}
              {tab === 'analytics' && "Analytics"}
              {tab === 'site' && "Mon site"}
              {tab === 'settings' && "Paramètres"}
              {tab === 'promo-admin' && "Codes promo"}
              {tab === 'livret' && "Livret d'accueil"}
              {tab === 'cautions' && "Cautions bancaires"}
            </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {session?.user?.slug && (
              <Link
                href={`/p/${session.user.slug}`}
                target="_blank"
                className="hidden sm:flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
              >
                🔗 Mon site public
              </Link>
            )}
            <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {session?.user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              {sidebarOpen && <span className="text-sm text-gray-700 font-medium hidden md:block">{session?.user?.name}</span>}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm text-gray-400 hover:text-red-500 transition ml-1"
                title="Déconnexion"
              >
                ⏻
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Bannière essai */}
          <TrialBanner session={session} />

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Bonjour, {session?.user?.name?.split(' ')[0]} 👋</h2>
                    <p className="text-blue-100 text-sm">Voici un résumé de votre activité</p>
                  </div>
                  <div className="text-5xl opacity-20">🏠</div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Revenus ce mois', value: formatPrice(monthRevenue), icon: '💰', color: 'green', sub: formatPrice(totalRevenue) + ' total' },
                  { label: `${PropLabelPlural} actifs`, value: String(properties.filter(p => p.isActive).length), icon: '🏠', color: 'blue', sub: properties.length + ' total' },
                  { label: 'Séjours à venir', value: String(upcoming.length), icon: '📅', color: 'purple', sub: 'prochains séjours' },
                  { label: 'En attente', value: String(pending.length), icon: '⏳', color: 'orange', sub: 'à confirmer' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{stat.icon}</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        stat.color === 'green' ? 'bg-green-50 text-green-700' :
                        stat.color === 'blue' ? 'bg-blue-50 text-blue-700' :
                        stat.color === 'purple' ? 'bg-purple-50 text-purple-700' :
                        'bg-orange-50 text-orange-700'
                      }`}>↑</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                    <div className="text-xs text-gray-400 mt-1">{stat.sub}</div>
                  </div>
                ))}
              </div>

              {/* Graphique revenus 6 derniers mois */}
              <RevenueChart reservations={reservations} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prochains séjours */}
                <div className="bg-white rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                    <h3 className="font-semibold text-gray-900">Prochains séjours</h3>
                    <button onClick={() => setTab('reservations')} className="text-xs text-blue-600 hover:underline">Voir tout</button>
                  </div>
                  {upcoming.length === 0 ? (
                    <div className="px-6 py-8 text-center text-gray-400 text-sm">Aucun séjour prévu</div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {upcoming.slice(0, 4).map(r => (
                        <div key={r.id} className="px-6 py-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                              {r.guestName[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{r.guestName}</div>
                              <div className="text-xs text-gray-400">{r.property?.name} · {formatDate(r.checkIn)}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900 text-sm">{formatPrice(r.totalPrice)}</div>
                            <div className="text-xs text-gray-400">{r.nights} nuit{r.nights > 1 ? 's' : ''}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mes logements résumé */}
                <div className="bg-white rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                    <h3 className="font-semibold text-gray-900">Mes {propLabelPlural}</h3>
                    <button onClick={() => { setTab('properties'); setShowAddProperty(true) }} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">+ Ajouter</button>
                  </div>
                  {properties.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <div className="text-4xl mb-3">🏠</div>
                      <p className="text-gray-500 text-sm mb-4">Ajoutez votre premier {propLabel}</p>
                      <button
                        onClick={() => { setTab('properties'); setShowAddProperty(true) }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                      >
                        Créer mon {propLabel}
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {properties.slice(0, 4).map(p => (
                        <div key={p.id} className="px-6 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {p.images?.[0] ? (
                              <img src={p.images[0]} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" alt="" />
                            ) : (
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">🏠</div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{p.name}</div>
                              <div className="text-xs text-gray-400">{p.city} · {formatPrice(p.pricePerNight)}/nuit</div>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                            {p.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Accès rapide */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: '🏠', label: `Ajouter un ${propLabel}`, action: () => { setTab('properties'); setShowAddProperty(true) } },
                  { icon: '📅', label: 'Voir le calendrier', action: () => setTab('calendar') },
                  { icon: '🔗', label: 'Mon site public', action: () => window.open(`/p/${session?.user?.slug}`, '_blank') },
                  { icon: '💳', label: 'Gérer l\'abonnement', action: () => fetch('/api/billing/portal', { method: 'POST' }).then(r => r.json()).then(d => { if (d.url) window.location.href = d.url }) },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="bg-white border border-gray-100 rounded-xl p-4 text-left hover:shadow-md hover:border-blue-100 transition group"
                  >
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition">{item.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── CALENDAR ── */}
          {tab === 'calendar' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-500 text-sm">Toutes vos réservations sur un seul calendrier</p>
                {properties.length > 0 && (
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => properties.filter(p => p.icalUrls.length > 0).forEach(p => syncIcal(p.id))}
                      disabled={!!syncingId}
                      className="flex items-center gap-2 text-sm border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {syncingId ? (
                        <><span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> Synchronisation...</>
                      ) : (
                        <>⟳ Sync tous les iCal</>
                      )}
                    </button>
                    {syncResult && (
                      <div className={`text-xs px-3 py-2 rounded-lg ${syncResult.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                        {syncResult.msg}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <PMSCalendar
                properties={properties}
                reservations={reservations}
                blockedDates={properties.flatMap(p => (p.blockedDates || []).map(b => ({ ...b, propertyName: p.name, propertyId: p.id })))}
              />
            </div>
          )}

          {/* ── PROPERTIES ── */}
          {tab === 'properties' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-500 text-sm">{properties.length} {properties.length > 1 ? propLabelPlural : propLabel}</p>
                <button
                  onClick={() => setShowAddProperty(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition flex items-center gap-2 text-sm"
                >
                  + Ajouter un {propLabel}
                </button>
              </div>

              {showAddProperty && (
                <PropertyForm
                  onClose={() => setShowAddProperty(false)}
                  onSaved={() => { setShowAddProperty(false); fetchData() }}
                  propLabel={propLabel}
                />
              )}

              {editingProperty && (
                <PropertyForm
                  property={editingProperty}
                  onClose={() => setEditingProperty(null)}
                  onSaved={() => { setEditingProperty(null); fetchData() }}
                  propLabel={propLabel}
                />
              )}

              {properties.length === 0 && !showAddProperty ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
                  <div className="text-5xl mb-4">🏠</div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Aucun {propLabel} pour l'instant</h2>
                  <p className="text-gray-500 mb-6 text-sm">Créez votre premier {propLabel} pour recevoir des réservations directes</p>
                  <button
                    onClick={() => setShowAddProperty(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition"
                  >
                    Créer mon premier {propLabel}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {properties.map(p => (
                    <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition group">
                      {/* Photo */}
                      <div className="h-44 bg-gray-100 relative overflow-hidden">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" alt={p.name} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl text-gray-300">🏠</div>
                        )}
                        <div className="absolute top-3 right-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold backdrop-blur-sm ${p.isActive ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'}`}>
                            {p.isActive ? '● Actif' : '○ Inactif'}
                          </span>
                        </div>
                        {p.images.length > 1 && (
                          <div className="absolute bottom-3 left-3">
                            <span className="text-xs bg-black/50 text-white px-2 py-1 rounded-full backdrop-blur-sm">
                              📷 {p.images.length} photos
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-gray-900 text-base leading-tight">{p.name}</h3>
                          <span className="text-lg font-bold text-blue-600 ml-2 flex-shrink-0">{formatPrice(p.pricePerNight)}<span className="text-xs text-gray-400 font-normal">/n</span></span>
                        </div>
                        <p className="text-sm text-gray-400 mb-1">📍 {p.city}</p>
                        <p className="text-sm text-gray-400 mb-1">👥 {p.maxGuests} voyageurs max</p>
                        {p.stock > 1 && <p className="text-sm text-blue-600 font-medium mb-4">📦 Stock : {p.stock} unités</p>}

                        {/* iCal status */}
                        <div className="flex items-center gap-2 mb-4 p-2.5 bg-gray-50 rounded-lg">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.icalUrls.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          <span className="text-xs text-gray-500">
                            {p.icalUrls.length > 0 ? `${p.icalUrls.length} calendrier(s) iCal connecté(s)` : 'Aucun calendrier connecté'}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => setEditingProperty(p)}
                            className="text-xs font-medium border border-blue-200 text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition"
                          >
                            ✏️ Modifier
                          </button>
                          <button
                            onClick={() => syncIcal(p.id)}
                            disabled={syncingId === p.id}
                            className="text-xs font-medium border border-gray-200 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {syncingId === p.id ? '⏳ Sync...' : '⟳ Sync iCal'}
                          </button>
                          {syncResult?.id === p.id && (
                            <div className={`col-span-3 text-xs px-3 py-2 rounded-lg mt-1 ${syncResult.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                              {syncResult.msg}
                            </div>
                          )}
                          <button
                            onClick={() => setBlockModal(p.id)}
                            className="text-xs font-medium border border-orange-200 text-orange-600 py-2 rounded-lg hover:bg-orange-50 transition"
                          >
                            🔒 Bloquer dates
                          </button>
                          <Link
                            href={`/p/${session?.user?.slug}`}
                            target="_blank"
                            className="text-xs font-medium border border-gray-200 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition text-center"
                          >
                            👁 Voir
                          </Link>
                        </div>
                        <button
                          onClick={() => deleteProperty(p.id)}
                          className="w-full mt-2 text-xs text-red-400 hover:text-red-600 py-1 transition"
                        >
                          Supprimer ce {propLabel}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── RESERVATIONS ── */}
          {tab === 'reservations' && (
            <ReservationsTab
              reservations={reservations}
              properties={properties}
              onDelete={deleteReservation}
            />
          )}

          {/* ── PRIX DYNAMIQUES ── */}
          {tab === 'pricing' && (
            <div className="space-y-6">
              <p className="text-gray-500 text-sm">Cliquez sur un jour pour modifier le prix. Les changements s'appliquent immédiatement sur votre site de réservation.</p>
              {properties.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                  <div className="text-4xl mb-3">🏠</div>
                  <p>Ajoutez d'abord un {propLabel} pour gérer les prix</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {properties.map(p => (
                    <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                          {p.images?.[0] && <img src={p.images[0]} className="w-10 h-10 rounded-xl object-cover" alt="" />}
                          <div>
                            <h3 className="font-bold text-gray-900">{p.name}</h3>
                            <p className="text-sm text-gray-400">Prix de base : <span className="font-semibold text-blue-600">{formatPrice(p.pricePerNight)}/nuit</span></p>
                          </div>
                        </div>
                      </div>
                      <PriceCalendar
                        propertyId={p.id}
                        basePrice={p.pricePerNight}
                        blockedDates={(p as any).blockedDates || []}
                        reservations={reservations.filter(r => (r as any).propertyId === p.id || r.property?.name === p.name)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {tab === 'analytics' && (
            <AnalyticsTab reservations={reservations} properties={properties} />
          )}

          {/* ── MON SITE ── */}
          {tab === 'site' && (
            <SiteSettings slug={session?.user?.slug || ''} />
          )}

          {/* ── LIVRET D'ACCUEIL ── */}
          {tab === 'livret' && (
            <div className="max-w-4xl">
              <WelcomeBookEditor properties={properties.map(p => ({ id: p.id, name: p.name, city: p.city }))} />
            </div>
          )}

          {/* ── CAUTIONS ── */}
          {tab === 'cautions' && (
            <div className="max-w-3xl">
              <DepositsManager properties={properties.map(p => ({ id: p.id, name: p.name, city: p.city }))} />
            </div>
          )}

          {/* ── PROMO ADMIN ── */}
          {tab === 'promo-admin' && (
            <div className="max-w-3xl">
              <PromoAdmin />
            </div>
          )}

          {/* ── SETTINGS ── */}
          {tab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Mon compte</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-b border-gray-50">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Nom</div>
                      <div className="text-sm text-gray-500">{session?.user?.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-50">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Email</div>
                      <div className="text-sm text-gray-500">{session?.user?.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Lien public</div>
                      <div className="text-sm text-blue-500">staydirect.fr/p/{session?.user?.slug}</div>
                    </div>
                    <Link href={`/p/${session?.user?.slug}`} target="_blank" className="text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">
                      Ouvrir →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Stripe Connect */}
              <StripeConnectSection />

              {/* Code promo */}
              <PromoActivate currentPlan={session?.user?.plan || 'starter'} />

              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-1">Abonnement</h3>
                <p className="text-sm text-gray-500 mb-4">Plan actuel : <span className="font-semibold text-blue-600 capitalize">{session?.user?.plan || 'Solo'}</span></p>
                <div className="flex gap-3">
                  <button
                    onClick={() => fetch('/api/billing/portal', { method: 'POST' }).then(r => r.json()).then(d => { if (d.url) window.location.href = d.url })}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  >
                    Gérer mon abonnement
                  </button>
                  <Link href="/pricing" className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                    Changer de plan
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-red-100 p-6">
                <h3 className="font-bold text-gray-900 mb-1">Déconnexion</h3>
                <p className="text-sm text-gray-500 mb-4">Vous serez redirigé vers la page d'accueil</p>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Modal bloquer dates */}
      {blockModal && (
        <BlockDatesModal propertyId={blockModal} onClose={() => setBlockModal(null)} />
      )}
    </div>
  )
}

function BlockDatesModal({ propertyId, onClose }: { propertyId: string; onClose: () => void }) {
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const handleBlock = async () => {
    if (!checkIn || !checkOut) return
    setSaving(true)
    await fetch(`/api/properties/${propertyId}/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkIn, checkOut }),
    })
    setSaving(false)
    setDone(true)
    setTimeout(onClose, 1200)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-gray-900 text-lg mb-1">🔒 Bloquer des dates</h3>
        <p className="text-sm text-gray-500 mb-5">Les voyageurs ne pourront pas réserver sur ces dates.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Arrivée</label>
            <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Départ</label>
            <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
            Annuler
          </button>
          <button onClick={handleBlock} disabled={saving || done || !checkIn || !checkOut}
            className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-orange-600 transition disabled:opacity-50">
            {done ? '✓ Bloqué !' : saving ? '...' : 'Bloquer'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── STRIPE CONNECT SECTION ──
function StripeConnectSection() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'not_connected'>('loading')
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Vérifier si le compte est connecté via le paramètre URL
    const params = new URLSearchParams(window.location.search)
    if (params.get('stripe_connected') === 'true') {
      setStatus('connected')
      setChecking(false)
      window.history.replaceState({}, '', '/dashboard?tab=settings')
      return
    }
    // Vérifier le statut via l'API
    fetch('/api/billing/connect/status')
      .then(r => r.json())
      .then(d => {
        setStatus(d.connected ? 'connected' : 'not_connected')
        setChecking(false)
      })
      .catch(() => { setStatus('not_connected'); setChecking(false) })
  }, [])

  return (
    <div className={`bg-white rounded-2xl border p-6 ${status === 'connected' ? 'border-emerald-100' : 'border-orange-100'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900">Paiements voyageurs</h3>
            {!checking && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status === 'connected' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-600'}`}>
                {status === 'connected' ? '✓ Connecté' : '⚠ Non connecté'}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-4">
            {status === 'connected'
              ? 'Votre compte Stripe est connecté. Les paiements de vos voyageurs arrivent directement sur votre compte.'
              : 'Connectez votre compte Stripe pour recevoir les paiements de vos voyageurs directement.'
            }
          </p>
          {status !== 'connected' && (
            <a
              href="/api/billing/connect"
              className="inline-flex items-center gap-2 bg-[#635BFF] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#5851E5] transition shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/></svg>
              Connecter mon compte Stripe
            </a>
          )}
          {status === 'connected' && (
            <a
              href="/api/billing/connect"
              className="text-sm text-gray-400 hover:text-gray-600 underline transition"
            >
              Reconnecter un autre compte
            </a>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${status === 'connected' ? 'bg-emerald-50' : 'bg-orange-50'}`}>
          {status === 'connected' ? '✅' : '💳'}
        </div>
      </div>
    </div>
  )
}

// ── ANALYTICS TAB ──
function AnalyticsTab({ reservations, properties }: { reservations: Reservation[]; properties: Property[] }) {
  const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
  const confirmed = reservations.filter(r => r.status === 'confirmed')

  // Revenus 12 derniers mois
  const months12 = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(new Date().getFullYear(), new Date().getMonth() - (11 - i), 1)
    const label = d.toLocaleDateString('fr-FR', { month: 'short' })
    const shortLabel = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
    const revenue = confirmed.filter(r => {
      const rd = new Date(r.checkIn)
      return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear()
    }).reduce((s, r) => s + r.totalPrice, 0)
    const bookings = confirmed.filter(r => {
      const rd = new Date(r.checkIn)
      return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear()
    }).length
    return { label, shortLabel, revenue, bookings, date: d }
  })

  const maxRevenue = Math.max(...months12.map(m => m.revenue), 1)
  const totalRevenue = confirmed.reduce((s, r) => s + r.totalPrice, 0)
  const thisMonth = months12[11]
  const lastMonth = months12[10]
  const growthRevenue = lastMonth.revenue > 0 ? Math.round(((thisMonth.revenue - lastMonth.revenue) / lastMonth.revenue) * 100) : null

  // Stats par logement
  const propertyStats = properties.map(p => {
    const pReservations = confirmed.filter(r => r.property?.name === p.name || reservations.find(rv => rv.id === r.id && (rv as any).propertyId === p.id))
    const revenue = confirmed.filter(r => (r as any).propertyId === p.id).reduce((s, r) => s + r.totalPrice, 0)
    const bookingCount = confirmed.filter(r => (r as any).propertyId === p.id).length
    const nights = confirmed.filter(r => (r as any).propertyId === p.id).reduce((s, r) => s + r.nights, 0)
    const occupancyRate = Math.min(Math.round((nights / 365) * 100), 100)
    return { ...p, revenue, bookingCount, nights, occupancyRate }
  }).sort((a, b) => b.revenue - a.revenue)

  // Meilleur mois
  const bestMonth = [...months12].sort((a, b) => b.revenue - a.revenue)[0]

  // Avg par nuit
  const totalNights = confirmed.reduce((s, r) => s + r.nights, 0)
  const avgPerNight = totalNights > 0 ? totalRevenue / totalNights : 0

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Revenus totaux', value: fmt(totalRevenue), icon: '💰',
            sub: thisMonth.revenue > 0 ? `${fmt(thisMonth.revenue)} ce mois` : 'Aucune réservation',
            color: 'green'
          },
          {
            label: 'Réservations', value: String(confirmed.length), icon: '📋',
            sub: `${thisMonth.bookings} ce mois`,
            color: 'blue'
          },
          {
            label: 'Prix moyen / nuit', value: avgPerNight > 0 ? fmt(avgPerNight) : '—', icon: '🌙',
            sub: `${totalNights} nuits vendues`,
            color: 'purple'
          },
          {
            label: 'Meilleur mois', value: bestMonth.revenue > 0 ? fmt(bestMonth.revenue) : '—', icon: '🏆',
            sub: bestMonth.revenue > 0 ? bestMonth.shortLabel : 'Pas encore de données',
            color: 'orange'
          },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              {stat.label === 'Revenus totaux' && growthRevenue !== null && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${growthRevenue >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {growthRevenue >= 0 ? '↑' : '↓'} {Math.abs(growthRevenue)}%
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-xs text-gray-400">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Graphique revenus 12 mois */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-gray-900">Revenus sur 12 mois</h3>
            <p className="text-sm text-gray-400 mt-0.5">Réservations confirmées</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900">{fmt(totalRevenue)}</div>
            <div className="text-xs text-gray-400">total</div>
          </div>
        </div>

        {totalRevenue === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-sm">Les données apparaîtront ici dès vos premières réservations</p>
          </div>
        ) : (
          <div className="flex items-end gap-2 h-44 overflow-x-auto pb-2">
            {months12.map((m, i) => {
              const isCurrentMonth = i === 11
              const h = Math.max((m.revenue / maxRevenue) * 100, m.revenue > 0 ? 6 : 0)
              return (
                <div key={m.label} className="flex-1 min-w-[40px] flex flex-col items-center gap-1.5 group">
                  {m.revenue > 0 && (
                    <div className="text-xs font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                      {fmt(m.revenue)}
                    </div>
                  )}
                  <div className="w-full flex items-end" style={{ height: '120px' }}>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${isCurrentMonth ? 'bg-blue-600' : m.revenue > 0 ? 'bg-blue-200 hover:bg-blue-300' : 'bg-gray-100'}`}
                      style={{ height: `${h}%`, minHeight: m.revenue > 0 ? '4px' : '0' }}
                    />
                  </div>
                  <div className={`text-xs font-medium capitalize ${isCurrentMonth ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                    {m.label}
                  </div>
                  {m.bookings > 0 && (
                    <div className="text-xs text-gray-300">{m.bookings}rés.</div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Stats par logement */}
      {properties.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Performance par {propLabel}</h3>
          {propertyStats.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucune donnée disponible</p>
          ) : (
            <div className="space-y-4">
              {propertyStats.map((p, i) => (
                <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-orange-400'}`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm truncate">{p.name}</div>
                    <div className="text-xs text-gray-400">{p.city} · {p.bookingCount} rés. · {p.nights} nuits</div>
                    {/* Barre occupation */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${p.occupancyRate}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">{p.occupancyRate}% occupation</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-gray-900">{fmt(p.revenue)}</div>
                    <div className="text-xs text-gray-400">{formatPrice(p.pricePerNight)}/nuit</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Économies vs Airbnb */}
      {totalRevenue > 0 && (
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-1">💚 Vos économies grâce à StayDirect</h3>
          <p className="text-green-100 text-sm mb-4">Commissions évitées vs Airbnb (~16%) et Booking (~20%)</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{fmt(totalRevenue * 0.16)}</div>
              <div className="text-green-100 text-xs mt-1">Économisé vs Airbnb</div>
            </div>
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{fmt(totalRevenue * 0.20)}</div>
              <div className="text-green-100 text-xs mt-1">Économisé vs Booking</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── SITE SETTINGS ──
function SiteSettings({ slug }: { slug: string }) {
  const [settings, setSettings] = useState({
    siteTitle: '', tagline: '', logo: '', theme: 'modern', primaryColor: '#2563eb', customDomain: '', paypalMe: '', skrillEmail: '', phone: '', whatsapp: ''
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/site/settings').then(r => r.json()).then(data => {
      if (data) setSettings({
        siteTitle: data.siteTitle || '',
        tagline: data.tagline || '',
        logo: data.logo || '',
        theme: data.theme || 'modern',
        primaryColor: data.primaryColor || '#2563eb',
        customDomain: data.customDomain || '',
        paypalMe: data.paypalMe || '',
        skrillEmail: data.skrillEmail || '',
        phone: data.phone || '',
        whatsapp: data.whatsapp || '',
      })
      setLoading(false)
    })
  }, [])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (data.url) setSettings(s => ({ ...s, logo: data.url }))
    setUploading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    await fetch('/api/site/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const THEMES = [
    { id: 'modern', label: 'Modern', desc: 'Épuré, bleu, professionnel', emoji: '🔵' },
    { id: 'luxury', label: 'Luxury', desc: 'Sombre, élégant, haut de gamme', emoji: '⚫' },
    { id: 'nature', label: 'Nature', desc: 'Vert, organique, chaleureux', emoji: '🟢' },
    { id: 'minimal', label: 'Minimal', desc: 'Blanc, typographie, épuré', emoji: '⬜' },
  ]

  const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0891b2', '#be185d', '#1d4ed8']

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="max-w-3xl space-y-6">
      {/* Aperçu */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white flex items-center justify-between">
        <div>
          <div className="font-bold text-lg mb-1">Votre site public</div>
          <div className="text-blue-100 text-sm">staydirect.fr/p/{slug}</div>
        </div>
        <a href={`/p/${slug}`} target="_blank" className="bg-white text-blue-600 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-blue-50 transition flex-shrink-0">
          Voir le site →
        </a>
      </div>

      {/* Thème */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-1">Choisir un thème</h3>
        <p className="text-sm text-gray-500 mb-4">Le design de votre site public</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => setSettings(s => ({ ...s, theme: t.id }))}
              className={`p-4 rounded-xl border-2 text-left transition ${settings.theme === t.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
            >
              <div className="text-2xl mb-2">{t.emoji}</div>
              <div className="font-semibold text-gray-900 text-sm">{t.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Couleur */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-1">Couleur principale</h3>
        <p className="text-sm text-gray-500 mb-4">Couleur des boutons et accents</p>
        <div className="flex items-center gap-3 flex-wrap">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setSettings(s => ({ ...s, primaryColor: c }))}
              className={`w-9 h-9 rounded-full transition border-4 ${settings.primaryColor === c ? 'border-gray-400 scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
            />
          ))}
          <div className="flex items-center gap-2 ml-2">
            <label className="text-sm text-gray-500">Perso :</label>
            <input type="color" value={settings.primaryColor} onChange={e => setSettings(s => ({ ...s, primaryColor: e.target.value }))}
              className="w-9 h-9 rounded-full border border-gray-200 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Infos site */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-bold text-gray-900">Informations du site</h3>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Titre du site</label>
          <input value={settings.siteTitle} onChange={e => setSettings(s => ({ ...s, siteTitle: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder={`Ex: Villa Azur · Location de vacances`} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Slogan / Description courte</label>
          <input value={settings.tagline} onChange={e => setSettings(s => ({ ...s, tagline: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Ex: Location de vacances à Nice · Vue mer" />
        </div>

        {/* Logo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Logo (optionnel)</label>
          <div className="flex items-center gap-4">
            {settings.logo && <img src={settings.logo} alt="Logo" className="h-12 w-auto object-contain border border-gray-100 rounded-lg p-1" />}
            <label className="flex items-center gap-2 text-sm border border-gray-200 px-4 py-2 rounded-xl cursor-pointer hover:bg-gray-50 transition">
              {uploading ? <span className="text-blue-500">Upload...</span> : <><span>📷</span> {settings.logo ? 'Changer le logo' : 'Ajouter un logo'}</>}
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
            {settings.logo && <button onClick={() => setSettings(s => ({ ...s, logo: '' }))} className="text-xs text-red-400 hover:text-red-600">Supprimer</button>}
          </div>
        </div>
      </div>

      {/* Domaine perso */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-gray-900">Domaine personnalisé</h3>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">Pro</span>
        </div>
        <p className="text-sm text-gray-500 mb-4">Utilisez votre propre domaine ex: <span className="font-mono text-gray-700">villa-azur.fr</span></p>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Votre domaine</label>
          <input
            value={settings.customDomain}
            onChange={e => setSettings(s => ({ ...s, customDomain: e.target.value.toLowerCase().trim() }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-mono"
            placeholder="villa-azur.fr"
          />
        </div>

        {settings.customDomain && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm">
            <p className="font-semibold text-amber-800 mb-2">📋 Configuration DNS requise</p>
            <p className="text-amber-700 mb-3">Ajoutez ces enregistrements chez votre hébergeur de domaine :</p>
            <div className="bg-white rounded-lg p-3 font-mono text-xs space-y-2 border border-amber-100">
              <div className="flex gap-4">
                <span className="text-gray-500 w-16">Type</span>
                <span className="text-gray-500 w-24">Nom</span>
                <span className="text-gray-500">Valeur</span>
              </div>
              <div className="flex gap-4 text-gray-800">
                <span className="w-16 font-bold text-blue-600">CNAME</span>
                <span className="w-24">www</span>
                <span>cname.vercel-dns.com</span>
              </div>
              <div className="flex gap-4 text-gray-800">
                <span className="w-16 font-bold text-blue-600">A</span>
                <span className="w-24">@</span>
                <span>76.76.21.21</span>
              </div>
            </div>
            <p className="text-amber-600 text-xs mt-3">⏱ La propagation DNS peut prendre 24-48h. Contactez le support StayDirect après avoir configuré les DNS.</p>
          </div>
        )}
      </div>

      {/* Skrill */}
      <div className="bg-white rounded-2xl border border-purple-100 p-6 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">💜</span>
          <h3 className="font-bold text-gray-900">Skrill (Maroc, sans société)</h3>
          <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full">Recommandé Maroc</span>
        </div>
        <p className="text-sm text-gray-500 mb-4">Recevez les paiements via Skrill sans avoir de société. Idéal pour le Maroc, Tunisie, etc. Skrill vire sur votre compte bancaire local.</p>
        <div className="mb-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Votre email Skrill</label>
          <input
            value={(settings as any).skrillEmail || ''}
            onChange={e => setSettings(s => ({ ...s, skrillEmail: e.target.value.trim() }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-mono"
            placeholder="votreemail@exemple.com"
            type="email"
          />
        </div>
        <p className="text-xs text-gray-400">L'email associé à votre compte Skrill. Si renseigné, les voyageurs paient via Skrill (priorité sur PayPal).</p>
      </div>

      {/* PayPal Me */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-1">💳 Lien PayPal.Me</h3>
        <p className="text-sm text-gray-500 mb-4">Pour recevoir les paiements voyageurs via PayPal (ex: pour les propriétaires hors zone Stripe).</p>
        <div className="mb-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Votre lien PayPal.Me</label>
          <input
            value={(settings as any).paypalMe}
            onChange={e => setSettings(s => ({ ...s, paypalMe: e.target.value.trim() }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
            placeholder="https://paypal.me/votrenom"
          />
        </div>
        <p className="text-xs text-gray-400">Si renseigné, les voyageurs seront redirigés vers PayPal si vous n'avez pas Stripe Connect.</p>
      </div>

      {/* Contact direct */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">📞</span>
          <h3 className="font-bold text-gray-900">Contact direct</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">Ces informations apparaissent sur votre site public quand un voyageur clique "Contacter l'hôte".</p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp (avec indicatif)</label>
            <input
              value={(settings as any).whatsapp || ''}
              onChange={e => setSettings(s => ({ ...s, whatsapp: e.target.value.trim() }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-mono"
              placeholder="+33612345678 ou +212612345678"
              type="tel"
            />
            <p className="text-xs text-gray-400 mt-1">Si renseigné, un bouton WhatsApp vert apparaît sur votre site.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Téléphone (si pas WhatsApp)</label>
            <input
              value={(settings as any).phone || ''}
              onChange={e => setSettings(s => ({ ...s, phone: e.target.value.trim() }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
              placeholder="+33 6 12 34 56 78"
              type="tel"
            />
            <p className="text-xs text-gray-400 mt-1">Affiché uniquement si aucun WhatsApp n'est renseigné.</p>
          </div>
        </div>
      </div>

      {/* Bouton sauvegarder */}
      <div className="flex items-center justify-between">
        <a href={`/p/${slug}`} target="_blank" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
          👁 Prévisualiser le site →
        </a>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          {saved ? '✓ Sauvegardé !' : saving ? 'Sauvegarde...' : 'Sauvegarder les changements'}
        </button>
      </div>
    </div>
  )
}

// ── RESERVATIONS TAB (composant avec son propre state pour éviter les bugs de closure) ──
function ReservationsTab({ reservations, properties, onDelete }: {
  reservations: Reservation[]
  properties: Property[]
  onDelete: (id: string) => void
}) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all')
  const [propId, setPropId] = useState('all')
  const [sort, setSort] = useState<{ col: 'checkIn' | 'checkOut' | 'totalPrice' | 'guestName'; dir: 'asc' | 'desc' }>({ col: 'checkIn', dir: 'desc' })

  const confirmed = reservations.filter(r => r.status === 'confirmed')
  const pending = reservations.filter(r => r.status === 'pending')

  const filtered = reservations
    .filter(r => status === 'all' || r.status === status)
    .filter(r => propId === 'all' || r.propertyId === propId || r.property?.id === propId)
    .filter(r => !search || r.guestName.toLowerCase().includes(search.toLowerCase()) || r.guestEmail.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let av: any = a[sort.col as keyof typeof a]
      let bv: any = b[sort.col as keyof typeof b]
      if (sort.col === 'checkIn' || sort.col === 'checkOut') { av = new Date(av).getTime(); bv = new Date(bv).getTime() }
      return sort.dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
    })

  const exportCSV = () => {
    const headers = ['Voyageur', 'Email', 'Téléphone', 'Logement', 'Arrivée', 'Départ', 'Nuits', 'Montant', 'Statut', 'Source']
    const rows = filtered.map(r => [
      r.guestName,
      r.guestEmail,
      r.guestPhone || '',
      r.property?.name || '',
      new Date(r.checkIn).toLocaleDateString('fr-FR'),
      new Date(r.checkOut).toLocaleDateString('fr-FR'),
      r.nights,
      r.totalPrice,
      r.status,
      r.source || 'direct',
    ])
    const csv = [headers, ...rows].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `reservations-${new Date().toISOString().split('T')[0]}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const SortTh = ({ col, label }: { col: typeof sort.col; label: string }) => (
    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-800 select-none whitespace-nowrap"
      onClick={() => setSort(s => s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' })}>
      {label} {sort.col === col ? (sort.dir === 'asc' ? '↑' : '↓') : <span className="text-gray-300">↕</span>}
    </th>
  )

  return (
    <div>
      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Confirmées', count: confirmed.length, color: 'green' },
          { label: 'En attente', count: pending.length, color: 'orange' },
          { label: 'Total', count: reservations.length, color: 'blue' },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-xl border p-4 text-center ${s.color === 'green' ? 'border-green-100' : s.color === 'orange' ? 'border-orange-100' : 'border-blue-100'}`}>
            <div className={`text-2xl font-bold ${s.color === 'green' ? 'text-green-600' : s.color === 'orange' ? 'text-orange-600' : 'text-blue-600'}`}>{s.count}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtres + Export */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex flex-wrap gap-3 items-center">
        <input type="text" placeholder="🔍 Rechercher un voyageur..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-[180px]" />
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'confirmed', 'pending', 'cancelled'] as const).map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${status === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {s === 'all' ? 'Tous' : s === 'confirmed' ? '✅ Confirmées' : s === 'pending' ? '⏳ En attente' : '❌ Annulées'}
            </button>
          ))}
        </div>
        <select value={propId} onChange={e => setPropId(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">🏠 Tous les {propLabelPlural}</option>
          {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {(search || status !== 'all' || propId !== 'all') && (
          <button onClick={() => { setSearch(''); setStatus('all'); setPropId('all') }}
            className="text-xs text-gray-400 hover:text-gray-700 underline">Réinitialiser</button>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-gray-400">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-semibold hover:bg-green-100 transition">
            ⬇️ Export CSV
          </button>
        </div>
      </div>

      {reservations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <div className="text-4xl mb-3">📋</div>
          <p>Aucune réservation pour le moment</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
          <div className="text-3xl mb-2">🔍</div>
          <p>Aucune réservation ne correspond aux filtres</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <SortTh col="guestName" label="Voyageur" />
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Logement</th>
                  <SortTh col="checkIn" label="Arrivée" />
                  <SortTh col="checkOut" label="Départ" />
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nuits</th>
                  <SortTh col="totalPrice" label="Montant" />
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <ReservationRow key={r.id} r={r} onDelete={onDelete} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ── RESERVATION ROW avec bouton modifier ──
function ReservationRow({ r, onDelete }: { r: Reservation; onDelete: (id: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ guestName: r.guestName, guestEmail: r.guestEmail, guestPhone: r.guestPhone || '', totalPrice: r.totalPrice })
  const [saving, setSaving] = useState(false)
  const isImported = ['airbnb', 'booking', 'abritel', 'ical'].includes((r as any).source || '')

  const handleSave = async () => {
    setSaving(true)
    await fetch(`/api/reservations/${r.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    r.guestName = form.guestName
    r.guestEmail = form.guestEmail
    r.guestPhone = form.guestPhone
    r.totalPrice = Number(form.totalPrice)
    setSaving(false)
    setEditing(false)
  }

  const sourceLabel: Record<string, string> = { airbnb: '🏠 Airbnb', booking: '🔵 Booking', abritel: '🏡 Abritel', direct: '✅ Direct' }

  return (
    <>
      <tr className="border-b border-gray-50 hover:bg-gray-50 transition">
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
              {r.guestName[0].toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-gray-900 text-sm">{r.guestName}</div>
              <div className="text-xs text-gray-400">{(r as any).source !== 'direct' ? (sourceLabel[(r as any).source] || r.guestEmail) : r.guestEmail}</div>
            </div>
          </div>
        </td>
        <td className="px-5 py-4 text-sm text-gray-600">{(r as any).property?.name || '—'}</td>
        <td className="px-5 py-4 text-sm text-gray-700 font-medium">{new Date(r.checkIn).toLocaleDateString('fr-FR')}</td>
        <td className="px-5 py-4 text-sm text-gray-700 font-medium">{new Date(r.checkOut).toLocaleDateString('fr-FR')}</td>
        <td className="px-5 py-4 text-sm text-gray-500">{r.nights}n</td>
        <td className="px-5 py-4 font-bold text-gray-900">{r.totalPrice > 0 ? `${r.totalPrice}€` : '—'}</td>
        <td className="px-5 py-4">
          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${
            r.status === 'confirmed' ? 'bg-green-50 text-green-700' :
            r.status === 'pending' ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-600'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'confirmed' ? 'bg-green-500' : r.status === 'pending' ? 'bg-orange-500' : 'bg-red-500'}`} />
            {r.status === 'confirmed' ? 'Confirmé' : r.status === 'pending' ? 'En attente' : 'Annulé'}
          </span>
        </td>
        <td className="px-5 py-4 flex items-center gap-2">
          {isImported && (
            <button onClick={() => setEditing(e => !e)} className="text-xs text-blue-500 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-lg transition font-medium">
              ✏️ Modifier
            </button>
          )}
          <button onClick={() => onDelete(r.id)} className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition font-medium">
            Supprimer
          </button>
        </td>
      </tr>
      {editing && (
        <tr className="bg-blue-50 border-b border-blue-100">
          <td colSpan={8} className="px-5 py-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nom du voyageur</label>
                <input value={form.guestName} onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-48" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                <input value={form.guestEmail} onChange={e => setForm(f => ({ ...f, guestEmail: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-48" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Téléphone</label>
                <input value={form.guestPhone} onChange={e => setForm(f => ({ ...f, guestPhone: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-40" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Prix total (€)</label>
                <input type="number" value={form.totalPrice} onChange={e => setForm(f => ({ ...f, totalPrice: Number(e.target.value) }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-32" />
              </div>
              <button onClick={handleSave} disabled={saving}
                className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                {saving ? '...' : '✓ Sauvegarder'}
              </button>
              <button onClick={() => setEditing(false)} className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2">Annuler</button>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ── REVENUE CHART ──
function RevenueChart({ reservations }: { reservations: Reservation[] }) {
  const months = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = d.toLocaleDateString('fr-FR', { month: 'short' })
    const revenue = reservations
      .filter(r => {
        if (r.status !== 'confirmed') return false
        const rd = new Date(r.checkIn)
        return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear()
      })
      .reduce((s, r) => s + r.totalPrice, 0)
    months.push({ label, revenue })
  }

  const max = Math.max(...months.map(m => m.revenue), 1)
  const total = months.reduce((s, m) => s + m.revenue, 0)

  if (total === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-gray-900">Revenus des 6 derniers mois</h3>
          <p className="text-sm text-gray-400 mt-0.5">Réservations confirmées uniquement</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-gray-900">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(total)}
          </div>
          <div className="text-xs text-gray-400">total sur 6 mois</div>
        </div>
      </div>
      <div className="flex items-end gap-3 h-36">
        {months.map((m, i) => {
          const height = max > 0 ? Math.max((m.revenue / max) * 100, m.revenue > 0 ? 8 : 0) : 0
          const isCurrentMonth = i === 5
          return (
            <div key={m.label} className="flex-1 flex flex-col items-center gap-2">
              <div className="text-xs font-bold text-gray-700">
                {m.revenue > 0 ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(m.revenue) : ''}
              </div>
              <div className="w-full flex items-end" style={{ height: '80px' }}>
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 ${isCurrentMonth ? 'bg-blue-600' : 'bg-blue-200'}`}
                  style={{ height: `${height}%`, minHeight: m.revenue > 0 ? '6px' : '0' }}
                />
              </div>
              <div className={`text-xs font-medium capitalize ${isCurrentMonth ? 'text-blue-600' : 'text-gray-400'}`}>{m.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── PROPERTY FORM (Add + Edit) ──
function PropertyForm({
  property,
  onClose,
  onSaved,
  propLabel = 'logement',
}: {
  property?: Property
  onClose: () => void
  onSaved: () => void
  propLabel?: string
}) {
  const isEdit = !!property
  const [form, setForm] = useState({
    name: property?.name || '',
    description: property?.description || '',
    address: property?.address || '',
    city: property?.city || '',
    country: (property as any)?.country || 'France',
    pricePerNight: property?.pricePerNight?.toString() || '',
    maxGuests: property?.maxGuests?.toString() || '2',
    baseGuests: (property as any)?.baseGuests?.toString() || '',
    pricePerExtraGuest: (property as any)?.pricePerExtraGuest?.toString() || '',
    stock: (property as any)?.stock?.toString() || '1',
    icalUrls: property?.icalUrls?.join('\n') || '',
  })
  const [images, setImages] = useState<string[]>(property?.images || [])
  const [amenities, setAmenities] = useState<string[]>((property as any)?.amenities || [])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [saveError, setSaveError] = useState('')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    setUploading(true)
    setUploadError('')
    for (const file of Array.from(files)) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const data = await res.json()
        if (data.url) setImages(prev => [...prev, data.url])
        else setUploadError(data.error || 'Erreur upload')
      } catch {
        setUploadError('Erreur réseau')
      }
    }
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSaveError('')
    const payload = {
      ...form,
      images,
      amenities,
      icalUrls: form.icalUrls ? form.icalUrls.split('\n').filter(Boolean) : [],
      baseGuests: form.baseGuests ? parseInt(form.baseGuests) : null,
      pricePerExtraGuest: form.pricePerExtraGuest ? parseFloat(form.pricePerExtraGuest) : null,
      stock: form.stock ? parseInt(form.stock) : 1,
    }
    const res = await fetch(isEdit ? `/api/properties/${property!.id}` : '/api/properties', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setSaveError(data.error || 'Erreur lors de la sauvegarde')
      return
    }
    onSaved()
  }

  return (
    <div className="bg-white rounded-2xl border border-blue-100 p-6 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-900 text-lg">{isEdit ? `Modifier — ${property!.name}` : `Nouveau ${propLabel}`}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nom du {propLabel} *</label>
          <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Ex: Appartement vue mer à Nice" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            rows={3} placeholder={`Décrivez votre ${propLabel}, ses équipements, son emplacement...`} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Ville *</label>
          <input required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Nice, Paris, Bordeaux..." />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Pays</label>
          <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
            <option value="France">France</option>
            <option value="Maroc">Maroc</option>
            <option value="Espagne">Espagne</option>
            <option value="Italie">Italie</option>
            <option value="Portugal">Portugal</option>
            <option value="Grèce">Grèce</option>
            <option value="Tunisie">Tunisie</option>
            <option value="Sénégal">Sénégal</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Adresse</label>
          <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="10 rue de la Mer" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Prix par nuit (€) *</label>
          <input required type="number" min="1" value={form.pricePerNight} onChange={e => setForm({ ...form, pricePerNight: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="80" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Voyageurs maximum</label>
          <input required type="number" min="1" max="30" value={form.maxGuests} onChange={e => setForm({ ...form, maxGuests: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>

        {/* Supplément voyageurs */}
        <div className="md:col-span-2 border border-purple-100 bg-purple-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-purple-800 mb-1">📦 Stock d'unités</p>
          <p className="text-xs text-purple-600 mb-3">Pour un meublé unique : laissez 1. Pour un hôtel/appart-hôtel : indiquez le nombre d'unités identiques (ex: 14 studios).</p>
          <input type="number" min="1" max="999" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
            placeholder="1" />
        </div>

        <div className="md:col-span-2 border border-blue-100 bg-blue-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-blue-800 mb-3">💰 Prix par nombre de voyageurs (optionnel)</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Voyageurs inclus dans le prix de base</label>
              <input type="number" min="1" max="30" value={form.baseGuests} onChange={e => setForm({ ...form, baseGuests: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                placeholder="ex: 2" />
              <p className="text-xs text-gray-400 mt-1">Jusqu'à X voyageurs = prix de base</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Supplément par voyageur supplémentaire (€/nuit)</label>
              <input type="number" min="0" step="0.5" value={form.pricePerExtraGuest} onChange={e => setForm({ ...form, pricePerExtraGuest: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                placeholder="ex: 15" />
              <p className="text-xs text-gray-400 mt-1">0 = pas de supplément</p>
            </div>
          </div>
          {form.baseGuests && form.pricePerExtraGuest && (
            <p className="text-xs text-blue-700 mt-2 font-medium">
              → {form.pricePerNight}€/nuit jusqu'à {form.baseGuests} voyageurs, puis +{form.pricePerExtraGuest}€/nuit par voyageur supplémentaire
            </p>
          )}
        </div>

        {/* Photos */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Photos {images.length > 0 && <span className="text-blue-500 font-normal">({images.length} photo{images.length > 1 ? 's' : ''})</span>}
          </label>
          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
            <div className="text-2xl mb-1">📷</div>
            <div className="text-sm text-gray-500">Cliquez pour ajouter des photos</div>
            <div className="text-xs text-gray-400">JPG, PNG, WEBP</div>
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          </label>
          {uploading && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-blue-500">Upload en cours...</span>
            </div>
          )}
          {uploadError && <p className="text-xs text-red-500 mt-1">❌ {uploadError}</p>}
          {images.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {images.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} className="w-20 h-20 object-cover rounded-xl border border-gray-200" alt="" />
                  <button
                    type="button"
                    onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 text-xs bg-blue-600 text-white px-1 rounded font-medium">1ère</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Équipements */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">🏠 Équipements affichés sur votre site</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { icon: '🏖', label: 'Proche mer' },
              { icon: '🌆', label: 'Proche ville & attractions' },
              { icon: '🏊', label: 'Piscine privée' },
              { icon: '🏊', label: 'Piscine' },
              { icon: '🚗', label: 'Parking privé' },
              { icon: '📶', label: 'Wi-Fi gratuit' },
              { icon: '❄️', label: 'Climatisation' },
              { icon: '🌿', label: 'Jardin' },
              { icon: '🍳', label: 'Cuisine équipée' },
              { icon: '🛁', label: 'Baignoire' },
              { icon: '🏔', label: 'Vue montagne' },
              { icon: '🌊', label: 'Vue mer' },
              { icon: '🔥', label: 'Barbecue' },
              { icon: '🎮', label: 'Salle de jeux' },
              { icon: '🐾', label: 'Animaux acceptés' },
            ].map(a => (
              <label key={a.label} className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition text-sm ${amenities.includes(a.label) ? 'bg-blue-50 border-blue-300 text-blue-800 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                <input type="checkbox" className="hidden" checked={amenities.includes(a.label)}
                  onChange={e => setAmenities(prev => e.target.checked ? [...prev, a.label] : prev.filter(x => x !== a.label))} />
                <span>{a.icon}</span> {a.label}
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">Sélectionnez les équipements disponibles dans votre logement</p>
        </div>

        {/* iCal import */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Importer depuis Airbnb / Booking (un lien par ligne)</label>
          <textarea value={form.icalUrls} onChange={e => setForm({ ...form, icalUrls: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono"
            rows={3} placeholder={'https://www.airbnb.fr/calendar/ical/...\nhttps://www.booking.com/calendar/ical/...'} />
          <p className="text-xs text-gray-400 mt-1.5">💡 Airbnb : Calendrier → Exporter → Copier le lien iCal</p>
        </div>

        {/* iCal export — à coller dans Airbnb/Booking */}
        {property?.id && (
          <div className="md:col-span-2 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-sm font-semibold text-blue-800 mb-1">📤 Exporter vers Airbnb / Booking</p>
            <p className="text-xs text-blue-600 mb-2">Copiez ce lien et collez-le dans Airbnb (Calendrier → Importer) et Booking pour qu'ils bloquent automatiquement vos dates StayDirect.</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={`${typeof window !== 'undefined' ? window.location.origin : 'https://www.staydirect.fr'}/api/ical/export/${property.id}`}
                className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-700 focus:outline-none"
                onFocus={e => e.target.select()}
              />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/api/ical/export/${property.id}`)}
                className="bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-blue-700 transition whitespace-nowrap">
                Copier
              </button>
            </div>
          </div>
        )}

        <div className="md:col-span-2 flex gap-3 justify-end pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm text-gray-600 hover:text-gray-900 font-medium">
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
          >
            {uploading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Upload...</>
            ) : loading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enregistrement...</>
            ) : (
              isEdit ? '✓ Enregistrer les modifications' : `✓ Créer le ${propLabel}`
            )}
          </button>
          {saveError && (
            <div className="md:col-span-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              ❌ {saveError}
              {saveError.includes('Limite') && (
                <a href="/pricing" className="ml-2 underline font-semibold">Voir les plans →</a>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

function PlanBadge({ session, propertiesCount, propLabelPlural = 'logements' }: { session: any; propertiesCount: number; propLabelPlural?: string }) {
  if (session?.user?.isAdmin) {
    return (
      <div className="m-3 p-3 rounded-xl border bg-purple-50 border-purple-200">
        <div className="text-xs text-purple-700 font-bold mb-1">🔐 Admin</div>
        <a href="/admin" className="text-xs text-purple-600 hover:underline font-medium block">Voir les clients →</a>
      </div>
    )
  }
  const planExpiresAt = session?.user?.planExpiresAt
  const daysLeft = planExpiresAt ? Math.max(0, Math.ceil((new Date(planExpiresAt).getTime() - Date.now()) / 86400000)) : null
  // isTrial = a une date d'expiration (quel que soit le plan)
  const isTrial = !!planExpiresAt
  const trialExpired = isTrial && daysLeft === 0
  const plan = session?.user?.plan
  const LABELS: Record<string, string> = { starter: 'Essai', solo: 'Solo', petit: 'Petit proprio', pro: 'Pro', business: 'Business', livret: 'Livret QR' }
  const planLabel = LABELS[plan] || plan || 'Essai'
  return (
    <div className={`m-3 p-3 rounded-xl border ${trialExpired ? 'bg-red-50 border-red-200' : isTrial ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-100'}`}>
      <div className={`text-xs font-semibold mb-1 ${trialExpired ? 'text-red-600' : isTrial ? 'text-amber-600' : 'text-blue-600'}`}>
        {isTrial ? (trialExpired ? '⚠️ Essai expiré' : `🎁 Essai — ${planLabel}`) : `Plan ${planLabel}`}
      </div>
      {isTrial && !trialExpired && daysLeft !== null && (
        <div className="text-xs text-amber-600 font-medium">⏳ {daysLeft} jour{daysLeft > 1 ? 's' : ''} restant{daysLeft > 1 ? 's' : ''}</div>
      )}
      {!isTrial && plan !== 'livret' && (
        <div className="text-xs text-gray-500">{propertiesCount}/{plan === 'pro' || plan === 'business' ? '15' : plan === 'petit' ? '5' : '1'} {propLabelPlural}</div>
      )}
      {trialExpired
        ? <a href="/pricing" className="text-xs text-red-600 font-semibold hover:underline mt-1 block">S'abonner maintenant →</a>
        : <a href="/pricing" className="text-xs text-blue-600 hover:underline font-medium mt-1 block">{isTrial ? 'Choisir un plan →' : 'Changer de plan →'}</a>
      }
    </div>
  )
}

function TrialBanner({ session }: { session: any }) {
  const planExpiresAt = session?.user?.planExpiresAt
  if (!planExpiresAt || session?.user?.isAdmin) return null
  const daysLeft = Math.max(0, Math.ceil((new Date(planExpiresAt).getTime() - Date.now()) / 86400000))
  if (daysLeft > 3) return null
  return (
    <div className={`mb-4 px-4 py-3 rounded-xl flex items-center justify-between gap-4 ${daysLeft === 0 ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
      <div className="text-sm font-medium text-gray-800">
        {daysLeft === 0
          ? "⚠️ Votre période d'essai est terminée — abonnez-vous pour continuer."
          : `⏳ Période d'essai : ${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}.`}
      </div>
      <a href="/pricing" className="shrink-0 bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition">
        Choisir un plan →
      </a>
    </div>
  )
}
