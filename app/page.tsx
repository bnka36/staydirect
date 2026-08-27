import Link from 'next/link'
import { TESTIMONIALS } from '@/lib/testimonials'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://staydirect.fr/#org',
      name: 'StayDirect',
      url: 'https://staydirect.fr',
      logo: 'https://staydirect.fr/icon-192.svg',
      contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', url: 'https://staydirect.fr/contact' },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'StayDirect',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '9', priceCurrency: 'EUR', description: 'Abonnement mensuel à partir de 9€/mois' },
      description: 'Plateforme de réservation directe pour propriétaires de locations courte durée — 0% commission, livret QR, cautions bancaires.',
      url: 'https://staydirect.fr',
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: "Les 3 services sont-ils vraiment inclus dans l'abonnement ?", acceptedAnswer: { '@type': 'Answer', text: "Oui. Le PMS, le livret d'accueil QR et les cautions bancaires sont inclus dans tous les plans dès 9€/mois." } },
        { '@type': 'Question', name: 'Y a-t-il des commissions sur les réservations ?', acceptedAnswer: { '@type': 'Answer', text: 'Non. StayDirect ne prélève aucune commission. Vous payez uniquement l\'abonnement mensuel fixe.' } },
        { '@type': 'Question', name: 'Puis-je annuler à tout moment ?', acceptedAnswer: { '@type': 'Answer', text: 'Oui, sans engagement ni frais.' } },
        { '@type': 'Question', name: "Et si je n'ai pas de compétences techniques ?", acceptedAnswer: { '@type': 'Answer', text: "Aucune compétence requise. Tout est pensé pour être autonome en 5 minutes. Le support est inclus dans tous les plans." } },
      ],
    },
  ],
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="font-bold text-xl text-gray-900">StayDirect</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#fonctionnalites" className="text-gray-500 hover:text-gray-900 text-sm font-medium">Fonctionnalités</a>
            <Link href="/concierge" className="text-gray-500 hover:text-gray-900 text-sm font-medium">Conciergeries</Link>
            <Link href="/hotel" className="text-gray-500 hover:text-gray-900 text-sm font-medium">Hôtels</Link>
            <a href="#tarifs" className="text-gray-500 hover:text-gray-900 text-sm font-medium">Tarifs</a>
            <a href="#faq" className="text-gray-500 hover:text-gray-900 text-sm font-medium">FAQ</a>
            <Link href="/contact" className="text-gray-500 hover:text-gray-900 text-sm font-medium">Contact</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-gray-500 hover:text-gray-900 text-sm">
              Connexion
            </Link>
            <Link href="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-md shadow-blue-200 text-sm">
              Essai gratuit →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-8 border border-blue-100">
          🚀 Nouvelle plateforme · 0% commission · Essai 14 jours gratuit
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-5 leading-tight tracking-tight">
          Gérez vos locations saisonnières<br />
          <span className="text-blue-600">depuis un seul endroit.</span>
        </h1>
        <p className="text-base sm:text-xl text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed px-2">
          PMS, réservations directes, site web et synchronisation de vos calendriers Airbnb et Booking.com — réunis dans une seule plateforme.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link href="/register" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-100 w-full sm:w-auto">
            Créer mon compte — 14j gratuits →
          </Link>
          <a href="#fonctionnement" className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2">
            Voir comment ça marche ↓
          </a>
        </div>
        <p className="text-sm text-gray-400">Sans carte bancaire · 14 jours gratuits · Annulable à tout moment</p>
      </section>


      {/* Problème */}
      <section id="fonctionnement" className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Aujourd'hui, vous jongulez entre tout ça :</h2>
            <p className="text-gray-500">Et vous perdez du temps — et de l'argent — chaque semaine.</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-3 mb-8">
            {['Airbnb', 'Booking.com', 'Excel', 'Emails', 'Calendriers', 'Papier', 'Virements', 'Site internet'].map((item, i) => (
              <div key={item} className="flex items-center gap-2">
                <span className="bg-white border border-red-100 text-red-500 font-semibold px-4 py-2 rounded-full text-sm shadow-sm">{item}</span>
                {i < 7 && <span className="text-gray-300 font-bold">+</span>}
              </div>
            ))}
          </div>
          <div className="bg-blue-600 rounded-2xl p-8 text-center text-white shadow-xl shadow-blue-100">
            <div className="text-4xl mb-3">✦</div>
            <h3 className="text-xl font-bold mb-2">StayDirect centralise tout.</h3>
            <p className="text-blue-100">Un seul login. Un seul tableau de bord. Toutes vos réservations, tous vos logements, tous vos revenus.</p>
          </div>
        </div>
      </section>

      {/* Preuve sociale */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          {/* Stats factuelles */}
          <div className="flex flex-wrap justify-center gap-10 mb-14 text-center">
            {[
              { value: '0%', label: 'commission prélevée' },
              { value: '14j', label: "d'essai gratuit sans CB" },
              { value: '3', label: 'services inclus (PMS + Livret + Cautions)' },
              { value: '5 min', label: 'pour être opérationnel' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-4xl font-black text-blue-600">{s.value}</div>
                <div className="text-sm text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Témoignages — alimentés depuis lib/testimonials.ts */}
          {TESTIMONIALS.length > 0 && (
            <div className={`grid grid-cols-1 gap-6 ${TESTIMONIALS.length === 1 ? 'max-w-md mx-auto' : TESTIMONIALS.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : 'md:grid-cols-3'}`}>
              {TESTIMONIALS.map(t => (
                <div key={t.name} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <span key={i} className="text-yellow-400 text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${t.color}`}>{t.avatar}</div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                      <div className="text-xs text-gray-400">{t.location}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Démo visuelle dashboard */}
      <section className="py-20 bg-gradient-to-b from-blue-600 to-blue-700">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
            👀 Aperçu du dashboard
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Tout gérer en un coup d'œil</h2>
          <p className="text-blue-100 mb-10 max-w-xl mx-auto">Réservations, calendrier, revenus, livret et cautions — dans une interface claire, sans formation.</p>
          {/* Video demo */}
          <div className="rounded-2xl overflow-hidden shadow-2xl max-w-4xl mx-auto border-2 border-white/20">
            <video
              src="/demo.mp4"
              autoPlay
              muted
              loop
              playsInline
              controls
              poster="/demo-poster.jpg"
              className="w-full block"
              style={{ maxHeight: '480px', background: '#0f172a' }}
            />
          </div>
          <p className="text-blue-200 text-sm mt-6">Ce que vous voyez dès votre connexion. Rien de plus, rien de moins.</p>
          <div className="mt-8">
            <a href="/register" className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition inline-block shadow-lg">
              Essayer gratuitement 14 jours →
            </a>
          </div>
        </div>
      </section>
      {/* 3 SERVICES — Section phare */}
      <section id="services" className="py-20 bg-gradient-to-b from-gray-50 to-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-green-100">
              ✅ 3 services inclus · 1 seul abonnement
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Réunis dans une seule plateforme, avec un seul login.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1 — PMS */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white">
                <div className="text-5xl mb-4">🏠</div>
                <div className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2">Service 1</div>
                <h3 className="text-2xl font-bold mb-2">Réservations directes</h3>
                <p className="text-blue-100 text-sm leading-relaxed">Site de réservation pro, calendriers synchronisés, paiements Stripe directs.</p>
              </div>
              <div className="p-6 space-y-3">
                {['Site de réservation public', 'Synchronisation calendriers via iCal', 'Paiements directs sur votre compte', 'Tableau de bord PMS', 'Emails de confirmation auto'].map(f => (
                  <div key={f} className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="text-green-500 font-bold flex-shrink-0">✓</span>
                    {f}
                  </div>
                ))}
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-2xl font-black text-blue-700">Dès 9€<span className="text-sm font-medium text-gray-400">/mois</span></div>
                  <div className="text-xs text-gray-400 mt-1">0% de commission sur vos réservations</div>
                </div>
              </div>
            </div>

            {/* Service 2 — Livret */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-8 text-white">
                <div className="text-5xl mb-4">📖</div>
                <div className="text-xs font-bold text-emerald-200 uppercase tracking-wider mb-2">Service 2</div>
                <h3 className="text-2xl font-bold mb-2">Livret d'accueil QR</h3>
                <p className="text-emerald-100 text-sm leading-relaxed">Un livret numérique personnalisé accessible en 1 scan. Plus besoin de papier.</p>
              </div>
              <div className="p-6 space-y-3">
                {['QR code à imprimer ou partager', 'Infos WiFi, check-in, règles', 'Restaurants & activités locales', 'Page mobile belle et rapide', 'Compteur de vues'].map(f => (
                  <div key={f} className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="text-green-500 font-bold flex-shrink-0">✓</span>
                    {f}
                  </div>
                ))}
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-2xl font-black text-emerald-600">2.99€<span className="text-sm font-medium text-gray-400">/mois</span></div>
                  <div className="text-xs text-gray-400 mt-1">Inclus dans tous les abonnements StayDirect</div>
                </div>
              </div>
            </div>

            {/* Service 3 — Cautions */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
              <div className="bg-gradient-to-br from-violet-600 to-purple-700 p-8 text-white">
                <div className="text-5xl mb-4">🔒</div>
                <div className="text-xs font-bold text-violet-300 uppercase tracking-wider mb-2">Service 3</div>
                <h3 className="text-2xl font-bold mb-2">Cautions bancaires</h3>
                <p className="text-violet-100 text-sm leading-relaxed">Dépôt de garantie en ligne. Le voyageur pré-autorise, vous capturez si besoin.</p>
              </div>
              <div className="p-6 space-y-3">
                {['Lien envoyé au voyageur par email', 'Carte bloquée, pas débitée', 'Libération en 1 clic après séjour', 'Capture partielle en cas de dommages', 'Frais facturés au voyageur'].map(f => (
                  <div key={f} className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="text-green-500 font-bold flex-shrink-0">✓</span>
                    {f}
                  </div>
                ))}
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-2xl font-black text-violet-700">0.25€ + 0.99%<span className="text-sm font-medium text-gray-400"> abonné</span></div>
                  <div className="text-xs text-gray-400 mt-1">Facturé au voyageur · Inclus avec abonnement</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link href="/register" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-100 inline-block">
              Accéder à tous les services →
            </Link>
            <p className="text-sm text-gray-400 mt-3">Les 3 services inclus dans tous les plans dès 9€/mois</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {[
          { value: '0%', label: 'Commission sur vos réservations' },
          { value: '5 min', label: 'Pour être opérationnel' },
          { value: '3', label: 'Services en 1 abonnement' },
          { value: '24/7', label: 'Disponibilité de la plateforme' },
        ].map((stat) => (
          <div key={stat.label}>
            <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Comment ça marche — Livret */}
      <section className="bg-emerald-50 py-20 border-y border-emerald-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-4xl mb-3">📖</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Livret d'accueil en 3 étapes</h2>
            <p className="text-gray-500">Vos voyageurs scannent le QR code à l'arrivée et ont tout sur leur téléphone</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: '✍️', title: 'Remplissez le livret', desc: 'WiFi, horaires, règles, restaurants du quartier, activités… tout en quelques minutes.' },
              { step: '2', icon: '🖨️', title: 'Imprimez le QR code', desc: 'Un QR code unique par logement. Collez-le à l\'entrée ou envoyez-le par message.' },
              { step: '3', icon: '📱', title: 'Le voyageur scanne', desc: 'Page mobile instantanée, sans app à télécharger. Toutes les infos du séjour.' },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-6 border border-emerald-100 text-center">
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-emerald-100">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-emerald-500 mb-1">ÉTAPE {item.step}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche — Caution */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-4xl mb-3">🔒</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Caution bancaire en ligne</h2>
            <p className="text-gray-500">Protégez votre logement · Le voyageur ne paye rien sauf en cas de dommages</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: '📤', title: 'Vous envoyez', desc: 'Un lien de caution personnalisé avec le montant souhaité.' },
              { icon: '💳', title: 'Le voyageur pré-autorise', desc: 'Sa carte est bloquée. Aucun débit immédiat.' },
              { icon: '🏠', title: 'Séjour terminé', desc: 'Vous inspectez le logement après le départ.' },
              { icon: '✅', title: 'Libérez ou encaissez', desc: '1 clic pour libérer. Ou capturez si dommages.' },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{item.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 bg-violet-50 border border-violet-100 rounded-2xl p-6 text-center">
            <p className="text-violet-700 font-semibold text-sm">
              💜 <strong>Frais caution abonné :</strong> 0.25€ + 0.99% du montant · facturés au voyageur<br />
              <span className="font-normal text-violet-600">Pour 500€ de caution : 5.20€ de frais voyageur · Vous ne payez rien</span>
            </p>
          </div>
        </div>
      </section>

      {/* Fonctionnalités PMS */}
      <section id="fonctionnalites" className="bg-gray-50 py-20 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-blue-100">
              ✦ Plateforme tout-en-un
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Tout ce dont vous avez besoin pour gérer vos locations</h2>
            <p className="text-gray-500 text-lg">Un seul outil. Zéro commission.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '📊',
                title: 'PMS — Tableau de bord',
                desc: 'Gérez tous vos logements, réservations et clients depuis un tableau de bord centralisé. Arrivées du jour, revenus, taux d\'occupation.',
                badge: null,
              },
              {
                icon: '📅',
                title: 'Calendrier centralisé',
                desc: 'Visualisez toutes vos disponibilités en un coup d\'œil. Bloquez des dates, gérez plusieurs logements, évitez les doubles réservations.',
                badge: null,
              },
              {
                icon: '🌐',
                title: 'Site de réservation directe',
                desc: 'Votre propre site pro avec moteur de disponibilités et paiement intégré. Recevez des réservations sans payer de commission aux OTAs.',
                badge: null,
              },
              {
                icon: '💳',
                title: 'Paiements intégrés',
                desc: 'Stripe, SumUp, PayPal — vos voyageurs paient en ligne, l\'argent arrive directement sur votre compte. Aucun intermédiaire.',
                badge: null,
              },
              {
                icon: '📈',
                title: 'Analytics & revenus',
                desc: 'Suivez votre chiffre d\'affaires, vos réservations et vos taux d\'occupation mois par mois. Économies vs Airbnb calculées automatiquement.',
                badge: null,
              },
              {
                icon: '📅',
                title: 'Sync calendriers Airbnb & Booking',
                desc: 'Importez vos calendriers Airbnb et Booking.com via iCal. Les dates réservées se synchronisent automatiquement pour éviter les conflits.',
                badge: null,
              },
              {
                icon: '📖',
                title: 'Livret d\'accueil QR',
                desc: 'Créez un livret numérique personnalisé. Vos voyageurs scannent le QR code et ont toutes les infos du séjour sur leur téléphone.',
                badge: null,
              },
              {
                icon: '🔒',
                title: 'Cautions bancaires',
                desc: 'Sécurisez votre logement. Le voyageur pré-autorise sa carte, vous capturez uniquement en cas de dommages.',
                badge: null,
              },
              {
                icon: '🔗',
                title: 'Channel Manager',
                desc: 'Synchronisation en temps réel des disponibilités, tarifs et réservations avec Airbnb, Booking.com, Expedia et Vrbo. Bientôt disponible.',
                badge: 'Bientôt',
              },
            ].map((f) => (
              <div key={f.title} className={`bg-white rounded-2xl p-6 border hover:shadow-md transition relative ${f.badge ? 'border-dashed border-gray-200 opacity-80' : 'border-gray-100'}`}>
                {f.badge && (
                  <span className="absolute top-4 right-4 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{f.badge}</span>
                )}
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparaison */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Pourquoi StayDirect ?</h2>
            <p className="text-gray-500">Comparez avec Airbnb et Booking</p>
          </div>
          {/* Table desktop */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500"></th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-blue-600">StayDirect</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Airbnb</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Booking.com</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  ['Commission hôte', '0%', '3%', '15–20%'],
                  ['Commission voyageur', '0%', '13%', '0%'],
                  ['Total prélevé', '0%', '~16%', '17–23%'],
                  ["📖 Livret d'accueil QR", '✅ Inclus', '❌', '❌'],
                  ['🔒 Cautions bancaires', '✅ Inclus', '❌', '❌'],
                  ['Site perso + domaine', '✅', '❌', '❌'],
                  ['Accès direct à vos clients', '✅', '❌', '❌'],
                ].map(([feature, sd, airbnb, booking]) => (
                  <tr key={feature} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-700 font-medium">{feature}</td>
                    <td className="px-6 py-3 text-center text-sm font-bold text-blue-600">{sd}</td>
                    <td className={`px-6 py-3 text-center text-sm font-semibold ${airbnb === '❌' || (airbnb !== '✅' && airbnb !== '0%') ? 'text-red-400' : 'text-gray-400'}`}>{airbnb}</td>
                    <td className={`px-6 py-3 text-center text-sm font-semibold ${booking === '❌' || (booking !== '✅' && booking !== '0%') ? 'text-red-400' : 'text-gray-400'}`}>{booking}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Cards mobile (replace table) */}
          <div className="md:hidden space-y-3">
            {[
              ['Commission hôte', '0%', '3%', '15–20%'],
              ['Commission voyageur', '0%', '13%', '0%'],
              ['Total prélevé', '0%', '~16%', '17–23%'],
              ["📖 Livret QR", '✅', '❌', '❌'],
              ['🔒 Cautions', '✅', '❌', '❌'],
              ['Site perso', '✅', '❌', '❌'],
            ].map(([feature, sd, airbnb, booking]) => (
              <div key={feature} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="text-sm font-semibold text-gray-700 mb-3">{feature}</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-[10px] text-blue-600 font-bold mb-1">StayDirect</div>
                    <div className="text-sm font-bold text-blue-600">{sd}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-semibold mb-1">Airbnb</div>
                    <div className={`text-sm font-semibold ${airbnb === '❌' ? 'text-red-400' : 'text-gray-500'}`}>{airbnb}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-semibold mb-1">Booking</div>
                    <div className={`text-sm font-semibold ${booking === '❌' ? 'text-red-400' : 'text-gray-500'}`}>{booking}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-center text-gray-400 mt-3">Airbnb : 3% hôte + 13% voyageur ≈ 16% · Booking.com : 15 à 23% selon le logement</p>
        </div>
      </section>

      {/* Tarifs */}
      <section id="tarifs" className="bg-gray-50 py-20 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Tarifs clairs, selon votre établissement</h2>
            <p className="text-gray-500 text-lg mb-2">0% de commission. 14 jours gratuits. Sans engagement.</p>
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold border border-green-100">
              ✅ Livret d'accueil + Cautions bancaires inclus dans tous les plans
            </div>
          </div>

          {/* Types de bien */}
          <div className="mb-10">
            <p className="text-center text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Quel type d'établissement gérez-vous ?</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { icon: '🏠', label: 'Meublé tourisme' },
                { icon: '🌴', label: 'Villa' },
                { icon: '🏰', label: 'Château' },
                { icon: '🏡', label: 'Maison d\'hôtes' },
                { icon: '🛏️', label: 'Chambre d\'hôtes' },
                { icon: '🏨', label: 'Hôtel' },
                { icon: '🏢', label: 'Appart-hôtel' },
                { icon: '⛺', label: 'Camping / Glamping' },
              ].map(t => (
                <div key={t.label} className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
                  <span>{t.icon}</span>{t.label}
                </div>
              ))}
            </div>
          </div>

          {/* 2 cartes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Meublé */}
            <div className="bg-white rounded-2xl border-2 border-blue-500 p-8 shadow-lg shadow-blue-50 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                ⭐ Le plus populaire
              </div>
              <div className="text-3xl mb-3">🏠</div>
              <h3 className="text-xl font-bold text-gray-900">Meublé · Villa · Château</h3>
              <p className="text-gray-500 text-sm mt-1 mb-5">Chambre d'hôtes, gîte, maison de vacances</p>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-600">1 à 4 logements</span>
                  <span className="font-bold text-gray-900">9€ / logement</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-600">5ème et + </span>
                  <span className="font-bold text-blue-600">5€ / logement</span>
                </div>
              </div>
              <ul className="space-y-1.5 mb-6">
                {['Site réservation pro', 'Sync iCal Airbnb & Booking', '📖 Livret QR inclus', '🔒 Cautions incluses', 'Domaine personnalisé', 'Prix dynamiques', 'Analytics'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-500 font-bold">✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block text-center py-3 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition">
                Commencer — 14j gratuits
              </Link>
            </div>

            {/* Hôtel */}
            <div className="bg-white rounded-2xl border-2 border-amber-400 p-8 shadow-lg shadow-amber-50 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                🏨 Hôtels & Résidences
              </div>
              <div className="text-3xl mb-3">🏨</div>
              <h3 className="text-xl font-bold text-gray-900">Hôtel · Appart-hôtel · Camping</h3>
              <p className="text-gray-500 text-sm mt-1 mb-5">Résidence de tourisme, glamping</p>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between py-2 border-b border-gray-50 text-sm">
                  <span className="text-gray-600">1 – 10 chambres</span><span className="font-bold">59€/mois</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50 text-sm">
                  <span className="text-gray-600">11 – 20 chambres</span><span className="font-bold">89€/mois</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50 text-sm">
                  <span className="text-gray-600">21 – 50 chambres</span><span className="font-bold text-amber-600">129€/mois</span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-gray-600">50+ chambres</span><span className="font-bold text-amber-600">199€/mois</span>
                </div>
              </div>
              <ul className="space-y-1.5 mb-6">
                {['Tout le plan Meublé inclus', '🔗 Channel manager inclus', 'Sync Booking, Airbnb, Expedia', 'Gestion stock par type de chambre', 'Analytics taux d\'occupation'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-500 font-bold">✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block text-center py-3 rounded-xl font-semibold bg-amber-500 text-white hover:bg-amber-600 transition">
                Commencer — 14j gratuits
              </Link>
            </div>
          </div>

          <p className="text-center text-sm text-gray-400">
            <Link href="/pricing" className="text-blue-600 hover:underline font-medium">Voir le calculateur de prix et le détail complet →</Link>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Questions fréquentes</h2>
        <div className="space-y-4">
          {[
            { q: "Les 3 services sont-ils vraiment inclus dans l'abonnement ?", a: "Oui. Le PMS (réservations directes), le livret d'accueil QR et les cautions bancaires sont inclus dans tous les plans StayDirect dès 9€/mois. Vous pouvez aussi les utiliser séparément." },
            { q: 'Comment fonctionne la caution bancaire ?', a: "Vous créez une demande de caution depuis votre dashboard. Votre voyageur reçoit un email avec un lien sécurisé, entre sa carte, et le montant est bloqué (pas débité). Après le séjour, vous libérez en 1 clic — ou vous encaissez si dommages." },
            { q: 'Qui paie les frais de caution ?', a: 'Le voyageur paie les frais de service (0.25€ + 0.99% si vous êtes abonné). Vous ne payez rien. En cas d\'encaissement : 0.25€ + 2.99% également à la charge du voyageur.' },
            { q: 'Y a-t-il des commissions sur les réservations ?', a: "Non. StayDirect ne prélève aucune commission sur vos réservations. Vous payez uniquement l'abonnement mensuel fixe." },
            { q: 'Comment fonctionne la synchronisation des calendriers Airbnb et Booking ?', a: 'Vous copiez votre lien iCal depuis Airbnb ou Booking.com et vous le collez dans le dashboard StayDirect. Les dates réservées sont importées automatiquement pour éviter les doubles réservations. Note : il s\'agit d\'une synchronisation de calendrier (iCal), pas d\'un channel manager temps réel — les tarifs et disponibilités ne sont pas poussés vers Airbnb/Booking depuis StayDirect. Le channel manager temps réel est en cours d\'intégration.' },
            { q: 'Puis-je annuler à tout moment ?', a: 'Oui, sans engagement ni frais. Annulation depuis votre dashboard en 1 clic.' },
            { q: "Et si je n'ai pas de compétences techniques ?", a: "Aucune compétence requise. Tout est pensé pour être autonome en 5 minutes. Vous remplissez un formulaire, votre site est en ligne. Le support est inclus dans tous les plans si vous avez besoin d'aide." },
            { q: 'Quelle est la différence avec Airbnb ou Booking ?', a: "Airbnb prélève 15 à 20% de commission sur chaque réservation. Avec StayDirect, vous payez un abonnement fixe dès 9€/mois et gardez 100% de vos revenus. Vous recevez les paiements directement sur votre compte bancaire." },
            { q: 'Mon site sera-t-il référencé sur Google ?', a: "Oui. Chaque site créé avec StayDirect est optimisé pour le référencement : balises SEO, sitemap, données structurées Google, et domaine personnalisé inclus. Vos voyageurs peuvent vous trouver directement sur Google." },
          ].map((item) => (
            <div key={item.q} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-sm transition">
              <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pour qui ? */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Pour quel type de professionnel ?</h2>
            <p className="text-gray-500">Propriétaires indépendants, conciergeries, hôtels indépendants</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
              <div className="text-4xl mb-3">🏡</div>
              <h3 className="font-bold text-gray-900 mb-2">Propriétaire · 1 à 5 logements</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">Vous louez votre appartement, villa ou maison. Vous en avez assez de payer 15–20% de commission à chaque réservation.</p>
              <div className="space-y-1 mb-5">
                {['Site de réservation directe', 'Calendrier + sync iCal', 'Livret QR + cautions'].map(f => (
                  <div key={f} className="text-xs text-blue-700 flex items-center gap-1.5"><span>✓</span>{f}</div>
                ))}
              </div>
              <Link href="/register" className="block text-center bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition">
                Commencer — 14j gratuits
              </Link>
            </div>
            <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">Conciergerie</div>
              <div className="text-4xl mb-3">🏢</div>
              <h3 className="font-bold text-gray-900 mb-2">Conciergerie · 5 à 50+ logements</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">Vous gérez des biens pour le compte de propriétaires. Calendrier multi-propriétés, rapports et automatisation.</p>
              <div className="space-y-1 mb-5">
                {['Gestion multi-logements', 'Calendrier centralisé', 'Analytics & revenus', 'Channel manager (bientôt)'].map(f => (
                  <div key={f} className="text-xs text-emerald-700 flex items-center gap-1.5"><span>✓</span>{f}</div>
                ))}
              </div>
              <Link href="/concierge" className="block text-center bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-emerald-700 transition">
                En savoir plus →
              </Link>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6">
              <div className="text-4xl mb-3">🏨</div>
              <h3 className="font-bold text-gray-900 mb-2">Hôtel indépendant</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">Gestion des chambres, réservations directes, channel manager. Forfait mensuel fixe, sans commission OTA.</p>
              <div className="space-y-1 mb-5">
                {['Gestion par type de chambre', 'Réservations directes', 'Channel manager inclus', 'Analytics taux d\'occupation'].map(f => (
                  <div key={f} className="text-xs text-amber-700 flex items-center gap-1.5"><span>✓</span>{f}</div>
                ))}
              </div>
              <Link href="/hotel" className="block text-center bg-amber-500 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-amber-600 transition">
                En savoir plus →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche — en 3 étapes */}
      <section className="py-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-blue-100">
              🚀 Opérationnel en 5 minutes
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Démarrez en 3 étapes</h2>
            <p className="text-gray-500">Pas besoin de carte bancaire pour commencer</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: '📝', title: 'Créez votre compte', desc: "Inscription en 2 minutes. Choisissez votre nom de site, téléchargez vos photos, rédigez votre description.", time: '2 min' },
              { step: '2', icon: '🔗', title: 'Connectez vos calendriers', desc: "Copiez-collez votre lien iCal Airbnb ou Booking. StayDirect synchronise automatiquement vos disponibilités.", time: '1 min' },
              { step: '3', icon: '💳', title: 'Activez les paiements', desc: "Connectez votre compte Stripe (gratuit). Vos voyageurs paient par carte, l'argent arrive chez vous directement.", time: '2 min' },
            ].map(item => (
              <div key={item.step} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-lg">{item.step}</div>
                <div className="text-3xl mb-3 mt-1">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-3">{item.desc}</p>
                <span className="text-xs bg-green-50 text-green-600 font-semibold px-2.5 py-1 rounded-full border border-green-100">⏱ {item.time}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/register" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-100 inline-block">
              Commencer maintenant →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Prêt à gérer vos locations comme un pro ?</h2>
          <p className="text-blue-100 text-lg mb-8">PMS · Livret d'accueil · Cautions bancaires — tout en 1, dès 9€/mois.</p>
          <Link href="/register" className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition inline-block shadow-lg">
            Créer mon compte gratuitement →
          </Link>
          <p className="text-blue-200 text-sm mt-4">Sans carte bancaire · 0% de commission · Annulable à tout moment</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="font-bold text-white">StayDirect</span>
              </div>
              <p className="text-sm leading-relaxed">La plateforme tout-en-un pour propriétaires de location courte durée.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Solutions</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/concierge" className="hover:text-white transition">Pour les conciergeries</Link></li>
                <li><Link href="/hotel" className="hover:text-white transition">Pour les hôtels</Link></li>
                <li><a href="#services" className="hover:text-white transition">Livret d'accueil QR</a></li>
                <li><a href="#services" className="hover:text-white transition">Cautions bancaires</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Compte</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="hover:text-white transition">Connexion</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition">Abonnement</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Infos</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
                <li><Link href="/cgu" className="hover:text-white transition">CGU</Link></li>
                <li><Link href="/mentions-legales" className="hover:text-white transition">Mentions légales</Link></li>
                <li><Link href="/confidentialite" className="hover:text-white transition">Confidentialité</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © 2025 StayDirect — staydirect.fr · Tous droits réservés · Besoin d'un site vitrine ? <a href="https://staysite.fr" target="_blank" rel="noopener" className="text-white hover:underline">Découvrez StaySite</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
