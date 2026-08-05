import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Livret d\'accueil digital QR code — Meublé & Hôtel | StayDirect',
  description: 'Créez votre livret d\'accueil numérique en 10 minutes. Vos voyageurs scannent un QR code et accèdent à toutes les infos du logement. Sans application, modifiable à tout moment. 3€/mois.',
  alternates: { canonical: 'https://staydirect.fr/livret-accueil' },
}

const meublePlusFields = [
  { icon: '🏠', label: 'Règles de la maison' },
  { icon: '📍', label: 'Adresse & accès' },
  { icon: '🔑', label: 'Code / boîte à clé' },
  { icon: '📶', label: 'Wi-Fi' },
  { icon: '🗑️', label: 'Tri des déchets' },
  { icon: '🛏️', label: 'Horaires check-in / check-out' },
  { icon: '📞', label: 'Contact du propriétaire' },
  { icon: '📍', label: 'Bonnes adresses & activités' },
]

const hotelPlusFields = [
  { icon: '🕐', label: 'Check-in / Check-out' },
  { icon: '🍳', label: 'Horaires petit-déjeuner' },
  { icon: '🅿️', label: 'Parking & tarifs' },
  { icon: '📶', label: 'Wi-Fi & services' },
  { icon: '🔔', label: 'Conciergerie & room service' },
  { icon: '🏊', label: 'Piscine / Spa / Restaurant' },
  { icon: '📋', label: 'Règlement intérieur' },
  { icon: '🚨', label: 'Numéros d\'urgence' },
]

export default function LivretAccueilPage() {
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
          📱 Fonctionne pour les meublés ET les hôtels
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Le livret d'accueil digital<br />prêt en 10 minutes
        </h1>
        <p className="text-xl text-gray-500 mb-6">
          Vos voyageurs scannent un QR code et accèdent à toutes les informations du logement. Sans application à télécharger. Modifiable à tout moment.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition text-lg">
            Essayer gratuitement 14 jours →
          </Link>
          <Link href="/contact" className="border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:border-blue-300 hover:text-blue-600 transition text-lg">
            Demander une démo
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">3€/mois · Sans engagement · Sans carte bancaire</p>
      </div>

      {/* Deux types */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Un livret adapté à votre établissement</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Meublé tourisme */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 shadow-sm">
            <div className="text-4xl mb-4">🏠</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Meublé tourisme</h3>
            <p className="text-gray-500 text-sm mb-6">Appartement, villa, gîte, chalet — tout logement en location courte durée.</p>
            <ul className="space-y-3">
              {meublePlusFields.map((f) => (
                <li key={f.label} className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-lg">{f.icon}</span>
                  {f.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Hôtel */}
          <div className="bg-white rounded-2xl border-2 border-blue-200 p-8 shadow-sm">
            <div className="text-4xl mb-4">🏨</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Hôtel & Résidence</h3>
            <p className="text-gray-500 text-sm mb-6">Hôtel, résidence de tourisme, chambre d'hôtes, appart-hôtel.</p>
            <ul className="space-y-3">
              {hotelPlusFields.map((f) => (
                <li key={f.label} className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-lg">{f.icon}</span>
                  {f.label}
                </li>
              ))}
            </ul>
            <div className="mt-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              ⚖️ Complète vos affichages obligatoires ERP — ne les remplace pas.
            </div>
          </div>
        </div>
      </div>

      {/* Pourquoi */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Pourquoi un livret digital ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '✏️', title: 'Modifiable en temps réel', desc: 'Changez le code Wi-Fi ou les horaires en 30 secondes. Vos voyageurs voient toujours la version à jour.' },
            { icon: '📱', title: 'Sans application', desc: 'Un simple scan suffit. Aucune installation requise pour votre voyageur.' },
            { icon: '🌍', title: 'Multilingue', desc: 'Affichez votre livret en français, anglais ou espagnol automatiquement.' },
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
      <div className="max-w-sm mx-auto px-6 pb-16">
        <div className="bg-white rounded-2xl border-2 border-blue-500 shadow-lg shadow-blue-100 p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Livret d'accueil digital</h2>
          <p className="text-gray-400 text-sm mb-4">Meublé tourisme & Hôtel</p>
          <div className="my-6">
            <span className="text-5xl font-black text-gray-900">3€</span>
            <span className="text-gray-400">/mois</span>
            <div className="text-sm text-gray-400 mt-1">ou 30€/an</div>
          </div>
          <ul className="text-left space-y-3 mb-8">
            {[
              'Livret personnalisé selon votre type',
              'QR code prêt à imprimer',
              'Modifications illimitées',
              'Multilingue FR / EN / ES',
              'Sans application à télécharger',
              '14 jours d\'essai gratuit',
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
        <h2 className="text-3xl font-bold text-white mb-4">Prêt à créer votre livret ?</h2>
        <p className="text-blue-100 text-lg mb-8">10 minutes de configuration, vos voyageurs l'ont dans les mains le jour même.</p>
        <Link href="/register" className="bg-white text-blue-600 font-bold px-10 py-4 rounded-xl hover:bg-blue-50 transition text-lg inline-block">
          Essayer gratuitement →
        </Link>
      </div>
    </div>
  )
}
