'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const businessTypes = [
  { id: 'meuble', icon: '🏠', label: 'Meublé de tourisme', desc: 'Appartement, villa, gîte, chalet en location courte durée', stock: false },
  { id: 'maison_hotes', icon: '🏡', label: 'Maison d\'hôtes', desc: 'Chambres chez l\'habitant avec service petit-déjeuner', stock: false },
  { id: 'chambre_hotes', icon: '🛏️', label: 'Chambre d\'hôtes', desc: 'Une ou plusieurs chambres dans votre résidence principale', stock: false },
  { id: 'hotel', icon: '🏨', label: 'Hôtel', desc: 'Établissement hôtelier avec plusieurs types de chambres', stock: true },
  { id: 'appart_hotel', icon: '🏢', label: 'Appart-hôtel', desc: 'Studios et appartements meublés à la nuit ou à la semaine', stock: true },
  { id: 'camping', icon: '⛺', label: 'Camping / Glamping', desc: 'Emplacements, bungalows, tentes lodge ou cabanes', stock: true },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(false)

  const handleContinue = async () => {
    if (!selected) return
    setLoading(true)
    await fetch('/api/onboarding/business-type', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessType: selected }),
    })
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bienvenue sur StayDirect !</h1>
          <p className="text-gray-500">Quel type d'établissement gérez-vous ?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {businessTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelected(type.id)}
              className={`text-left p-5 rounded-2xl border-2 transition-all ${
                selected === type.id
                  ? 'border-blue-600 bg-blue-50 shadow-md shadow-blue-100'
                  : 'border-gray-100 bg-white hover:border-blue-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{type.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-0.5">{type.label}</div>
                  <div className="text-xs text-gray-500 leading-relaxed">{type.desc}</div>
                  {type.stock && (
                    <div className="mt-2 inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                      📦 Gestion par type + stock
                    </div>
                  )}
                </div>
                {selected === type.id && (
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected || loading}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed text-lg"
        >
          {loading ? 'Enregistrement...' : 'Accéder à mon espace →'}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          Vous pourrez modifier ce choix dans vos paramètres
        </p>
      </div>
    </div>
  )
}
