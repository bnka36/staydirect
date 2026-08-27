'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const businessTypes = [
  { id: 'meuble', icon: '🏠', label: 'Meublé de tourisme', desc: 'Appartement, gîte, chalet en location courte durée', stock: false },
  { id: 'villa', icon: '🌴', label: 'Villa', desc: 'Villa avec piscine, maison de vacances haut de gamme', stock: false },
  { id: 'chateau', icon: '🏰', label: 'Château', desc: 'Château, manoir, domaine de prestige', stock: false },
  { id: 'maison_hotes', icon: '🏡', label: 'Maison d\'hôtes', desc: 'Chambres chez l\'habitant avec service petit-déjeuner', stock: false },
  { id: 'chambre_hotes', icon: '🛏️', label: 'Chambre d\'hôtes', desc: 'Une ou plusieurs chambres dans votre résidence principale', stock: false },
  { id: 'hotel', icon: '🏨', label: 'Hôtel', desc: 'Établissement hôtelier avec plusieurs types de chambres', stock: true },
  { id: 'appart_hotel', icon: '🏢', label: 'Appart-hôtel', desc: 'Studios et appartements meublés à la nuit ou à la semaine', stock: true },
  { id: 'camping', icon: '⛺', label: 'Camping / Glamping', desc: 'Emplacements, bungalows, tentes lodge ou cabanes', stock: true },
]

const steps = [
  { id: 1, label: 'Type d\'établissement', icon: '🏠' },
  { id: 2, label: 'Votre établissement', icon: '📍' },
  { id: 3, label: 'Prêt à démarrer', icon: '🚀' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(false)
  const [propertyName, setPropertyName] = useState('')
  const [city, setCity] = useState('')

  const selectedType = businessTypes.find(b => b.id === selected)

  const handleFinish = async () => {
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
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="font-bold text-xl text-gray-900">StayDirect</span>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                step === s.id ? 'bg-blue-600 text-white shadow-md shadow-blue-100' :
                step > s.id ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-400'
              }`}>
                <span>{step > s.id ? '✓' : s.icon}</span>
                <span className="hidden sm:block">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${step > s.id ? 'bg-green-300' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 — Type */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8">
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
              onClick={() => setStep(2)}
              disabled={!selected}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed text-lg"
            >
              Continuer →
            </button>
          </div>
        )}

        {/* Step 2 — Établissement */}
        {step === 2 && (
          <div>
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">{selectedType?.icon}</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Votre {selectedType?.label}</h1>
              <p className="text-gray-500">Ces infos seront utilisées pour créer votre site de réservation.</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nom de votre établissement</label>
                <input
                  type="text"
                  value={propertyName}
                  onChange={e => setPropertyName(e.target.value)}
                  placeholder={`ex : ${selectedType?.label === 'Hôtel' ? 'Hôtel Le Grand Bleu' : selectedType?.label === 'Villa' ? 'Villa Les Oliviers' : 'Appartement Vue Mer'}`}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ville</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="ex : Nice, Paris, Bordeaux..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Aperçu de ce qui suit */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
              <p className="text-sm font-semibold text-blue-800 mb-3">Dans votre tableau de bord, vous pourrez :</p>
              <div className="space-y-2">
                {[
                  '📸 Ajouter des photos de vos logements',
                  '💰 Configurer vos tarifs et prix dynamiques',
                  '🌐 Personnaliser votre site de réservation',
                  '📅 Connecter vos calendriers Airbnb et Booking',
                  '💳 Activer les paiements Stripe',
                ].map(item => (
                  <div key={item} className="text-xs text-blue-700 flex items-center gap-2">
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-gray-200 text-gray-600 py-3.5 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                ← Retour
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-[2] bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Prêt */}
        {step === 3 && (
          <div className="text-center">
            <div className="text-6xl mb-6">🚀</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Tout est prêt !</h1>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Votre compte est configuré. Accédez à votre tableau de bord pour ajouter vos logements, connecter vos calendriers et personnaliser votre site.
            </p>
            <div className="bg-white border border-gray-100 rounded-2xl p-6 text-left mb-8 space-y-4">
              <p className="text-sm font-bold text-gray-700 mb-3">Vos 5 premières étapes :</p>
              {[
                { icon: '🏠', text: 'Ajouter votre premier logement', done: false },
                { icon: '📸', text: 'Importer vos photos', done: false },
                { icon: '💰', text: 'Configurer vos tarifs', done: false },
                { icon: '📅', text: 'Coller votre lien iCal Airbnb / Booking', done: false },
                { icon: '🌐', text: 'Activer votre site de réservation', done: false },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-lg flex-shrink-0">{item.icon}</div>
                  <span className="text-sm text-gray-700">{item.text}</span>
                  <div className="ml-auto w-5 h-5 rounded-full border-2 border-gray-200 flex-shrink-0" />
                </div>
              ))}
            </div>
            <button
              onClick={handleFinish}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? 'Chargement...' : 'Accéder à mon tableau de bord →'}
            </button>
            <p className="text-xs text-gray-400 mt-3">14 jours gratuits — sans carte bancaire</p>
          </div>
        )}
      </div>
    </div>
  )
}
