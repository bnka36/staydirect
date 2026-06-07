'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const plans = [
  {
    id: 'starter',
    name: 'Solo',
    price: 19,
    maxProperties: 1,
    description: 'Parfait pour 1 logement',
    features: [
      '1 logement',
      'Site de réservation public',
      '🌍 Domaine perso inclus',
      'Paiement Stripe direct',
      'Sync iCal Airbnb/Booking',
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
    maxProperties: 5,
    description: 'Jusqu\'à 5 logements',
    features: [
      'Jusqu\'à 5 logements',
      'Tout le plan Solo',
      '🌍 Domaine perso inclus',
      'Calendrier unifié',
      'Photos illimitées',
      'Statistiques de revenus',
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
    maxProperties: 15,
    description: 'Jusqu\'à 15 logements',
    features: [
      'Jusqu\'à 15 logements',
      'Tout le plan Petit propriétaire',
      '🌍 Domaine perso inclus',
      '4 thèmes de site au choix',
      'Analytics avancés',
      'Support téléphonique',
    ],
    color: 'purple',
    cta: 'Choisir ce plan',
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
          <div className="flex gap-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">Connexion</Link>
            <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">S'inscrire</Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Tarifs simples et transparents</h1>
        <p className="text-xl text-gray-500 mb-4">Aucune commission sur vos réservations. Payez juste l'abonnement.</p>
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
          🎯 Domaine personnalisé inclus dans tous les plans
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-5xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div key={plan.id} className={`bg-white rounded-2xl border-2 p-8 relative ${plan.popular ? 'border-blue-500 shadow-lg shadow-blue-100' : 'border-gray-100'}`}>
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
                Le plus populaire
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

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-green-500 font-bold">✓</span>
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

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Questions fréquentes</h2>
        <div className="space-y-4">
          {[
            { q: 'Y a-t-il des commissions sur les réservations ?', a: 'Non. StayDirect ne prélève aucune commission. Vous payez uniquement l\'abonnement mensuel. Les seuls frais sont ceux de Stripe (1,4% + 0,25€) directement sur chaque transaction.' },
            { q: 'Puis-je changer de plan à tout moment ?', a: 'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment depuis votre dashboard.' },
            { q: 'Comment fonctionne la synchronisation iCal ?', a: 'Vous collez simplement le lien iCal de votre logement Airbnb ou Booking. StayDirect importe automatiquement les dates réservées pour éviter les doubles réservations.' },
          ].map((item) => (
            <div key={item.q} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
              <p className="text-gray-500 text-sm">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
