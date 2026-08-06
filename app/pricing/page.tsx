'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const plans = [
  {
    id: 'starter',
    name: 'Solo',
    price: 9,
    description: '1 logement',
    features: [
      '1 logement',
      'Site de réservation pro',
      '🌍 Domaine personnalisé inclus',
      'Paiement Stripe direct',
      'Sync iCal Airbnb & Booking',
      '📖 Livret d\'accueil QR inclus',
      '🔒 Cautions bancaires incluses',
      'Emails de confirmation',
      'Support email',
    ],
    color: 'gray',
    cta: 'Commencer — 14j gratuits',
  },
  {
    id: 'pro',
    name: 'Hôte',
    price: 39,
    description: '2 à 5 logements',
    features: [
      '2 à 5 logements',
      'Tout le plan Solo',
      '🌍 Domaine personnalisé inclus',
      'Calendrier unifié',
      '📖 Livret d\'accueil QR inclus',
      '🔒 Cautions bancaires incluses',
      'Prix dynamiques par jour',
      'Analytics & statistiques',
      'Support prioritaire',
    ],
    color: 'blue',
    cta: 'Commencer — 14j gratuits',
    popular: true,
  },
  {
    id: 'business',
    name: 'Agence / Conciergerie',
    price: 79,
    description: '+5 logements ou gestion pour d\'autres propriétaires',
    features: [
      'Au-delà de 5 logements',
      'Gestion pour d\'autres propriétaires',
      'Tout le plan Hôte',
      '🌍 Domaine personnalisé inclus',
      '📖 Livret d\'accueil QR inclus',
      '🔒 Cautions bancaires incluses',
      '4 thèmes de site au choix',
      'Analytics avancés',
      'Support téléphonique',
    ],
    color: 'purple',
    cta: 'Commencer — 14j gratuits',
  },
  {
    id: 'hotel',
    name: 'Hôtel / Appart-hôtel',
    price: 79,
    description: 'Jusqu\'à 20 unités (chambres, studios, emplacements)',
    features: [
      'Jusqu\'à 20 unités au total',
      'Gestion par type de chambre + stock',
      'Moteur de réservation multi-unités',
      '🌍 Domaine personnalisé inclus',
      '📖 Livret d\'accueil QR inclus',
      '🔒 Cautions bancaires incluses',
      'Prix dynamiques par type',
      'Analytics & taux d\'occupation',
      'Support prioritaire',
    ],
    color: 'amber',
    cta: 'Commencer — 14j gratuits',
    badge: '🏨 Établissements',
  },
]

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

  const handleSubscribe = async (planId: string) => {
    setLoading(planId)
    const res = await fetch('/api/billing/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planId }),
    })
    if (res.status === 401) { router.push(`/register?plan=${planId}`); return }
    const data = await res.json()
    if (data.url) window.location.href = data.url
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

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-6 pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className={`bg-white rounded-2xl border-2 p-8 relative flex flex-col ${plan.popular ? 'border-blue-500 shadow-lg shadow-blue-100' : (plan as any).badge ? 'border-amber-400 shadow-lg shadow-amber-50' : 'border-gray-100'}`}>
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-sm font-semibold px-4 py-1 rounded-full whitespace-nowrap">
                ⭐ Le plus populaire
              </div>
            )}
            {(plan as any).badge && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-sm font-semibold px-4 py-1 rounded-full whitespace-nowrap">
                {(plan as any).badge}
              </div>
            )}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
              <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">{plan.price}€</span>
                <span className="text-gray-400">/mois</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading === plan.id}
              className={`w-full py-3 rounded-xl font-semibold transition disabled:opacity-50 ${
                plan.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {loading === plan.id ? 'Redirection...' : plan.cta}
            </button>
          </div>
        ))}
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
            { q: 'Y a-t-il des commissions sur les réservations ?', a: 'Non. StayDirect ne prélève aucune commission. Vous payez uniquement l\'abonnement mensuel. Les seuls frais sont ceux de Stripe (1,4% + 0,25€) directement sur chaque transaction.' },
            { q: 'Le livret d\'accueil et les cautions sont-ils vraiment inclus ?', a: 'Oui, les deux sont inclus dans tous les plans StayDirect. Sans abonnement, ils sont disponibles séparément à 2.99€/mois et 2% par caution.' },
            { q: 'Comment fonctionnent les cautions bancaires ?', a: 'Votre voyageur reçoit un lien, entre sa carte, et le montant est bloqué (pas débité). Après le séjour, vous libérez la caution en 1 clic, ou vous l\'encaissez en cas de dégâts.' },
            { q: 'Puis-je changer de plan à tout moment ?', a: 'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment depuis votre dashboard.' },
            { q: 'Comment fonctionne la synchronisation iCal ?', a: 'Vous collez simplement le lien iCal de votre logement Airbnb ou Booking. StayDirect importe automatiquement les dates réservées pour éviter les doubles réservations.' },
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
