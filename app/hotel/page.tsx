import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'StayDirect pour les hôtels indépendants — PMS + Channel Manager + Réservations directes',
  description: 'Logiciel PMS pour hôtels indépendants. Gestion des chambres, réservations directes sans commission, channel manager Airbnb/Booking, analytics. Dès 59€/mois.',
}

export default function HotelPage() {
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
            <Link href="/register" className="bg-amber-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-amber-600 transition shadow-md shadow-amber-200 text-sm">
              Essai gratuit →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold mb-8 border border-amber-100">
          🏨 StayDirect pour les Hôtels Indépendants
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-5 leading-tight">
          PMS + Réservations directes<br />
          <span className="text-amber-600">pour hôtels indépendants.</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
          Gérez vos chambres, recevez des réservations sans commission, et synchronisez vos disponibilités avec Airbnb, Booking.com et Expedia — depuis une seule plateforme.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
          <Link href="/register" className="bg-amber-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-amber-600 transition shadow-lg shadow-amber-100 w-full sm:w-auto">
            Essai gratuit 14 jours →
          </Link>
          <Link href="/contact" className="text-gray-600 hover:text-gray-900 font-medium">
            Demander une démo →
          </Link>
        </div>
        <p className="text-sm text-gray-400">Forfait fixe · Aucune commission · Channel manager inclus</p>
      </section>

      {/* Tarifs hôtel */}
      <section className="bg-amber-50 border-y border-amber-100 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-center text-xl font-bold text-gray-900 mb-8">Tarifs — Forfait mensuel fixe, channel manager inclus</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { range: '1 – 10 chambres', price: '59€', color: 'bg-white border-amber-200' },
              { range: '11 – 20 chambres', price: '89€', color: 'bg-white border-amber-300' },
              { range: '21 – 50 chambres', price: '129€', color: 'bg-amber-500 border-amber-500 text-white', highlight: true },
              { range: '50+ chambres', price: '199€', color: 'bg-white border-amber-300' },
            ].map(t => (
              <div key={t.range} className={`rounded-2xl border-2 p-5 text-center ${t.color}`}>
                <div className={`text-3xl font-black mb-1 ${(t as any).highlight ? 'text-white' : 'text-amber-700'}`}>{t.price}</div>
                <div className={`text-xs font-semibold ${(t as any).highlight ? 'text-amber-100' : 'text-gray-500'}`}>/mois</div>
                <div className={`text-xs mt-2 ${(t as any).highlight ? 'text-amber-100' : 'text-gray-600'}`}>{t.range}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-500 mt-4">Channel manager inclus dans tous les forfaits hôtel · Aucune commission sur les réservations directes</p>
        </div>
      </section>

      {/* Ce qui est disponible vs bientôt */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Fonctionnalités disponibles</h2>
            <p className="text-gray-500">Transparence totale — voici exactement ce que vous obtenez aujourd'hui.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Disponible */}
            <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
              <div className="bg-green-50 px-6 py-4 border-b border-green-100">
                <h3 className="font-bold text-green-800">✅ Disponible maintenant</h3>
              </div>
              <div className="p-6 space-y-3">
                {[
                  'Site de réservation directe par logement/chambre',
                  'Tableau de bord PMS (réservations, revenus, calendrier)',
                  'Gestion du stock par type de chambre',
                  'Paiements en ligne (Stripe, SumUp)',
                  'Synchronisation calendriers via iCal',
                  'Livret d\'accueil QR numérique',
                  'Cautions bancaires en ligne',
                  'Analytics & taux d\'occupation',
                  'Emails de confirmation automatiques',
                  'Domaine personnalisé',
                ].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-500 font-bold flex-shrink-0">✓</span>{f}
                  </div>
                ))}
              </div>
            </div>

            {/* Bientôt */}
            <div className="bg-white rounded-2xl border border-amber-100 overflow-hidden">
              <div className="bg-amber-50 px-6 py-4 border-b border-amber-100">
                <h3 className="font-bold text-amber-800">⏳ En cours d'intégration</h3>
              </div>
              <div className="p-6 space-y-3">
                {[
                  'Channel manager temps réel (Airbnb, Booking, Expedia)',
                  'Synchronisation des tarifs vers les OTAs',
                  'Réservations en temps réel depuis Airbnb/Booking',
                  'Restrictions (min nights, stop sell)',
                  'Yield management automatique',
                  'Rapports comptables avancés',
                  'Multi-utilisateurs (réception, ménage)',
                ].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="text-amber-400 font-bold flex-shrink-0">◎</span>{f}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
            <p className="text-blue-800 font-semibold mb-1">Vous êtes hôtel et vous voulez tester dès maintenant ?</p>
            <p className="text-blue-600 text-sm mb-4">Inscrivez-vous en 14 jours gratuits. Utilisez le PMS, les réservations directes, les livrets et cautions. Vous serez notifié en priorité lors du lancement du channel manager.</p>
            <Link href="/register" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition inline-block">
              Commencer l'essai gratuit →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-amber-500 py-16">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-2xl font-bold text-white mb-3">Prêt à recevoir des réservations directes ?</h2>
          <p className="text-amber-100 mb-6">Forfait fixe · Aucune commission · Channel manager inclus</p>
          <Link href="/register" className="bg-white text-amber-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-amber-50 transition inline-block">
            Créer mon compte →
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <Link href="/" className="text-white font-bold">StayDirect</Link> ·
        <Link href="/pricing" className="hover:text-white ml-2">Tarifs</Link> ·
        <Link href="/contact" className="hover:text-white ml-2">Contact</Link> ·
        <Link href="/concierge" className="hover:text-white ml-2">Pour les conciergeries</Link>
      </footer>
    </main>
  )
}
