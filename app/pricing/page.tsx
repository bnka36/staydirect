'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const plans = [
  {
    id: 'starter',
    name: 'Solo',
    price: 19,
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
    cta: 'Commencer',
  },
  {
    id: 'pro',
    name: 'Petit propriétaire',
    price: 39,
    description: 'Jusqu\'à 5 logements',
    features: [
      'Jusqu\'à 5 logements',
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
    cta: 'Choisir ce plan',
    popular: true,
  },
  {
    id: 'business',
    name: 'Pro / Agence',
    price: 69,
    description: 'Jusqu\'à 15 logements',
    features: [
      'Jusqu\'à 15 logements',
      'Tout le plan Petit propriétaire',
      '🌍 Domaine personnalisé inclus',
      '📖 Livret d\'accueil QR inclus',
      '🔒 Cautions bancaires incluses',
      '4 thèmes de site au choix',
      'Analytics avancés',
      'Support téléphonique',
    ],
    color: 'purple',
    cta: 'Choisir ce plan',
  },
]

const addons = [
  {
    icon: '📖',
    name: 'Livret d\'accueil QR Code',
    price: '4.90€',
    unit: '/mois par logement',
    desc: 'Sans abonnement StayDirect',
    color: 'blue',
  },
  {
    icon: '🔒',
    name: 'Cautions bancaires',
    price: '2%',
    unit: 'du montant caution',
    desc: 'Sans abonnement StayDirect (min. 1€)',
    color: 'purple',
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
    if (res.status === 401) { router.push('/register'); return }
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

      {/* Plans */}
      <div className="max-w-5xl mx-auto px-6 pb-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div key={plan.id} className={`bg-white rounded-2xl border-2 p-8 relative flex flex-col ${plan.popular ? 'border-blue-500 shadow-lg shadow-blue-100' : 'border-gray-100'}`}>
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-sm font-semibold px-4 py-1 rounded-full whitespace-nowrap">
                ⭐ Le plus populaire
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

      {/* Services à la carte */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Services disponibles séparément</h2>
          <p className="text-gray-500">Sans abonnement StayDirect — facturation indépendante</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {addons.map((addon, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-5 shadow-sm">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${addon.color === 'blue' ? 'bg-blue-50' : 'bg-purple-50'}`}>
                {addon.icon}
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900">{addon.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{addon.desc}</div>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-2xl font-black ${addon.color === 'blue' ? 'text-blue-700' : 'text-purple-700'}`}>{addon.price}</div>
                <div className="text-xs text-gray-400">{addon.unit}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <Link href="/contact" className="text-sm text-blue-600 hover:underline font-medium">
            Vous avez des questions sur les tarifs ? Contactez-nous →
          </Link>
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
                { label: 'Abonnement', staydirect: 'Dès 19€/mois', airbnb: 'Gratuit*', booking: 'Gratuit*' },
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
            { q: 'Le livret d\'accueil et les cautions sont-ils vraiment inclus ?', a: 'Oui, les deux sont inclus dans tous les plans StayDirect. Sans abonnement, ils sont disponibles séparément à 4.90€/mois et 2% par caution.' },
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
