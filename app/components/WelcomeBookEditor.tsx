'use client'
import { useState, useEffect } from 'react'

interface ListItem {
  name: string
  description: string
  distance?: string
}

interface WelcomeBookData {
  id?: string
  welcomeMessage?: string
  checkInTime?: string
  checkOutTime?: string
  checkInInstructions?: string
  checkOutInstructions?: string
  wifiName?: string
  wifiPassword?: string
  houseRules?: string
  ownerPhone?: string
  emergencyPhone?: string
  restaurants?: string
  activities?: string
  transport?: string
  localTips?: string
  views?: number
}

interface Property {
  id: string
  name: string
  city: string
}

interface Props {
  properties: Property[]
}

const SECTIONS = [
  { key: 'welcome', icon: '👋', label: 'Bienvenue' },
  { key: 'checkin', icon: '🔑', label: 'Arrivée & Départ' },
  { key: 'wifi', icon: '📶', label: 'WiFi' },
  { key: 'rules', icon: '📋', label: 'Règles' },
  { key: 'restaurants', icon: '🍽️', label: 'Restaurants' },
  { key: 'activities', icon: '🎯', label: 'Activités' },
  { key: 'transport', icon: '🚗', label: 'Transports' },
  { key: 'tips', icon: '💡', label: 'Conseils' },
  { key: 'contact', icon: '📞', label: 'Contact' },
]

export default function WelcomeBookEditor({ properties }: Props) {
  const [selectedPropertyId, setSelectedPropertyId] = useState(properties[0]?.id || '')
  const [book, setBook] = useState<WelcomeBookData>({})
  const [activeSection, setActiveSection] = useState('welcome')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [restaurants, setRestaurants] = useState<ListItem[]>([])
  const [activities, setActivities] = useState<ListItem[]>([])
  const [transport, setTransport] = useState<ListItem[]>([])

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://staydirect.fr'
  const livretUrl = book.id ? `${appUrl}/livret/${book.id}` : null
  const qrUrl = livretUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(livretUrl)}&bgcolor=ffffff&color=1e40af&margin=10` : null

  useEffect(() => {
    if (selectedPropertyId) fetchBook()
  }, [selectedPropertyId])

  const fetchBook = async () => {
    setLoading(true)
    const res = await fetch(`/api/welcome-book?propertyId=${selectedPropertyId}`)
    const data = await res.json()
    setBook(data)
    setRestaurants(data.restaurants ? JSON.parse(data.restaurants) : [])
    setActivities(data.activities ? JSON.parse(data.activities) : [])
    setTransport(data.transport ? JSON.parse(data.transport) : [])
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    await fetch('/api/welcome-book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId: selectedPropertyId,
        ...book,
        restaurants: JSON.stringify(restaurants),
        activities: JSON.stringify(activities),
        transport: JSON.stringify(transport),
      }),
    })
    await fetchBook()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const set = (key: keyof WelcomeBookData, value: string) => setBook(b => ({ ...b, [key]: value }))

  const addItem = (list: ListItem[], setList: (l: ListItem[]) => void) =>
    setList([...list, { name: '', description: '', distance: '' }])

  const updateItem = (list: ListItem[], setList: (l: ListItem[]) => void, i: number, key: string, value: string) => {
    const updated = [...list]
    updated[i] = { ...updated[i], [key]: value }
    setList(updated)
  }

  const removeItem = (list: ListItem[], setList: (l: ListItem[]) => void, i: number) =>
    setList(list.filter((_, idx) => idx !== i))

  const copyUrl = () => {
    if (livretUrl) navigator.clipboard.writeText(livretUrl)
  }

  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
        <div className="text-4xl mb-3">📖</div>
        <div className="font-bold text-gray-700 mb-2">Aucun logement</div>
        <div className="text-gray-400 text-sm">Ajoutez d'abord un logement pour créer son livret d'accueil</div>
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* Sélection logement */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <label className="block text-xs font-semibold text-gray-500 mb-2">Logement</label>
        <select
          value={selectedPropertyId}
          onChange={e => setSelectedPropertyId(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {properties.map(p => (
            <option key={p.id} value={p.id}>{p.name} — {p.city}</option>
          ))}
        </select>
      </div>

      {/* QR Code + lien */}
      {book.id && livretUrl && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5">
          <div className="flex items-center gap-6">
            {qrUrl && (
              <div className="flex flex-col items-center gap-2">
                <img src={qrUrl} alt="QR Code" className="w-28 h-28 rounded-xl border-4 border-white shadow-md" />
                <a
                  href={qrUrl + '&format=png'}
                  download="qrcode-livret.png"
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  ⬇️ Télécharger QR
                </a>
              </div>
            )}
            <div className="flex-1">
              <div className="font-bold text-gray-900 mb-1">🔗 Lien du livret</div>
              <div className="text-xs text-gray-500 mb-3">À imprimer, envoyer par email ou SMS à vos voyageurs</div>
              <div className="flex gap-2 items-center">
                <div className="flex-1 bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs text-blue-700 font-mono truncate">
                  {livretUrl}
                </div>
                <button onClick={copyUrl} className="bg-blue-600 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition">
                  📋 Copier
                </button>
              </div>
              {book.views !== undefined && book.views > 0 && (
                <div className="text-xs text-gray-400 mt-2">👁️ Vu {book.views} fois</div>
              )}
              <a href={livretUrl} target="_blank" className="text-xs text-blue-500 hover:underline mt-1 inline-block">
                Prévisualiser →
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        {/* Navigation sections */}
        <div className="w-44 flex-shrink-0 space-y-1">
          {SECTIONS.map(s => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                activeSection === s.key ? 'bg-blue-600 text-white' : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Contenu section */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-400">Chargement...</div>
          ) : (
            <>
              {/* BIENVENUE */}
              {activeSection === 'welcome' && (
                <SectionWrap title="👋 Message de bienvenue" desc="Le premier message que verront vos voyageurs">
                  <textarea
                    rows={5}
                    value={book.welcomeMessage || ''}
                    onChange={e => set('welcomeMessage', e.target.value)}
                    placeholder="Bienvenue dans mon logement ! Je suis ravi de vous accueillir..."
                    className={inputClass + ' resize-none'}
                  />
                </SectionWrap>
              )}

              {/* CHECK-IN */}
              {activeSection === 'checkin' && (
                <SectionWrap title="🔑 Arrivée & Départ" desc="Horaires et instructions">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Heure d'arrivée</label>
                      <input type="time" value={book.checkInTime || ''} onChange={e => set('checkInTime', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Heure de départ</label>
                      <input type="time" value={book.checkOutTime || ''} onChange={e => set('checkOutTime', e.target.value)} className={inputClass} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className={labelClass}>Instructions d'arrivée</label>
                    <textarea rows={4} value={book.checkInInstructions || ''} onChange={e => set('checkInInstructions', e.target.value)}
                      placeholder="Le logement est au 2ème étage, code de la porte : 1234..." className={inputClass + ' resize-none'} />
                  </div>
                  <div className="mt-4">
                    <label className={labelClass}>Instructions de départ</label>
                    <textarea rows={3} value={book.checkOutInstructions || ''} onChange={e => set('checkOutInstructions', e.target.value)}
                      placeholder="Merci de fermer les fenêtres et laisser les clés sur la table..." className={inputClass + ' resize-none'} />
                  </div>
                </SectionWrap>
              )}

              {/* WIFI */}
              {activeSection === 'wifi' && (
                <SectionWrap title="📶 WiFi" desc="Informations de connexion">
                  <div>
                    <label className={labelClass}>Nom du réseau (SSID)</label>
                    <input value={book.wifiName || ''} onChange={e => set('wifiName', e.target.value)} placeholder="MonWifi_5G" className={inputClass} />
                  </div>
                  <div className="mt-4">
                    <label className={labelClass}>Mot de passe</label>
                    <input value={book.wifiPassword || ''} onChange={e => set('wifiPassword', e.target.value)} placeholder="motdepasse123" className={inputClass} />
                  </div>
                </SectionWrap>
              )}

              {/* RÈGLES */}
              {activeSection === 'rules' && (
                <SectionWrap title="📋 Règles de la maison" desc="Ce que vos voyageurs doivent savoir">
                  <textarea rows={8} value={book.houseRules || ''}
                    onChange={e => set('houseRules', e.target.value)}
                    placeholder="• Pas de fête ni de bruit après 22h&#10;• Animaux non admis&#10;• Interdiction de fumer à l'intérieur&#10;• Respectez les voisins..."
                    className={inputClass + ' resize-none'} />
                </SectionWrap>
              )}

              {/* RESTAURANTS */}
              {activeSection === 'restaurants' && (
                <SectionWrap title="🍽️ Restaurants recommandés" desc="Vos coups de cœur à partager">
                  <ListEditor items={restaurants} setItems={setRestaurants} showDistance placeholder={{ name: 'Le Bistrot du Coin', description: 'Cuisine française, rapport qualité-prix excellent', distance: '200m' }} />
                </SectionWrap>
              )}

              {/* ACTIVITÉS */}
              {activeSection === 'activities' && (
                <SectionWrap title="🎯 Activités & Visites" desc="Ce qu'il faut faire dans les environs">
                  <ListEditor items={activities} setItems={setActivities} placeholder={{ name: 'Musée de la ville', description: 'À visiter absolument, ouvert 9h-18h' }} />
                </SectionWrap>
              )}

              {/* TRANSPORT */}
              {activeSection === 'transport' && (
                <SectionWrap title="🚗 Transports" desc="Comment se déplacer">
                  <ListEditor items={transport} setItems={setTransport} placeholder={{ name: 'Métro Ligne A', description: 'Station à 5 min à pied, direction Centre' }} />
                </SectionWrap>
              )}

              {/* CONSEILS */}
              {activeSection === 'tips' && (
                <SectionWrap title="💡 Conseils de l'hôte" desc="Vos conseils personnels">
                  <textarea rows={6} value={book.localTips || ''} onChange={e => set('localTips', e.target.value)}
                    placeholder="Le marché a lieu le dimanche matin, à ne pas manquer ! La boulangerie du coin fait un pain au chocolat exceptionnel..."
                    className={inputClass + ' resize-none'} />
                </SectionWrap>
              )}

              {/* CONTACT */}
              {activeSection === 'contact' && (
                <SectionWrap title="📞 Contacts" desc="Numéros importants">
                  <div>
                    <label className={labelClass}>Votre numéro (hôte)</label>
                    <input value={book.ownerPhone || ''} onChange={e => set('ownerPhone', e.target.value)} placeholder="+33 6 12 34 56 78" className={inputClass} />
                  </div>
                  <div className="mt-4">
                    <label className={labelClass}>Numéro d'urgence / dépannage</label>
                    <input value={book.emergencyPhone || ''} onChange={e => set('emergencyPhone', e.target.value)} placeholder="+33 6 00 00 00 00" className={inputClass} />
                  </div>
                </SectionWrap>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bouton sauvegarder */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? '⏳ Enregistrement...' : saved ? '✅ Enregistré !' : '💾 Enregistrer le livret'}
        </button>
      </div>
    </div>
  )
}

const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const labelClass = 'block text-xs font-semibold text-gray-500 mb-1.5'

function SectionWrap({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-5">
        <h3 className="font-bold text-gray-900 text-base">{title}</h3>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      {children}
    </div>
  )
}

function ListEditor({ items, setItems, showDistance, placeholder }: {
  items: ListItem[]
  setItems: (l: ListItem[]) => void
  showDistance?: boolean
  placeholder: { name: string; description: string; distance?: string }
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex gap-2">
            <input
              value={item.name}
              onChange={e => {
                const updated = [...items]; updated[i] = { ...updated[i], name: e.target.value }; setItems(updated)
              }}
              placeholder={placeholder.name}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <button onClick={() => setItems(items.filter((_, idx) => idx !== i))}
              className="px-3 py-2 text-red-400 hover:text-red-600 text-lg">×</button>
          </div>
          <input
            value={item.description}
            onChange={e => {
              const updated = [...items]; updated[i] = { ...updated[i], description: e.target.value }; setItems(updated)
            }}
            placeholder={placeholder.description}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          {showDistance && (
            <input
              value={item.distance || ''}
              onChange={e => {
                const updated = [...items]; updated[i] = { ...updated[i], distance: e.target.value }; setItems(updated)
              }}
              placeholder="Distance (ex: 200m, 5 min à pied)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          )}
        </div>
      ))}
      <button
        onClick={() => setItems([...items, { name: '', description: '', distance: '' }])}
        className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition font-medium"
      >
        + Ajouter
      </button>
    </div>
  )
}
