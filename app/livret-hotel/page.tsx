import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Livret d\'accueil digital pour hôtels — 9€/mois | StayDirect',
  description: 'Offrez à vos clients un livret d\'accueil numérique accessible par QR code : horaires, services, parking, obligations légales. Simple, en français, sans application à télécharger.',
  alternates: { canonical: 'https://staydirect.fr/livret-hotel' },
}

const features = [
  { icon: '🕐', title: 'Check-in / Check-out', desc: 'Horaires d\'arrivée et de départ, procédure de remise des clés, late check-out.' },
  { icon: '🍳', title: 'Petit-déjeuner', desc: 'Horaires, lieu, formules disponibles, options végétariennes ou allergènes.' },
  { icon: '🅿️', title: 'Parking', desc: 'Accès, tarifs, places réservées, hauteur maximale, badges d\'accès.' },
  { icon: '📶', title: 'Wi-Fi & Services', desc: 'Codes Wi-Fi, room service, spa, restaurant, horaires de chaque service.' },
  { icon: '🔔', title: 'Conciergerie', desc: 'Contact direct, numéros d\'urgence, réservation de taxis ou activités.' },
  { icon: '📋', title: 'Règlement intérieur', desc: 'Bruit, animaux, espaces fumeurs, piscine — tout ce que vos clients doivent savoir.' },
]

export default function LivretHotelPage() {
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
            <Link href="/pricing" className="text-gray-500 hover:text-gray-900 text-sm font-medium">Tarifs</Link>
            <Link href="/contact" className="text-gray-500 hover:text-gray-900 text-sm font-medium">Contact</Link>
            <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition text-sm">Essai gratuit</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-blue-100">
          🏨 Spécialement conçu pour les hôtels & résidences
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Le livret d'accueil digital<br />pour votre hôtel
        </h1>
        <p className="text-xl text-gray-500 mb-6">
          Vos clients scannent un QR code et accèdent à toutes les informations de votre établissement — sans application à télécharger.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition text-lg">
            Essayer gratuitement 14 jours →
          </Link>
          <Link href="/contact" className="border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:border-blue-300 hover:text-blue-600 transition text-lg">
            Demander une démo
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">9€/mois · Sans engagement · Sans carte bancaire</p>
      </div>

      {/* Ce qui est inclus */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Ce que contient votre livret</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mention légale */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4">
          <div className="text-2xl shrink-0">⚖️</div>
          <div>
            <h3 className="font-bold text-amber-900 mb-1">Affichages obligatoires ERP</h3>
            <p className="text-amber-800 text-sm leading-relaxed">
              Le livret digital complète vos affichages obligatoires réglementaires — il ne les remplace pas. Les affichages physiques imposés par la loi (tarifs, sécurité incendie, plan d'évacuation, licence débit de boissons) doivent rester présents dans votre établissement.
            </p>
          </div>
        </div>
      </div>

      {/* Pourquoi QR */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Pourquoi un livret QR pour votre hôtel ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '📱', title: 'Sans application', desc: 'Vos clients scannent et accèdent immédiatement. Aucune installation requise.' },
            { icon: '✏️', title: 'Modifiable en temps réel', desc: 'Changez les horaires ou les tarifs parking en 30 secondes, sans réimprimer.' },
            { icon: '🌍', title: 'Multilingue', desc: 'Affichez votre livret en français, anglais ou espagnol selon la langue du client.' },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tarif */}
      <div className="max-w-md mx-auto px-6 pb-16">
        <div className="bg-white rounded-2xl border-2 border-blue-500 shadow-lg shadow-blue-100 p-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold mb-4">
            🏨 Hôtels & Résidences
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Livret d'accueil digital</h2>
          <div className="my-6">
            <span className="text-5xl font-black text-gray-900">9€</span>
            <span className="text-gray-400">/mois</span>
          </div>
          <ul className="text-left space-y-3 mb-8">
            {[
              'Check-in / Check-out',
              'Horaires petit-déjeuner',
              'Parking & tarifs',
              'Services & conciergerie',
              'Règlement intérieur',
              'QR code prêt à imprimer',
              'Multilingue FR / EN / ES',
              'Modifications illimitées',
              'Sans application à télécharger',
            ].map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                <span className="text-green-500 font-bold">✓</span>
                {f}
              </li>
            ))}
          </ul>
          <Link href="/register" className="block w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition text-center">
            Commencer — 14j gratuits →
          </Link>
          <p className="text-xs text-gray-400 mt-3">Sans engagement · Sans carte bancaire</p>
        </div>
      </div>

      {/* CTA final */}
      <div className="bg-blue-600 py-16 px-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Prêt à moderniser votre accueil ?</h2>
        <p className="text-blue-100 text-lg mb-8">Créez votre livret en 10 minutes. Vos clients l'ont dans les mains le jour même.</p>
        <Link href="/register" className="bg-white text-blue-600 font-bold px-10 py-4 rounded-xl hover:bg-blue-50 transition text-lg inline-block">
          Essayer gratuitement →
        </Link>
      </div>
    </div>
  )
}
