'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

const STEPS = [
  { id: 1, title: 'Bienvenue !', icon: '🎉' },
  { id: 2, title: 'Votre logement', icon: '🏠' },
  { id: 3, title: 'Sync iCal', icon: '📅' },
  { id: 4, title: 'C\'est prêt !', icon: '🚀' },
]

export default function OnboardingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '', city: '', pricePerNight: '', maxGuests: '2', description: '', icalUrls: ''
  })
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [propertyCreated, setPropertyCreated] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    setUploading(true)
    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) setImages(prev => [...prev, data.url])
    }
    setUploading(false)
  }

  const createProperty = async () => {
    if (!form.name || !form.city || !form.pricePerNight) return
    setSaving(true)
    await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        images,
        icalUrls: form.icalUrls ? form.icalUrls.split('\n').filter(Boolean) : [],
      }),
    })
    setSaving(false)
    setPropertyCreated(true)
    setStep(3)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= s.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {step > s.id ? '✓' : s.id}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-10 h-0.5 transition-all ${step > s.id ? 'bg-blue-600' : 'bg-gray-100'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-50 overflow-hidden border border-gray-100">

          {/* Step 1 — Bienvenue */}
          {step === 1 && (
            <div className="p-10 text-center">
              <div className="text-6xl mb-6">🎉</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Bienvenue sur StayDirect{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''} !
              </h1>
              <p className="text-gray-500 text-lg mb-2">Votre compte est créé. Félicitations !</p>
              <p className="text-gray-400 mb-8">En 3 étapes, votre logement sera en ligne et prêt à recevoir des réservations directes.</p>

              <div className="grid grid-cols-3 gap-4 mb-10">
                {[
                  { icon: '🏠', label: 'Créez votre logement' },
                  { icon: '📅', label: 'Sync vos calendriers' },
                  { icon: '💰', label: 'Recevez des paiements' },
                ].map(item => (
                  <div key={item.label} className="bg-blue-50 rounded-2xl p-4">
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <div className="text-sm text-blue-800 font-medium">{item.label}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200"
              >
                Commencer →
              </button>
              <div className="mt-4">
                <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">
                  Passer cette étape, aller au dashboard
                </Link>
              </div>
            </div>
          )}

          {/* Step 2 — Logement */}
          {step === 2 && (
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🏠</div>
                <h2 className="text-2xl font-bold text-gray-900">Décrivez votre logement</h2>
                <p className="text-gray-500 text-sm mt-1">Vous pourrez modifier ces infos plus tard</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nom du logement *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Studio cozy à Paris 11ème"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Ville *</label>
                    <input
                      value={form.city}
                      onChange={e => setForm({ ...form, city: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Paris"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Prix/nuit (€) *</label>
                    <input
                      type="number"
                      value={form.pricePerNight}
                      onChange={e => setForm({ ...form, pricePerNight: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="80"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description courte</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Bel appartement lumineux..."
                  />
                </div>

                {/* Upload photos */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Photos (optionnel)</label>
                  <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                    <span className="text-2xl mb-1">📷</span>
                    <span className="text-sm text-gray-400">Ajouter des photos</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                  </label>
                  {uploading && <p className="text-xs text-blue-500 mt-1 text-center">Upload en cours...</p>}
                  {images.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {images.map((url, i) => (
                        <img key={i} src={url} className="w-16 h-16 object-cover rounded-lg" alt="" />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="px-5 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition font-medium">
                  ← Retour
                </button>
                <button
                  onClick={createProperty}
                  disabled={!form.name || !form.city || !form.pricePerNight || saving || uploading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? 'Création...' : 'Créer mon logement →'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — iCal */}
          {step === 3 && (
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">📅</div>
                <h2 className="text-2xl font-bold text-gray-900">Synchroniser vos calendriers</h2>
                <p className="text-gray-500 text-sm mt-1">Évitez les doubles réservations avec Airbnb et Booking</p>
              </div>

              <div className="bg-blue-50 rounded-2xl p-5 mb-5 border border-blue-100">
                <h3 className="font-semibold text-blue-900 mb-3 text-sm">Comment récupérer votre lien Airbnb ?</h3>
                <ol className="space-y-2 text-sm text-blue-800">
                  <li className="flex gap-2"><span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>Airbnb → Calendrier → Paramètres</li>
                  <li className="flex gap-2"><span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>Disponibilités → Exporter calendrier</li>
                  <li className="flex gap-2"><span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>Copier le lien iCal</li>
                </ol>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Liens iCal (un par ligne)</label>
                <textarea
                  value={form.icalUrls}
                  onChange={e => setForm({ ...form, icalUrls: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono"
                  rows={4}
                  placeholder={'https://www.airbnb.fr/calendar/ical/...\nhttps://www.booking.com/ical/...'}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(4)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition">
                  Passer cette étape
                </button>
                <button
                  onClick={async () => {
                    if (form.icalUrls) {
                      // Update the first property with ical urls
                      const propsRes = await fetch('/api/properties')
                      const props = await propsRes.json()
                      if (props[0]) {
                        await fetch(`/api/properties/${props[0].id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ ...props[0], icalUrls: form.icalUrls.split('\n').filter(Boolean) }),
                        })
                      }
                    }
                    setStep(4)
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                >
                  Enregistrer et continuer →
                </button>
              </div>
            </div>
          )}

          {/* Step 4 — Done */}
          {step === 4 && (
            <div className="p-10 text-center">
              <div className="text-6xl mb-6">🚀</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Tout est prêt !</h2>
              <p className="text-gray-500 text-lg mb-8">Votre logement est en ligne et prêt à recevoir des réservations directes.</p>

              <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span>
                  <span className="text-gray-700">Compte créé</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${propertyCreated ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {propertyCreated ? '✓' : '–'}
                  </span>
                  <span className="text-gray-700">Logement créé</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${form.icalUrls ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {form.icalUrls ? '✓' : '–'}
                  </span>
                  <span className="text-gray-700">Calendriers synchronisés</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  href="/dashboard"
                  className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                >
                  Aller à mon dashboard →
                </Link>
                <Link
                  href="/pricing"
                  className="border border-gray-200 text-gray-600 px-8 py-3 rounded-2xl font-medium hover:bg-gray-50 transition"
                >
                  Choisir un abonnement
                </Link>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          StayDirect · Réservations directes sans commission
        </p>
      </div>
    </div>
  )
}
