import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Alternative à Airbnb pour propriétaires — 0% commission | StayDirect",
  description: "Arrêtez de payer 15-20% de commission à Airbnb. StayDirect vous donne votre propre site de réservation directe dès 9€/mois. Livret QR et cautions inclus.",
  alternates: { canonical: 'https://staydirect.fr/alternative-airbnb' },
}

export default function AlternativeAirbnbPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-xl text-gray-900">StayDirect</span>
          </Link>
          <div className="flex gap-3 items-center">
            <Link href="/login" className="text-gray-500 text-sm hover:text-gray-900">Connexion</Link>
            <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition">
              Essai gratuit 14j →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-red-100">
          🚫 Airbnb prélève jusqu&apos;à 20% sur chaque réservation
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5 leading-tight">
          La meilleure alternative à Airbnb<br />
          <span className="text-blue-600">pour propriétaires indépendants</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-8">
          Votre propre site de réservation directe, sans commission, avec livret d&apos;accueil et cautions bancaires inclus. Dès 9€/mois.
        </p>
        <Link href="/register" className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-100">
          Créer mon site gratuitement →
        </Link>
        <p className="text-sm text-gray-400 mt-3">14 jours gratuits · Sans carte bancaire</p>
      </section>

      {/* Comparaison */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">StayDirect vs Airbnb — ce que vous perdez chaque mois</h2>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-500">Critère</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-blue-600">StayDirect</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-400">Airbnb</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                ['Commission hôte', '0%', '3%'],
                ['Commission voyageur', '0%', '13%'],
                ['Total prélevé', '0%', '~16%'],
                ['Site personnalisé', '✅ Inclus', '❌'],
                ['Livret d\'accueil QR', '✅ Inclus', '❌'],
                ['Cautions bancaires', '✅ Inclus', '❌'],
                ['Paiement direct sur votre compte', '✅', '❌ (délai 24h)'],
                ['Prix fixe mensuel', '9€/mois', 'Commission variable'],
              ].map(([label, sd, airbnb]) => (
                <tr key={label}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">{label}</td>
                  <td className="px-6 py-4 text-center text-sm font-bold text-blue-600 bg-blue-50/20">{sd}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">{airbnb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Calcul économies */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-blue-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Combien vous perdez avec Airbnb ?</h2>
          <p className="text-blue-100 mb-6">Pour 2 000€ de réservations par mois :</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-3xl font-black mb-1">320€</div>
              <div className="text-blue-200 text-sm">Commission Airbnb/mois (~16%)</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-3xl font-black mb-1">3 840€</div>
              <div className="text-blue-200 text-sm">Perdu par an sur Airbnb</div>
            </div>
            <div className="bg-green-400 rounded-xl p-4">
              <div className="text-3xl font-black text-white mb-1">9€</div>
              <div className="text-green-100 text-sm">Abonnement StayDirect/mois</div>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Passez à StayDirect en 3 étapes</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Créez votre compte', desc: 'Inscrivez-vous gratuitement, sans carte bancaire. 14 jours d\'essai offerts.' },
            { step: '2', title: 'Configurez votre site', desc: 'Ajoutez vos logements, photos, tarifs. Votre site est en ligne en 5 minutes.' },
            { step: '3', title: 'Recevez des réservations', desc: 'Partagez votre lien. Vos voyageurs réservent et paient directement sur votre site.' },
          ].map(item => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-black mx-auto mb-4">{item.step}</div>
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-gray-50 border-t border-gray-100 py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Prêt à quitter Airbnb ?</h2>
          <p className="text-gray-500 mb-6">Rejoignez les propriétaires qui gardent 100% de leurs revenus.</p>
          <Link href="/register" className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-100">
            Commencer gratuitement →
          </Link>
          <p className="text-sm text-gray-400 mt-3">14 jours gratuits · Sans carte bancaire · Annulable à tout moment</p>
        </div>
      </section>
    </main>
  )
}
