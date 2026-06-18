import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="font-bold text-xl text-gray-900">StayDirect</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-gray-500 hover:text-gray-900 text-sm font-medium">Services</a>
            <a href="#fonctionnalites" className="text-gray-500 hover:text-gray-900 text-sm font-medium">Fonctionnalités</a>
            <a href="#tarifs" className="text-gray-500 hover:text-gray-900 text-sm font-medium">Tarifs</a>
            <a href="#faq" className="text-gray-500 hover:text-gray-900 text-sm font-medium">FAQ</a>
            <Link href="/contact" className="text-gray-500 hover:text-gray-900 text-sm font-medium">Contact</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm">
              Connexion
            </Link>
            <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition shadow-sm text-sm">
              Essai gratuit
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-8 border border-blue-100">
          🚀 +120 propriétaires · 0% commission · Essai 14 jours gratuit
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
          Gérez vos locations,<br />
          <span className="text-blue-600">Économisez 3 000€/an de commissions</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Réservations directes sans commission · Livret d'accueil QR · Cautions bancaires en ligne — tout en un seul endroit.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link href="/register" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-100 w-full sm:w-auto">
            Essai gratuit 14 jours →
          </Link>
          <a href="#services" className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2">
            Découvrir les services ↓
          </a>
        </div>
        <p className="text-sm text-gray-400">Sans carte bancaire · 14 jours gratuits · Annulable à tout moment</p>
      </section>


      {/* Preuve sociale */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          {/* Compteur */}
          <div className="flex flex-wrap justify-center gap-10 mb-14 text-center">
            {[
              { value: '120+', label: 'propriétaires actifs' },
              { value: '3 000€', label: 'économisés en moyenne/an' },
              { value: '0%', label: 'commission prélevée' },
              { value: '14j', label: "d'essai gratuit sans CB" },
            ].map(s => (
              <div key={s.label}>
                <div className="text-4xl font-black text-blue-600">{s.value}</div>
                <div className="text-sm text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Témoignages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Sophie M.',
                location: 'Propriétaire · Lyon',
                avatar: 'SM',
                color: 'bg-blue-100 text-blue-700',
                text: "J'économise 2 800€ par an de commissions Airbnb. Mon site tourne tout seul, les voyageurs réservent directement. Je ne reviendrai jamais en arrière.",
                stars: 5,
              },
              {
                name: 'Karim B.',
                location: '3 villas · Marrakech',
                avatar: 'KB',
                color: 'bg-emerald-100 text-emerald-700',
                text: "Le livret QR est incroyable. Mes clients ont tout sur leur téléphone dès l'arrivée. Et le calendrier synchronisé avec Booking m'a sauvé de plusieurs doubles réservations.",
                stars: 5,
              },
              {
                name: 'Isabelle T.',
                location: 'Gîte · Bretagne',
                avatar: 'IT',
                color: 'bg-violet-100 text-violet-700',
                text: "J'hésitais car je ne suis pas technique. En 20 minutes j'avais mon site en ligne et mon premier virement direct reçu. Le support répond vite.",
                stars: 5,
              },
            ].map(t => (
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
        </div>
      </section>

      {/* Démo visuelle dashboard */}
      <section className="py-20 bg-gradient-to-b from-blue-600 to-blue-700">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
            👀 Aperçu du dashboard
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Tout gérer en un coup d'œil</h2>
          <p className="text-blue-100 mb-10 max-w-xl mx-auto">Réservations, calendrier, revenus, livret et cautions — dans une interface claire, sans formation.</p>
          {/* Dashboard mockup */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden text-left max-w-4xl mx-auto">
            {/* Barre du haut */}
            <div className="bg-gray-900 flex items-center gap-2 px-4 py-3">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="flex-1 bg-gray-700 rounded mx-8 py-1 px-3 text-xs text-gray-400">staydirect.fr/dashboard</div>
            </div>
            {/* Contenu mockup */}
            <div className="flex">
              {/* Sidebar */}
              <div className="w-16 bg-gray-50 border-r border-gray-100 flex flex-col items-center py-4 gap-4">
                {['⊞','📅','🏠','📋','💰','📊'].map((icon, i) => (
                  <div key={i} className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${i === 0 ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-100'}`}>{icon}</div>
                ))}
              </div>
              {/* Main */}
              <div className="flex-1 p-5 bg-gray-50">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Revenus ce mois', value: '2 840€', color: 'text-green-600' },
                    { label: 'Réservations', value: '8', color: 'text-blue-600' },
                    { label: 'Taux occupation', value: '73%', color: 'text-purple-600' },
                    { label: 'En attente', value: '2', color: 'text-orange-500' },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl p-3 border border-gray-100">
                      <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
                {/* Calendrier mini */}
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="text-xs font-bold text-gray-500 mb-3">CALENDRIER — Juillet 2025</div>
                  <div className="grid grid-cols-7 gap-1">
                    {['L','M','M','J','V','S','D'].map(d => (
                      <div key={d} className="text-center text-[9px] font-bold text-gray-300 pb-1">{d}</div>
                    ))}
                    {[null,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31].map((d, i) => (
                      <div key={i} className={`h-6 rounded text-[9px] flex items-center justify-center font-medium
                        ${!d ? '' : d >= 5 && d <= 12 ? 'bg-blue-100 text-blue-700' : d >= 18 && d <= 24 ? 'bg-orange-100 text-orange-600' : 'text-gray-400'}`}>
                        {d || ''}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-3 text-[9px] text-gray-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-200 inline-block"/>Direct</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-orange-200 inline-block"/>Airbnb/Booking</span>
                  </div>
                </div>
              </div>
            </div>
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tout ce dont vous avez besoin</h2>
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
                {['Site de réservation public', 'Sync iCal Airbnb & Booking', 'Paiements directs sur votre compte', 'Tableau de bord PMS', 'Emails de confirmation auto'].map(f => (
                  <div key={f} className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="text-green-500 font-bold flex-shrink-0">✓</span>
                    {f}
                  </div>
                ))}
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-2xl font-black text-blue-700">Dès 19€<span className="text-sm font-medium text-gray-400">/mois</span></div>
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
                  <div className="text-2xl font-black text-emerald-600">4.90€<span className="text-sm font-medium text-gray-400">/mois</span></div>
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
            <p className="text-sm text-gray-400 mt-3">Les 3 services inclus dans tous les plans dès 19€/mois</p>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Livret d'accueil en 3 étapes</h2>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Caution bancaire en ligne</h2>
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
            <div className="text-4xl mb-3">🏠</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Réservations directes — sans commission</h2>
            <p className="text-gray-500 text-lg">Votre propre site, vos propres clients, votre propre argent</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🌐',
                title: 'Site de réservation public',
                desc: 'Votre propre page pro avec moteur de disponibilités, photos et paiement intégré. Accessible sur staydirect.fr/p/votre-nom.',
              },
              {
                icon: '📅',
                title: 'Calendrier & sync iCal',
                desc: 'Connectez vos calendriers Airbnb et Booking en quelques secondes. Fini les doubles réservations.',
              },
              {
                icon: '💳',
                title: 'Paiements directs Stripe',
                desc: "Vos voyageurs paient par carte. L'argent arrive sur votre compte en 2 jours. Aucun intermédiaire.",
              },
              {
                icon: '📊',
                title: 'Tableau de bord PMS',
                desc: 'Gérez tous vos logements, suivez vos revenus, consultez vos réservations depuis un seul endroit.',
              },
              {
                icon: '📧',
                title: 'Emails automatiques',
                desc: 'Vos voyageurs reçoivent une confirmation automatique. Vous êtes notifié instantanément.',
              },
              {
                icon: '🏘️',
                title: 'Multi-logements',
                desc: "Gérez 1 à 15 logements selon votre plan. Chaque logement a sa propre page et son calendrier.",
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{f.title}</h3>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pourquoi StayDirect ?</h2>
            <p className="text-gray-500">Comparez avec Airbnb et Booking</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
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
          <p className="text-xs text-center text-gray-400 mt-3">Airbnb : 3% hôte + 13% voyageur ≈ 16% · Booking.com : 15 à 23% selon le logement</p>
        </div>
      </section>

      {/* Tarifs */}
      <section id="tarifs" className="bg-gray-50 py-20 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tarifs clairs, sans surprise</h2>
            <p className="text-gray-500 text-lg mb-4">Aucune commission sur vos réservations. Jamais.</p>
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold border border-green-100">
              ✅ Livret d'accueil + Cautions bancaires inclus dans tous les plans
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Solo',
                price: '19',
                desc: '1 logement',
                features: ['1 logement', 'Site de réservation', '📖 Livret QR inclus', '🔒 Cautions incluses', 'Sync iCal', 'Paiements Stripe'],
                popular: false,
              },
              {
                name: 'Petit propriétaire',
                price: '39',
                desc: "Jusqu'à 5 logements",
                features: ['5 logements', 'Tout Solo inclus', '📖 Livret QR inclus', '🔒 Cautions incluses', 'Calendrier unifié', 'Analytics revenus'],
                popular: true,
              },
              {
                name: 'Pro / Agence',
                price: '69',
                desc: "Jusqu'à 15 logements",
                features: ['15 logements', 'Tout inclus', '📖 Livret QR inclus', '🔒 Cautions incluses', '4 thèmes de site', 'Support téléphonique'],
                popular: false,
              },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-8 relative ${plan.popular ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-white border border-gray-100'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-400 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                    LE PLUS POPULAIRE
                  </div>
                )}
                <div className={`text-sm font-semibold mb-1 ${plan.popular ? 'text-blue-200' : 'text-blue-600'}`}>{plan.desc}</div>
                <h3 className={`text-xl font-bold mb-4 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                <div className="mb-6">
                  <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>{plan.price}€</span>
                  <span className={plan.popular ? 'text-blue-200' : 'text-gray-400'}>/mois</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                      <span className={plan.popular ? 'text-blue-300' : 'text-green-500'}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center py-3 rounded-xl font-semibold transition ${
                    plan.popular
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Commencer
                </Link>
              </div>
            ))}
          </div>

          {/* Services standalone */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-5">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">📖</div>
              <div className="flex-1">
                <div className="font-bold text-gray-900">Livret d'accueil QR Code</div>
                <div className="text-xs text-gray-400 mt-0.5">Sans abonnement StayDirect</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-emerald-700">4.90€</div>
                <div className="text-xs text-gray-400">/mois</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-5">
              <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">🔒</div>
              <div className="flex-1">
                <div className="font-bold text-gray-900">Cautions bancaires</div>
                <div className="text-xs text-gray-400 mt-0.5">Sans abonnement StayDirect</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-violet-700">0.25€ + 1.5%</div>
                <div className="text-xs text-gray-400">par caution (voyageur)</div>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-400 mt-4">
            <Link href="/pricing" className="text-blue-600 hover:underline font-medium">Voir le détail complet des tarifs →</Link>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Questions fréquentes</h2>
        <div className="space-y-4">
          {[
            { q: "Les 3 services sont-ils vraiment inclus dans l'abonnement ?", a: "Oui. Le PMS (réservations directes), le livret d'accueil QR et les cautions bancaires sont inclus dans tous les plans StayDirect dès 19€/mois. Vous pouvez aussi les utiliser séparément." },
            { q: 'Comment fonctionne la caution bancaire ?', a: "Vous créez une demande de caution depuis votre dashboard. Votre voyageur reçoit un email avec un lien sécurisé, entre sa carte, et le montant est bloqué (pas débité). Après le séjour, vous libérez en 1 clic — ou vous encaissez si dommages." },
            { q: 'Qui paie les frais de caution ?', a: 'Le voyageur paie les frais de service (0.25€ + 0.99% si vous êtes abonné). Vous ne payez rien. En cas d\'encaissement : 0.25€ + 2.99% également à la charge du voyageur.' },
            { q: 'Y a-t-il des commissions sur les réservations ?', a: "Non. StayDirect ne prélève aucune commission sur vos réservations. Vous payez uniquement l'abonnement mensuel fixe." },
            { q: 'Comment fonctionne la synchronisation des calendriers ?', a: 'Vous collez simplement votre lien iCal Airbnb ou Booking dans le dashboard. StayDirect importe automatiquement les dates réservées pour éviter les doubles réservations.' },
            { q: 'Puis-je annuler à tout moment ?', a: 'Oui, sans engagement ni frais. Annulation depuis votre dashboard en 1 clic.' },
          ].map((item) => (
            <div key={item.q} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-sm transition">
              <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold text-white mb-4">Prêt à gérer vos locations comme un pro ?</h2>
          <p className="text-blue-100 text-lg mb-8">PMS · Livret d'accueil · Cautions bancaires — tout en 1, dès 19€/mois.</p>
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
              <h4 className="font-semibold text-white mb-3 text-sm">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#services" className="hover:text-white transition">Réservations directes</a></li>
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
                <li><a href="#" className="hover:text-white transition">CGU</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © 2025 StayDirect — staydirect.fr · Tous droits réservés
          </div>
        </div>
      </footer>
    </main>
  )
}
