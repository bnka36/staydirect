'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function calcLogementPrice(count: number): number {
  if (count <= 4) return count * 9
  return 4 * 9 + (count - 4) * 5
}

function calcHotelPrice(stock: number): number {
  if (stock <= 10) return 59
  if (stock <= 15) return 89
  if (stock <= 20) return 120
  if (stock <= 30) return 160
  if (stock <= 50) return 199
  return 250
}

function PriceCalculator() {
  const [type, setType] = useState<'logement' | 'hotel'>('logement')
  const [count, setCount] = useState(1)
  const price = type === 'logement' ? calcLogementPrice(count) : calcHotelPrice(count)

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-100 p-8 max-w-xl mx-auto shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">💰 Calculez votre tarif</h3>
      <div className="flex gap-3 mb-6">
        <button onClick={() => { setType('logement'); setCount(1) }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition border-2 ${type === 'logement' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
          🏠 Meublé / Appart / Villa
        </button>
        <button onClick={() => { setType('hotel'); setCount(10) }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition border-2 ${type === 'hotel' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'}`}>
          🏨 Hôtel / Appart-hôtel
        </button>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {type === 'logement' ? `Nombre de logements : ${count}` : `Nombre de chambres/studios : ${count}`}
        </label>
        <input type="range" min={1} max={type === 'logement' ? 20 : 100}
          value={count} onChange={e => setCount(Number(e.target.value))}
          className="w-full accent-blue-600" />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1</span>
          <span>{type === 'logement' ? 20 : 100}</span>
        </div>
      </div>
      <div className="bg-blue-50 rounded-xl p-5 text-center">
        <div className="text-4xl font-black text-blue-700">{price}€<span className="text-lg font-semibold text-blue-400">/mois</span></div>
        {type === 'logement' && count > 4 && (
          <p className="text-xs text-blue-500 mt-1">4 × 9€ + {count - 4} × 5€</p>
        )}
        <p className="text-xs text-blue-500 mt-1">Channel manager inclus</p>
        <p className="text-xs text-gray-500 mt-3">0% de commission · 14 jours gratuits</p>
      </div>
      <Link href="/register" className="mt-4 block w-full bg-blue-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
        Commencer gratuitement →
      </Link>
    </div>
  )
}

const addons = [
  {
    icon: '📖',
    name: 'Livret d\'accueil QR Code',
    price: '3€/mois',
    unit: 'ou 30€/an',
    desc: 'Sans abonnement StayDirect',
    color: 'blue',
  },
  {
    icon: '🔒',
    name: 'Cautions bancaires',
    price: '0.25€ + 1.5%',
    unit: 'par caution (facturé au voyageur)',
    desc: 'Sans abonnement StayDirect',
    color: 'purple',
  },
  {
    icon: '📍',
    name: 'Pack SEO Local',
    price: '+15€',
    unit: '/mois (en supplément)',
    desc: 'Google Maps, mots-clés locaux, balises optimisées',
    color: 'green',
  },
  {
    icon: '📊',
    name: 'Pack Visibilité',
    price: '+25€',
    unit: '/mois (en supplément)',
    desc: 'SEO Local + Analytics + rapport mensuel',
    color: 'orange',
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [subscribeError, setSubscribeError] = useState('')

  const handleSubscribe = async (planId: string) => {
    setLoading(planId)
    setSubscribeError('')
    try {
      const res = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })
      if (res.status === 401) { router.push(`/register?plan=${planId}`); return }
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
        return
      }
      setSubscribeError(data.error || 'Erreur lors de la souscription. Réessayez ou contactez-nous.')
    } catch {
      setSubscribeError('Erreur réseau — vérifiez votre connexion et réessayez.')
    }
    setLoading(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-xl text-gray-900">StayDirect</span>
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/contact" className="text-gray-500 hover:text-gray-900 text-sm font-medium">Contact</Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm">Connexion</Link>
            <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition text-sm">S'inscrire</Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-blue-100">
          🚀 Solution complète pour loueurs meublés tourisme
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Tarifs simples et transparents</h1>
        <p className="text-xl text-gray-500 mb-4">0% de commission sur vos réservations. Payez juste l'abonnement.</p>
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
          🎯 Livret d'accueil + Cautions bancaires inclus dans tous les plans
        </div>
      </div>

      {/* Deux façons de lancer */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Deux façons de lancer votre site</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Colonne 1 */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 flex flex-col gap-4">
            <div className="text-3xl">🛠️</div>
            <h3 className="text-xl font-bold text-gray-900">Je le fais moi-même</h3>
            <p className="text-gray-500 text-sm leading-relaxed flex-1">
              Créez votre site en quelques minutes directement depuis StayDirect : ajoutez vos logements, vos photos, vos tarifs, et publiez. Simple, en français, sans connaissance technique.
            </p>
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold self-start">
              ✅ Inclus dans votre abonnement
            </div>
          </div>

          {/* Colonne 2 */}
          <div className="bg-blue-600 rounded-2xl border-2 border-blue-600 p-8 flex flex-col gap-4 relative">
            <div className="absolute -top-3 right-6 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
              ✨ Sans effort
            </div>
            <div className="text-3xl">🎯</div>
            <h3 className="text-xl font-bold text-white">Faites-le pour moi</h3>
            <p className="text-blue-100 text-sm leading-relaxed flex-1">
              Envoyez-nous vos photos et descriptifs, on s'occupe de tout : création du site, mise en ligne, synchronisation des calendriers, référencement Google. Vous recevez votre site prêt à l'emploi.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold self-start">
              💳 299 € une seule fois
            </div>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm bg-gray-50 rounded-xl px-6 py-4 border border-gray-100">
          Dans les deux cas : réservations directes, zéro commission, et un interlocuteur en français toujours joignable.
        </p>
      </div>

      {subscribeError && (
        <div className="max-w-5xl mx-auto px-6 mb-6">
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center justify-between gap-3">
            <span>❌ {subscribeError}</span>
            <button onClick={() => setSubscribeError('')} className="text-red-400 hover:text-red-600 font-bold shrink-0">✕</button>
          </div>
        </div>
      )}

      {/* Plans */}
      <div className="max-w-5xl mx-auto px-6 pb-4">
        {/* Calculateur */}
        <PriceCalculator />

        {/* Grille tarifaire */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Meublé / Appartement / Villa */}
          <div className="bg-white rounded-2xl border-2 border-blue-500 p-8 shadow-lg shadow-blue-50 relative flex flex-col">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-sm font-semibold px-4 py-1 rounded-full whitespace-nowrap">
              ⭐ Le plus populaire
            </div>
            <div className="text-3xl mb-3">🏠</div>
            <h2 className="text-xl font-bold text-gray-900">Meublé · Appartement · Villa</h2>
            <p className="text-gray-500 text-sm mt-1 mb-5">Chambre d'hôtes, gîte, chalet, château</p>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">1 à 4 logements</span>
                <span className="font-bold text-gray-900">9€ / logement</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">5ème logement et +</span>
                <span className="font-bold text-blue-600">5€ / logement</span>
              </div>
            </div>
            <ul className="space-y-2 mb-8 flex-1">
              {['Site de réservation pro', '🌍 Domaine personnalisé', 'Sync iCal Airbnb & Booking', '🔗 Channel manager inclus', '📖 Livret d\'accueil QR', '🔒 Cautions bancaires', 'Prix dynamiques', 'Analytics & stats', 'Support email'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500 font-bold flex-shrink-0">✓</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={() => handleSubscribe('starter')} disabled={loading === 'starter'}
              className="w-full py-3 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50">
              {loading === 'starter' ? 'Redirection...' : 'Commencer — 14j gratuits'}
            </button>
          </div>

          {/* Hôtel / Appart-hôtel */}
          <div className="bg-white rounded-2xl border-2 border-amber-400 p-8 shadow-lg shadow-amber-50 relative flex flex-col">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-sm font-semibold px-4 py-1 rounded-full whitespace-nowrap">
              🏨 Hôtels & Résidences
            </div>
            <div className="text-3xl mb-3">🏨</div>
            <h2 className="text-xl font-bold text-gray-900">Hôtel · Appart-hôtel</h2>
            <p className="text-gray-500 text-sm mt-1 mb-5">Résidence de tourisme, camping, glamping</p>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">1 – 10 chambres/studios</span>
                <span className="font-bold text-gray-900">59€ / mois</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">11 – 15 chambres/studios</span>
                <span className="font-bold text-gray-900">89€ / mois</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">16 – 20 chambres/studios</span>
                <span className="font-bold text-gray-900">120€ / mois</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">21 – 30 chambres/studios</span>
                <span className="font-bold text-amber-600">160€ / mois</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">31 – 50 chambres/studios</span>
                <span className="font-bold text-amber-600">199€ / mois</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">50+ chambres/studios</span>
                <span className="font-bold text-amber-600">250€ / mois</span>
              </div>
            </div>
            <ul className="space-y-2 mb-8 flex-1">
              {['Tout le plan Meublé inclus', '🔗 Channel manager inclus', 'Sync Booking.com, Airbnb, Expedia', 'Gestion par type de chambre + stock', 'Moteur multi-unités', 'Analytics taux d\'occupation', 'Support prioritaire'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500 font-bold flex-shrink-0">✓</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={() => handleSubscribe('hotel')} disabled={loading === 'hotel'}
              className="w-full py-3 rounded-xl font-semibold bg-amber-500 text-white hover:bg-amber-600 transition disabled:opacity-50">
              {loading === 'hotel' ? 'Redirection...' : 'Commencer — 14j gratuits'}
            </button>
          </div>
        </div>
      </div>

      {/* Plan Sur mesure */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        <div className="bg-gray-900 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-gray-400 text-sm font-semibold mb-1">+10 logements</div>
            <h2 className="text-2xl font-bold text-white mb-2">Sur mesure — Devis gratuit</h2>
            <p className="text-gray-400 text-sm">Vous gérez plus de 10 logements ? Contactez-nous pour un tarif adapté à votre volume.</p>
          </div>
          <Link href="/contact" className="shrink-0 bg-white text-gray-900 font-bold px-8 py-3 rounded-xl hover:bg-gray-100 transition whitespace-nowrap">
            Demander un devis →
          </Link>
        </div>
      </div>

      {/* Services à la carte */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Services disponibles séparément</h2>
          <p className="text-gray-500">Sans abonnement StayDirect — facturation indépendante</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Livret d'accueil — avec bouton Acheter */}
          <div className="bg-white rounded-2xl border-2 border-blue-200 p-6 flex items-center gap-5 shadow-sm relative">
            <div className="absolute -top-3 left-6 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              ✨ Disponible sans abonnement
            </div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 bg-blue-50">
              📖
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-900">Livret d'accueil QR Code</div>
              <div className="text-xs text-gray-400 mt-0.5">Sans abonnement StayDirect</div>
              <button
                onClick={() => handleSubscribe('livret')}
                disabled={loading === 'livret'}
                className="mt-3 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading === 'livret' ? 'Redirection...' : 'Acheter — 2.99€/mois →'}
              </button>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-black text-blue-700">2.99€</div>
              <div className="text-xs text-gray-400">/mois</div>
            </div>
          </div>

          {/* Livret hôtel */}
          <div className="bg-white rounded-2xl border-2 border-blue-200 p-6 flex items-center gap-5 shadow-sm relative">
            <div className="absolute -top-3 left-6 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              🏨 Hôtels & Résidences
            </div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 bg-blue-50">
              🏨
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-900">Livret d'accueil digital hôtel</div>
              <div className="text-xs text-gray-400 mt-0.5">Check-in/out · Petit-déj · Parking · Services</div>
              <Link href="/livret-hotel" className="mt-3 inline-block bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                En savoir plus →
              </Link>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-black text-blue-700">9€</div>
              <div className="text-xs text-gray-400">/mois</div>
            </div>
          </div>

          {/* Cautions bancaires */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-5 shadow-sm">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 bg-purple-50">
              🔒
            </div>
            <div className="flex-1">
              <div className="font-bold text-gray-900">Cautions bancaires</div>
              <div className="text-xs text-gray-400 mt-0.5">Sans abonnement StayDirect</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-black text-purple-700">0.25€ + 1.5%</div>
              <div className="text-xs text-gray-400">par caution (facturé au voyageur)</div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/contact" className="text-sm text-blue-600 hover:underline font-medium">
            Vous avez des questions sur les tarifs ? Contactez-nous →
          </Link>
        </div>
      </div>

      {/* Détail frais cautions */}
      <div className="max-w-3xl mx-auto px-6 pb-12">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">🔒 Détail des frais de caution</h2>
        <p className="text-center text-gray-500 text-sm mb-8">Frais facturés au voyageur — le propriétaire ne paie rien</p>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-500">Action</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-blue-700">Abonné StayDirect</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-400">Sans abonnement</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900 text-sm">Blocage caution</div>
                  <div className="text-xs text-gray-400">Montant bloqué, non débité</div>
                </td>
                <td className="px-6 py-4 text-center font-bold text-blue-700 bg-blue-50/30">0.25€ + 0.99%</td>
                <td className="px-6 py-4 text-center text-gray-600 font-medium">0.25€ + 1.5%</td>
              </tr>
              <tr>
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900 text-sm">Encaissement</div>
                  <div className="text-xs text-gray-400">En cas de dommages constatés</div>
                </td>
                <td className="px-6 py-4 text-center font-bold text-blue-700 bg-blue-50/30">0.25€ + 2.99%</td>
                <td className="px-6 py-4 text-center text-gray-600 font-medium">0.25€ + 2.99%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm text-green-700 text-center">
          ✅ Si aucun dommage → caution libérée, <strong>aucun frais débité</strong>
        </div>
      </div>

      {/* Comparaison */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">StayDirect vs Airbnb & Booking</h2>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-500">Critère</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-blue-700">StayDirect</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-400">Airbnb</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-400">Booking.com</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Commission', staydirect: '0%', airbnb: '~15%', booking: '~20%' },
                { label: 'Abonnement', staydirect: 'Dès 9€/mois', airbnb: 'Gratuit*', booking: 'Gratuit*' },
                { label: 'Livret d\'accueil', staydirect: '✅ Inclus', airbnb: '❌', booking: '❌' },
                { label: 'Cautions bancaires', staydirect: '✅ Inclus', airbnb: '❌', booking: '❌' },
                { label: 'Votre domaine', staydirect: '✅ Inclus', airbnb: '❌', booking: '❌' },
                { label: 'Accès client direct', staydirect: '✅', airbnb: '❌', booking: '❌' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0">
                  <td className="px-6 py-3.5 text-sm text-gray-700 font-medium">{row.label}</td>
                  <td className="px-6 py-3.5 text-sm text-center font-bold text-blue-700 bg-blue-50/30">{row.staydirect}</td>
                  <td className="px-6 py-3.5 text-sm text-center text-gray-400">{row.airbnb}</td>
                  <td className="px-6 py-3.5 text-sm text-center text-gray-400">{row.booking}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 text-center mt-3">* Gratuit mais prennent jusqu'à 20% sur chaque réservation</p>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Questions fréquentes</h2>
        <div className="space-y-4">
          {[
            { q: 'Y a-t-il des commissions sur les réservations ?', a: 'Non. StayDirect ne prélève aucune commission sur vos réservations directes. Vous payez uniquement l\'abonnement mensuel fixe. Les seuls frais sont ceux du prestataire de paiement (Stripe ~1,4% + 0,25€) directement sur chaque transaction — ces frais ne vont pas à StayDirect.' },
            { q: 'Comment est calculé mon abonnement si j\'ai plusieurs logements ?', a: 'Pour les meublés, villas et châteaux : 9€/logement pour les 4 premiers, puis 5€ pour chaque logement supplémentaire. Pour les hôtels et appart-hôtels : forfait fixe selon le nombre de chambres (59€ ≤10, 89€ ≤15, 120€ ≤20, 160€ ≤30, 199€ ≤50, 250€ au-delà). Le channel manager est inclus pour tous les plans.' },
            { q: 'Que comprend l\'essai gratuit de 14 jours ?', a: 'L\'accès complet à toutes les fonctionnalités : PMS, site de réservation, calendrier, livret QR, cautions bancaires. Aucune carte bancaire requise pour démarrer. À la fin des 14 jours, vous choisissez un plan ou votre compte est suspendu (vos données sont conservées).' },
            { q: 'Le livret d\'accueil et les cautions sont-ils vraiment inclus ?', a: 'Oui, les deux sont inclus dans tous les plans StayDirect payants. Sans abonnement, ils sont disponibles séparément : livret à 2.99€/mois, cautions à 0.25€ + 2% par caution.' },
            { q: 'Comment fonctionnent les cautions bancaires ?', a: 'Vous créez une demande de caution depuis votre dashboard. Votre voyageur reçoit un lien sécurisé, entre sa carte, et le montant est bloqué (pas débité). Après le séjour : vous libérez en 1 clic ou vous encaissez en cas de dégâts. Frais payés par le voyageur : 0.25€ + 0.99% (abonné) ou 0.25€ + 2.99% (sans abonnement).' },
            { q: 'Comment fonctionne la synchronisation des calendriers Airbnb et Booking ?', a: 'Deux options disponibles pour tous les comptes. (1) Synchronisation iCal : copiez votre lien iCal depuis Airbnb ou Booking.com et collez-le dans le dashboard. Import automatique des disponibilités. (2) Channel manager : synchronisation temps réel bidirectionnelle des disponibilités, tarifs et réservations avec Airbnb, Booking.com, Expedia et Vrbo.' },
            { q: 'Qu\'est-ce que le channel manager et est-il disponible ?', a: 'Oui, le channel manager est disponible pour tous les comptes StayDirect. Il synchronise en temps réel les disponibilités, tarifs et réservations avec Airbnb, Booking.com, Expedia et Vrbo depuis un seul tableau de bord. Configurez-le depuis Canaux de distribution dans votre dashboard.' },
            { q: 'Puis-je avoir plusieurs logements avec des types différents ?', a: 'Oui. Chaque logement est géré indépendamment avec son propre calendrier, ses propres tarifs et son propre site. Vous pouvez mélanger appartements, villas et chambres dans un même compte.' },
            { q: 'Puis-je annuler à tout moment ?', a: 'Oui, sans engagement ni frais de résiliation. Annulation depuis votre dashboard en 1 clic. Votre compte reste actif jusqu\'à la fin de la période payée.' },
            { q: 'Est-ce que mon site de réservation sera visible sur Google ?', a: 'Oui. Chaque site créé avec StayDirect est optimisé pour le référencement : balises SEO automatiques, sitemap, données structurées Google, et domaine personnalisé. Vos voyageurs peuvent vous trouver directement via une recherche Google.' },
          ].map((item) => (
            <div key={item.q} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
