import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Alternative à Airbnb pour les propriétaires — StayDirect',
  description: 'Marre des 16% de commission Airbnb ? StayDirect vous permet de recevoir des réservations directes, sans commission. Créez votre site de réservation en 5 minutes.',
  keywords: ['alternative airbnb', 'alternative booking', 'sans commission airbnb', 'site réservation directe', 'quitter airbnb', 'logiciel location sans commission', 'remplacer airbnb'],
  openGraph: {
    title: 'Alternative à Airbnb — Réservations directes sans commission',
    description: 'Arrêtez de payer 16% de commission. Avec StayDirect, vos voyageurs réservent directement sur votre site. Zéro commission, 100% de vos revenus.',
    url: 'https://staydirect.fr/alternative-airbnb',
  },
  alternates: {
    canonical: 'https://staydirect.fr/alternative-airbnb',
  },
}

const COMMISSIONS = [
  { platform: 'Airbnb', commission: '16%', example1000: 160, color: 'bg-rose-50 border-rose-200 text-rose-700', logo: '🏡' },
  { platform: 'Booking.com', commission: '20%', example1000: 200, color: 'bg-blue-50 border-blue-200 text-blue-700', logo: '🔵' },
  { platform: 'Abritel/Vrbo', commission: '15%', example1000: 150, color: 'bg-green-50 border-green-200 text-green-700', logo: '🏘️' },
  { platform: 'StayDirect', commission: '0%', example1000: 0, color: 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold', logo: '✅' },
]

const REASONS = [
  { icon: '💰', title: '0% de commission', desc: 'Airbnb prend jusqu\'à 16% sur chaque réservation. Avec StayDirect, vous gardez 100% du montant payé par le voyageur.' },
  { icon: '📊', title: 'Vos données, pas les leurs', desc: 'Sur Airbnb, les données de vos voyageurs appartiennent à Airbnb. Avec votre propre site, vous gardez le contact direct avec vos clients.' },
  { icon: '🎨', title: 'Votre identité, pas la leur', desc: 'Votre logement mérite votre marque, pas un template générique. Personnalisez votre site avec votre nom, vos photos, vos couleurs.' },
  { icon: '🔒', title: 'Indépendance totale', desc: 'Airbnb peut suspendre votre annonce sans préavis. Avec votre propre site, vous n\'êtes jamais à la merci d\'un algorithme.' },
  { icon: '📅', title: 'Synchronisation iCal', desc: 'Continuez à utiliser Airbnb et Booking EN PARALLÈLE. StayDirect synchronise vos calendriers pour éviter les doubles réservations.' },
  { icon: '⚡', title: 'En ligne en 5 minutes', desc: 'Pas de code, pas de technicien. Créez votre compte, ajoutez votre logement, partagez votre lien. C\'est tout.' },
]

const FAQ = [
  {
    q: 'Puis-je continuer à utiliser Airbnb en même temps que StayDirect ?',
    a: 'Oui, absolument. StayDirect est complémentaire à Airbnb et Booking. Vous continuez à recevoir des réservations via ces plateformes, et vous ajoutez un canal de réservation directe pour éviter les commissions. La synchronisation iCal empêche les doubles réservations.',
  },
  {
    q: 'Combien coûte StayDirect ?',
    a: 'StayDirect commence à 9€/mois pour 1 logement. C\'est à comparer aux 160€+ que vous payez à Airbnb sur une réservation de 1 000€. En une seule réservation directe, vous rentabilisez votre abonnement annuel.',
  },
  {
    q: 'Comment mes voyageurs trouvent-ils mon site ?',
    a: 'Vous partagez votre lien de réservation par WhatsApp, email, Instagram, ou carte de visite. Beaucoup de propriétaires donnent ce lien à leurs anciens voyageurs Airbnb pour les futures réservations. Votre site est aussi indexé sur Google.',
  },
  {
    q: 'Est-ce que les voyageurs font confiance à un site indépendant ?',
    a: 'Oui, surtout vos clients déjà satisfaits. Un voyageur qui a déjà séjourné chez vous est heureux de réserver directement — il paie souvent moins cher et vous gagnez plus. Votre site StayDirect propose le paiement sécurisé via Stripe.',
  },
  {
    q: 'Est-ce que je peux avoir plusieurs logements ?',
    a: 'Oui. StayDirect gère plusieurs logements, avec calendrier centralisé, gestion des réservations et statistiques par logement. Idéal pour les propriétaires multi-logements et les conciergeries.',
  },
]

export default function AlternativeAirbnbPage() {
  const fmt = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">S</div>
            StayDirect
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">Connexion</Link>
            <Link href="/register" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition">
              Essai gratuit →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 text-sm font-semibold px-4 py-2 rounded-full mb-8">
          <span>💸</span> Airbnb prend 16% sur chaque réservation
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
          L'alternative à Airbnb<br />pour les propriétaires qui<br />
          <span className="text-blue-600">veulent garder 100%</span> de leurs revenus
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Créez votre site de réservation directe en 5 minutes. Continuez à utiliser Airbnb et Booking en parallèle. Zéro commission sur vos réservations directes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            Créer mon site gratuit →
          </Link>
          <Link
            href="/pricing"
            className="border border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition"
          >
            Voir les tarifs
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">14 jours gratuits · Sans carte bancaire · Annulation à tout moment</p>
      </section>

      {/* Tableau comparatif commissions */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3">
            Combien vous coûtent vraiment les plateformes ?
          </h2>
          <p className="text-gray-500 text-center mb-10">Commission prélevée sur une réservation de 1 000 €</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {COMMISSIONS.map(c => (
              <div key={c.platform} className={`border rounded-2xl p-5 text-center ${c.commission === '0%' ? 'border-emerald-300 bg-emerald-50 shadow-md shadow-emerald-100' : 'border-gray-200 bg-white'}`}>
                <div className="text-3xl mb-3">{c.logo}</div>
                <div className="font-bold text-gray-900 mb-1">{c.platform}</div>
                <div className={`text-2xl font-black mb-2 ${c.commission === '0%' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {c.commission}
                </div>
                <div className={`text-sm font-bold px-3 py-1 rounded-full inline-block ${c.commission === '0%' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                  {c.commission === '0%' ? '✓ 0 € de commission' : `- ${fmt(c.example1000)}`}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-emerald-600 text-white rounded-2xl p-6 text-center">
            <div className="text-2xl font-bold mb-1">Sur 50 000 € de revenus annuels</div>
            <div className="text-emerald-100 text-sm mb-4">Commissions payées à Airbnb (~16%)</div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <div>
                <div className="text-4xl font-black">{fmt(50000 * 0.16)}</div>
                <div className="text-emerald-200 text-sm">perdus en commissions Airbnb</div>
              </div>
              <div className="text-3xl text-emerald-300">→</div>
              <div>
                <div className="text-4xl font-black text-yellow-300">{fmt(50000 * 0.16 - 69 * 12)}</div>
                <div className="text-emerald-200 text-sm">économisés/an avec StayDirect Pro</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi quitter Airbnb */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3">
          Pourquoi des milliers de propriétaires cherchent une alternative
        </h2>
        <p className="text-gray-500 text-center mb-12">Pas pour quitter Airbnb, mais pour ne plus en dépendre</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REASONS.map(r => (
            <div key={r.title} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition">
              <div className="text-3xl mb-4">{r.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{r.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Votre site de réservation directe en 5 minutes</h2>
          <p className="text-blue-100 mb-12 text-lg">Sans code, sans technicien, sans engagement</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Créez votre compte', desc: 'Inscrivez-vous gratuitement. Aucune carte bancaire requise pour l\'essai.' },
              { step: '2', title: 'Ajoutez votre logement', desc: 'Photos, description, prix, disponibilités. Tout se configure en quelques clics.' },
              { step: '3', title: 'Partagez votre lien', desc: 'Envoyez votre lien par WhatsApp, email ou Instagram. Recevez vos premières réservations directes.' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-bold text-xl mb-2">{s.title}</h3>
                <p className="text-blue-100 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <Link
            href="/register"
            className="inline-block mt-12 bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition shadow-lg"
          >
            Commencer gratuitement →
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10">Questions fréquentes</h2>
        <div className="space-y-4">
          {FAQ.map((item, i) => (
            <details key={i} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-900 flex items-center justify-between gap-3 list-none hover:bg-gray-50 transition">
                {item.q}
                <span className="text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0">▼</span>
              </summary>
              <div className="px-6 pb-4 text-gray-500 text-sm leading-relaxed">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="text-5xl mb-6">🚀</div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Arrêtez de partager vos revenus</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Rejoignez les propriétaires qui ont repris le contrôle de leurs réservations. Votre site de réservation directe est prêt en 5 minutes.
          </p>
          <Link
            href="/register"
            className="inline-block bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            Créer mon site gratuitement →
          </Link>
          <p className="text-sm text-gray-400 mt-4">14 jours gratuits · Pas de carte bancaire · Sans engagement</p>
        </div>
      </section>

      {/* Footer simple */}
      <footer className="border-t border-gray-100 py-8 text-center text-gray-400 text-sm">
        <Link href="/" className="font-semibold text-gray-600">StayDirect</Link>
        {' · '}
        <Link href="/pricing" className="hover:text-gray-600">Tarifs</Link>
        {' · '}
        <Link href="/concierge" className="hover:text-gray-600">Conciergeries</Link>
        {' · '}
        <Link href="/hotel" className="hover:text-gray-600">Hôtels</Link>
        {' · '}
        <Link href="/login" className="hover:text-gray-600">Connexion</Link>
      </footer>
    </main>
  )
}
