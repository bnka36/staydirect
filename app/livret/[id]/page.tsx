import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import LangSwitcher from './_components/LangSwitcher'

const TRANSLATIONS = {
  fr: {
    welcome: 'Bienvenue !',
    host: 'Votre hôte',
    checkin_section: 'Arrivée & Départ',
    checkin: 'Check-in',
    checkout: 'Check-out',
    checkin_instructions: "Instructions d'arrivée",
    checkout_instructions: 'Instructions de départ',
    wifi: 'WiFi',
    network: 'Réseau',
    password: 'Mot de passe',
    rules: 'Règles de la maison',
    restaurants: 'Restaurants recommandés',
    activities: 'Activités & Visites',
    transport: 'Transports',
    tips: 'Conseils de votre hôte',
    contacts: 'Contacts',
    your_host: 'Votre hôte',
    emergency: 'Urgence',
    footer: 'Propulsé par',
  },
  en: {
    welcome: 'Welcome!',
    host: 'Your host',
    checkin_section: 'Check-in & Check-out',
    checkin: 'Check-in',
    checkout: 'Check-out',
    checkin_instructions: 'Arrival instructions',
    checkout_instructions: 'Departure instructions',
    wifi: 'WiFi',
    network: 'Network',
    password: 'Password',
    rules: 'House rules',
    restaurants: 'Recommended restaurants',
    activities: 'Activities & Sightseeing',
    transport: 'Transport',
    tips: 'Host tips',
    contacts: 'Contacts',
    your_host: 'Your host',
    emergency: 'Emergency',
    footer: 'Powered by',
  },
  es: {
    welcome: '¡Bienvenido!',
    host: 'Su anfitrión',
    checkin_section: 'Llegada y Salida',
    checkin: 'Entrada',
    checkout: 'Salida',
    checkin_instructions: 'Instrucciones de llegada',
    checkout_instructions: 'Instrucciones de salida',
    wifi: 'WiFi',
    network: 'Red',
    password: 'Contraseña',
    rules: 'Normas de la casa',
    restaurants: 'Restaurantes recomendados',
    activities: 'Actividades y Visitas',
    transport: 'Transporte',
    tips: 'Consejos del anfitrión',
    contacts: 'Contactos',
    your_host: 'Su anfitrión',
    emergency: 'Emergencia',
    footer: 'Desarrollado por',
  },
}

type Lang = keyof typeof TRANSLATIONS

async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || !text.trim()) return text
  // Tronquer à 400 caractères max pour éviter les erreurs MyMemory
  const truncated = text.length > 400 ? text.slice(0, 400) + '…' : text
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(truncated)}&langpair=fr|${targetLang}&de=bnk.a36@gmail.com`
    const res = await fetch(url, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(5000) }) // cache 24h, timeout 5s
    if (!res.ok) return text
    const data = await res.json()
    // Vérifier que la traduction est valide (MyMemory renvoie parfois 'PLEASE SELECT TWO DISTINCT LANGUAGES' etc.)
    const translated = data?.responseData?.translatedText
    if (!translated || translated.startsWith('PLEASE') || translated.startsWith('QUERY')) return text
    return translated
  } catch {
    return text
  }
}

async function translateAll(texts: Record<string, string>, targetLang: string): Promise<Record<string, string>> {
  const entries = Object.entries(texts).filter(([, v]) => v && v.trim())
  const results = await Promise.all(
    entries.map(async ([key, val]) => [key, await translateText(val, targetLang)])
  )
  return Object.fromEntries(results)
}

export default async function LivretPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ lang?: string }>
}) {
  const { id } = await params
  const { lang: langParam } = await searchParams
  const lang: Lang = (langParam as Lang) && TRANSLATIONS[langParam as Lang] ? (langParam as Lang) : 'fr'
  const t = TRANSLATIONS[lang]

  const book = await prisma.welcomeBook.findUnique({
    where: { id },
    include: {
      property: {
        select: {
          name: true,
          city: true,
          images: true,
          user: { select: { name: true, image: true } },
        },
      },
    },
  })

  if (!book || !book.isActive) notFound()

  await prisma.welcomeBook.update({ where: { id }, data: { views: book.views + 1 } })

  const restaurants: { name: string; description: string; distance?: string }[] = book.restaurants ? JSON.parse(book.restaurants) : []
  const activities: { name: string; description: string }[] = book.activities ? JSON.parse(book.activities) : []
  const transport: { name: string; description: string }[] = book.transport ? JSON.parse(book.transport) : []

  // Traduction automatique si langue différente du français
  let content = {
    welcomeMessage: book.welcomeMessage || '',
    checkInInstructions: book.checkInInstructions || '',
    checkOutInstructions: book.checkOutInstructions || '',
    houseRules: book.houseRules || '',
    localTips: book.localTips || '',
  }

  let translatedRestaurants = restaurants
  let translatedActivities = activities
  let translatedTransport = transport

  if (lang !== 'fr') {
    const myLang = lang === 'en' ? 'en' : 'es'

    // Traduire les champs texte principaux
    const translated = await translateAll(content, myLang)
    content = { ...content, ...translated }

    // Traduire les descriptions des listes
    translatedRestaurants = await Promise.all(
      restaurants.map(async r => ({
        ...r,
        description: r.description ? await translateText(r.description, myLang) : '',
      }))
    )
    translatedActivities = await Promise.all(
      activities.map(async a => ({
        ...a,
        description: a.description ? await translateText(a.description, myLang) : '',
      }))
    )
    translatedTransport = await Promise.all(
      transport.map(async tr => ({
        ...tr,
        description: tr.description ? await translateText(tr.description, myLang) : '',
      }))
    )
  }

  const coverImg = book.coverImage || book.property.images?.[0] || null

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Hero */}
      <div className="relative h-64 bg-gradient-to-br from-blue-600 to-blue-800 overflow-hidden">
        {coverImg && (
          <img src={coverImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
          <div className="text-4xl mb-3">🏠</div>
          <h1 className="text-2xl font-bold mb-1">{book.property.name}</h1>
          <p className="text-blue-200 text-sm">{book.property.city}</p>
          {book.property.user?.name && (
            <p className="text-blue-100 text-xs mt-2">{t.host} : {book.property.user.name}</p>
          )}
        </div>

        {/* Sélecteur de langue */}
        <div className="absolute top-3 right-3">
          <LangSwitcher current={lang} bookId={id} />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Message de bienvenue */}
        {content.welcomeMessage && (
          <Card emoji="👋" title={t.welcome}>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{content.welcomeMessage}</p>
          </Card>
        )}

        {/* Check-in / Check-out */}
        {(book.checkInTime || book.checkOutTime) && (
          <Card emoji="🔑" title={t.checkin_section}>
            <div className="grid grid-cols-2 gap-3">
              {book.checkInTime && (
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">{t.checkin}</div>
                  <div className="text-lg font-bold text-green-700">{book.checkInTime}</div>
                </div>
              )}
              {book.checkOutTime && (
                <div className="bg-orange-50 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">{t.checkout}</div>
                  <div className="text-lg font-bold text-orange-700">{book.checkOutTime}</div>
                </div>
              )}
            </div>
            {content.checkInInstructions && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-500 mb-1">{t.checkin_instructions}</p>
                <p className="text-sm text-gray-600 whitespace-pre-line">{content.checkInInstructions}</p>
              </div>
            )}
            {content.checkOutInstructions && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-500 mb-1">{t.checkout_instructions}</p>
                <p className="text-sm text-gray-600 whitespace-pre-line">{content.checkOutInstructions}</p>
              </div>
            )}
          </Card>
        )}

        {/* WiFi */}
        {(book.wifiName || book.wifiPassword) && (
          <Card emoji="📶" title={t.wifi}>
            <div className="space-y-2">
              {book.wifiName && (
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <span className="text-xs text-gray-500">{t.network}</span>
                  <span className="font-bold text-gray-900">{book.wifiName}</span>
                </div>
              )}
              {book.wifiPassword && (
                <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3">
                  <span className="text-xs text-gray-500">{t.password}</span>
                  <span className="font-bold text-blue-700 tracking-wider">{book.wifiPassword}</span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Règles */}
        {content.houseRules && (
          <Card emoji="📋" title={t.rules}>
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{content.houseRules}</p>
          </Card>
        )}

        {/* Restaurants */}
        {translatedRestaurants.length > 0 && (
          <Card emoji="🍽️" title={t.restaurants}>
            <div className="space-y-3">
              {translatedRestaurants.map((r, i) => (
                <div key={i} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm flex-shrink-0">🍴</div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{r.name}</div>
                    {r.description && <div className="text-xs text-gray-500">{r.description}</div>}
                    {r.distance && <div className="text-xs text-orange-600 mt-0.5">📍 {r.distance}</div>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Activités */}
        {translatedActivities.length > 0 && (
          <Card emoji="🎯" title={t.activities}>
            <div className="space-y-3">
              {translatedActivities.map((a, i) => (
                <div key={i} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-sm flex-shrink-0">⭐</div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{a.name}</div>
                    {a.description && <div className="text-xs text-gray-500">{a.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Transport */}
        {translatedTransport.length > 0 && (
          <Card emoji="🚗" title={t.transport}>
            <div className="space-y-3">
              {translatedTransport.map((tr, i) => (
                <div key={i} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm flex-shrink-0">🚌</div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{tr.name}</div>
                    {tr.description && <div className="text-xs text-gray-500">{tr.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Conseils locaux */}
        {content.localTips && (
          <Card emoji="💡" title={t.tips}>
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{content.localTips}</p>
          </Card>
        )}

        {/* Contact */}
        {(book.ownerPhone || book.emergencyPhone) && (
          <Card emoji="📞" title={t.contacts}>
            <div className="space-y-2">
              {book.ownerPhone && (
                <a href={`tel:${book.ownerPhone}`} className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3 hover:bg-blue-100 transition">
                  <div>
                    <div className="text-xs text-gray-500">{t.your_host}</div>
                    <div className="font-bold text-blue-700">{book.ownerPhone}</div>
                  </div>
                  <span className="text-2xl">📱</span>
                </a>
              )}
              {book.emergencyPhone && (
                <a href={`tel:${book.emergencyPhone}`} className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-3 hover:bg-red-100 transition">
                  <div>
                    <div className="text-xs text-gray-500">{t.emergency}</div>
                    <div className="font-bold text-red-700">{book.emergencyPhone}</div>
                  </div>
                  <span className="text-2xl">🚨</span>
                </a>
              )}
            </div>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center py-4 text-xs text-gray-400">
          {t.footer} <a href="https://staydirect.fr" className="text-blue-500 font-medium">StayDirect</a>
        </div>
      </div>
    </div>
  )
}

function Card({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
        <span className="text-xl">{emoji}</span>
        <h2 className="font-bold text-gray-900">{title}</h2>
      </div>
      <div className="px-5 py-4">
        {children}
      </div>
    </div>
  )
}
