import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'StayDirect pour les conciergeries — Gérez plusieurs logements depuis une seule plateforme',
  description: 'Logiciel PMS pour conciergeries et gestionnaires locatifs. Calendrier centralisé, réservations directes, channel manager, analytics. Dès 9€/logement.',
}

export default function ConciergePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="font-bold text-xl text-gray-900">StayDirect</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-gray-500 hover:text-gray-900 text-sm">Connexion</Link>
            <Link href="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-md shadow-blue-200 text-sm">
              Essai gratuit →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-8 border border-emerald-100">
          🏢 StayDirect pour les Conciergeries
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-5 leading-tight">
          Gérez plusieurs dizaines de logements<br />
          <span className="text-emerald-600">depuis une seule plateforme.</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
          PMS multi-propriétés, calendrier centralisé, réservations directes, analytics et channel manager — tout ce qu'il vous faut pour scaler votre conciergerie.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
          <Link href="/register" className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 w-full sm:w-auto">
            Demander un accès — 14j gratuits →
          </Link>
          <Link href="/contact" className="text-gray-600 hover:text-gray-900 font-medium">
            Parler à un conseiller →
          </Link>
        </div>
        <p className="text-sm text-gray-400">Sans engagement · Tarification par logement</p>
      </section>

      {/* Chiffres clés */}
      <section className="bg-emerald-600 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            {[
              { value: '0%', label: 'commission sur vos réservations' },
              { value: '9€', label: 'par logement/mois dès 5 logements : 5€' },
              { value: '∞', label: 'logements gérables' },
              { value: '14j', label: "d'essai gratuit" },
            ].map(s => (
              <div key={s.label}>
                <div className="text-4xl font-black mb-1">{s.value}</div>
                <div className="text-emerald-100 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problème conciergerie */}
      <section className="py-16 bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Le quotidien d'une conciergerie sans bon outil</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: '😩', title: 'Calendriers dispersés', desc: 'Airbnb, Booking, Excel, WhatsApp... Vous perdez 2h/jour à synchroniser manuellement.' },
              { icon: '💸', title: 'Commissions OTA sur tout', desc: '15 à 25% prélevés à chaque réservation Airbnb ou Booking. Sur 20 logements, ça chiffre.' },
              { icon: '📊', title: 'Pas de vue d\'ensemble', desc: 'Impossible de savoir en temps réel quel logement est libre, quel voyageur arrive, quel revenu est attendu.' },
              { icon: '🔁', title: 'Tâches répétitives', desc: 'Check-in instructions, WiFi, règles de la maison... Vous les écrivez à la main à chaque réservation.' },
            ].map(p => (
              <div key={p.title} className="bg-white rounded-2xl border border-gray-100 p-6 flex gap-4">
                <span className="text-3xl flex-shrink-0">{p.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{p.title}</h3>
                  <p className="text-gray-500 text-sm">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Tout ce que StayDirect fait pour vous</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '📊', title: 'PMS multi-logements', desc: 'Tableau de bord unique pour tous vos logements. Arrivées du jour, départs, revenus, taux d\'occupation — en un coup d\'œil.' },
              { icon: '📅', title: 'Calendrier centralisé', desc: 'Visualisez toutes vos disponibilités sur un seul calendrier. Bloquez des dates, synchronisez vos iCal Airbnb et Booking.' },
              { icon: '🌐', title: 'Sites de réservation directe', desc: 'Un site pro par logement (ou multi-logements). Vos clients réservent sans commission. Domaine personnalisé inclus.' },
              { icon: '💳', title: 'Paiements intégrés', desc: 'Stripe Connect, SumUp, PayPal — vos voyageurs paient en ligne, l\'argent arrive directement sur votre compte.' },
              { icon: '🔒', title: 'Cautions bancaires', desc: 'Protégez les logements de vos clients propriétaires. Lien de caution envoyé au voyageur avant le séjour.' },
              { icon: '📖', title: 'Livrets d\'accueil QR', desc: 'Un livret numérique par logement. WiFi, check-in, règles, activités — vos voyageurs scannent et trouvent tout.' },
              { icon: '📈', title: 'Analytics & rapports', desc: 'Revenus par logement, taux d\'occupation, économies vs Airbnb. Partagez les rapports avec vos propriétaires.' },
              { icon: '🔗', title: 'Sync iCal', desc: 'Importez vos calendriers Airbnb et Booking via iCal. Les dates se synchronisent pour éviter les doubles réservations.' },
              { icon: '📡', title: 'Channel manager', desc: 'Synchronisation temps réel des disponibilités, tarifs et réservations avec Airbnb, Booking, Expedia et Vrbo. Inclus pour tous les comptes.' },
            ].map(f => (
              <div key={f.title} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tarifs conciergerie */}
      <section className="bg-gray-50 py-16 border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Tarification simple par logement</h2>
          <p className="text-gray-500 mb-8">Payez uniquement pour ce que vous gérez. Aucune commission cachée.</p>
          <div className="bg-white rounded-2xl border-2 border-emerald-400 p-8">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-emerald-50 rounded-xl">
                <div className="text-3xl font-black text-emerald-700">9€</div>
                <div className="text-sm text-gray-500">/ logement · 1 à 4 logements</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-3xl font-black text-blue-700">5€</div>
                <div className="text-sm text-gray-500">/ logement · à partir du 5ème</div>
              </div>
            </div>
            <div className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 mb-6">
              <strong>Exemple :</strong> 10 logements = 4 × 9€ + 6 × 5€ = <strong>66€/mois</strong> — pour gérer 10 logements, sites, calendriers, cautions et livrets.
            </div>
            <Link href="/register" className="block text-center bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition">
              Commencer — 14 jours gratuits →
            </Link>
            <p className="text-sm text-gray-400 mt-3">Sans engagement · Annulable à tout moment · Support inclus</p>
          </div>
          <p className="text-sm text-gray-500 mt-4">Vous gérez plus de 30 logements ? <Link href="/contact" className="text-blue-600 hover:underline font-medium">Contactez-nous pour un tarif sur mesure →</Link></p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-600 py-16">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-2xl font-bold text-white mb-3">Prêt à simplifier votre conciergerie ?</h2>
          <p className="text-emerald-100 mb-6">14 jours d'essai gratuit. Aucune carte bancaire requise.</p>
          <Link href="/register" className="bg-white text-emerald-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-50 transition inline-block">
            Créer mon compte →
          </Link>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <Link href="/" className="text-white font-bold">StayDirect</Link> ·
        <Link href="/pricing" className="hover:text-white ml-2">Tarifs</Link> ·
        <Link href="/contact" className="hover:text-white ml-2">Contact</Link> ·
        <Link href="/hotel" className="hover:text-white ml-2">Pour les hôtels</Link>
      </footer>
    </main>
  )
}
