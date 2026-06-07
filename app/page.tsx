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
            <a href="#fonctionnalites" className="text-gray-500 hover:text-gray-900 text-sm font-medium">Fonctionnalités</a>
            <a href="#tarifs" className="text-gray-500 hover:text-gray-900 text-sm font-medium">Tarifs</a>
            <a href="#faq" className="text-gray-500 hover:text-gray-900 text-sm font-medium">FAQ</a>
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
          🚀 La seule plateforme sans commission pour propriétaires
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
          Recevez des réservations directes<br />
          <span className="text-blue-600">et gardez 100% de vos revenus</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          StayDirect remplace Airbnb et Booking pour vos réservations directes. Site de réservation, paiements, calendriers synchronisés — tout en un.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link href="/register" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-100 w-full sm:w-auto">
            Commencer gratuitement →
          </Link>
          <a href="#tarifs" className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2">
            Voir les tarifs
          </a>
        </div>
        <p className="text-sm text-gray-400">Sans carte bancaire · Annulable à tout moment</p>
      </section>

      {/* Logos partenaires */}
      <section className="bg-gray-50 py-8 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-400 mb-6 font-medium uppercase tracking-wider">Compatible avec</p>
          <div className="flex items-center justify-center gap-10 flex-wrap">
            {['Airbnb', 'Booking.com', 'Stripe', 'Google'].map((name) => (
              <span key={name} className="text-gray-300 font-bold text-lg">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {[
          { value: '0%', label: 'Commission sur vos réservations' },
          { value: '5 min', label: 'Pour créer votre site' },
          { value: '2x', label: 'Plus économique que la concurrence' },
          { value: '24/7', label: 'Disponibilité du site' },
        ].map((stat) => (
          <div key={stat.label}>
            <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Fonctionnalités */}
      <section id="fonctionnalites" className="bg-gray-50 py-20 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-gray-500 text-lg">Un seul outil pour gérer toutes vos réservations directes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🌐',
                title: 'Site de réservation public',
                desc: 'Votre propre page de réservation professionnelle avec moteur de disponibilités, photos et paiement intégré. Accessible sur staydirect.fr/p/votre-nom.',
              },
              {
                icon: '📅',
                title: 'Calendrier & sync iCal',
                desc: 'Connectez vos calendriers Airbnb et Booking en quelques secondes. Fini les doubles réservations. Toutes vos disponibilités au même endroit.',
              },
              {
                icon: '💳',
                title: 'Paiements directs Stripe',
                desc: "Vos voyageurs paient par carte bancaire directement. L'argent arrive sur votre compte en 2 jours. Aucun intermédiaire.",
              },
              {
                icon: '📊',
                title: 'Tableau de bord PMS',
                desc: 'Gérez tous vos logements, suivez vos revenus, consultez vos réservations passées et futures depuis un seul endroit.',
              },
              {
                icon: '📧',
                title: 'Emails automatiques',
                desc: 'Vos voyageurs reçoivent une confirmation automatique après chaque réservation. Vous êtes notifié instantanément.',
              },
              {
                icon: '🏠',
                title: 'Multi-logements',
                desc: "Gérez 1 à 15 logements selon votre plan. Chaque logement a sa propre page, ses photos, son calendrier et ses disponibilités.",
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

      {/* Comment ça marche */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">En ligne en 5 minutes</h2>
          <p className="text-gray-500">Pas besoin de compétences techniques</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '1', icon: '✍️', title: 'Inscription', desc: 'Créez votre compte gratuitement' },
            { step: '2', icon: '🏠', title: 'Ajoutez vos logements', desc: 'Photos, description, prix par nuit' },
            { step: '3', icon: '📅', title: 'Connectez vos calendriers', desc: 'Collez votre lien iCal Airbnb/Booking' },
            { step: '4', icon: '💰', title: 'Recevez des réservations', desc: 'Partagez votre lien et encaissez' },
          ].map((item) => (
            <div key={item.step} className="text-center relative">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-blue-100">
                {item.icon}
              </div>
              <div className="text-xs font-bold text-blue-500 mb-1">ÉTAPE {item.step}</div>
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparaison */}
      <section className="bg-gray-50 py-20 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pourquoi StayDirect ?</h2>
            <p className="text-gray-500">Comparez avec la concurrence</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500"></th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-blue-600">StayDirect</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Airbnb</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Booking.com</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  ['Commission hôte', '0%', '3%', '15 à 20%'],
                  ['Commission voyageur', '0%', '13%', '0%'],
                  ['Total prélevé par réservation', '0%', '~16%', '17 à 23%'],
                  ['Site de réservation perso', '✅', '❌', '❌'],
                  ['Paiements directs sur votre compte', '✅', '❌', '❌'],
                  ['Sync calendrier iCal', '✅', '✅', '✅'],
                ].map(([feature, sd, airbnb, booking]) => (
                  <tr key={feature} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-700 font-medium">{feature}</td>
                    <td className="px-6 py-3 text-center text-sm font-bold text-blue-600">{sd}</td>
                    <td className={`px-6 py-3 text-center text-sm font-semibold ${airbnb !== '✅' && airbnb !== '0%' ? 'text-red-500' : 'text-gray-400'}`}>{airbnb}</td>
                    <td className={`px-6 py-3 text-center text-sm font-semibold ${booking !== '✅' && booking !== '0%' ? 'text-red-500' : 'text-gray-400'}`}>{booking}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-center text-gray-400 mt-3">Airbnb : 3% hôte + 13% voyageur ≈ 16% par réservation · Booking.com : 15 à 23% selon le logement</p>
        </div>
      </section>

      {/* Tarifs */}
      <section id="tarifs" className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Tarifs clairs, sans surprise</h2>
          <p className="text-gray-500 text-lg">Aucune commission sur vos réservations. Jamais.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: 'Solo',
              price: '19',
              period: '/mois',
              desc: '1 logement',
              features: ['1 logement', 'Site de réservation', '🌍 Domaine perso inclus', 'Sync iCal', 'Paiements Stripe', 'Emails automatiques'],
              cta: 'Commencer',
              popular: false,
              href: '/register',
            },
            {
              name: 'Petit propriétaire',
              price: '39',
              period: '/mois',
              desc: 'Jusqu\'à 5 logements',
              features: ['5 logements', 'Tout Solo inclus', '🌍 Domaine perso inclus', 'Calendrier unifié', 'Analytics revenus', 'Support prioritaire'],
              cta: 'Choisir ce plan',
              popular: true,
              href: '/register',
            },
            {
              name: 'Pro / Agence',
              price: '69',
              period: '/mois',
              desc: 'Jusqu\'à 15 logements',
              features: ['15 logements', 'Tout inclus', '🌍 Domaine perso inclus', '4 thèmes de site', 'Analytics avancés', 'Support téléphonique'],
              cta: 'Choisir ce plan',
              popular: false,
              href: '/register',
            },
          ].map((plan) => (
            <div key={plan.name} className={`rounded-2xl p-8 relative ${plan.popular ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-white border border-gray-100'}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-400 text-white text-xs font-bold px-4 py-1 rounded-full">
                  LE PLUS POPULAIRE
                </div>
              )}
              <div className={`text-sm font-semibold mb-1 ${plan.popular ? 'text-blue-200' : 'text-blue-600'}`}>{plan.desc}</div>
              <h3 className={`text-xl font-bold mb-4 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
              <div className="mb-6">
                <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>{plan.price}€</span>
                <span className={plan.popular ? 'text-blue-200' : 'text-gray-400'}>{plan.period}</span>
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
                href={plan.href}
                className={`block text-center py-3 rounded-xl font-semibold transition ${
                  plan.popular
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Témoignages */}
      <section className="bg-gray-50 py-20 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Ce que disent nos propriétaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Marie L.', location: 'Nice', text: "J'économise 180€ par mois de commissions Airbnb. StayDirect est simple et mes clients adorent réserver directement.", stars: 5 },
              { name: 'Thomas B.', location: 'Paris', text: "La synchronisation iCal fonctionne parfaitement. Plus aucune double réservation depuis que j'utilise StayDirect.", stars: 5 },
              { name: 'Sophie M.', location: 'Bordeaux', text: "En 5 minutes j'avais mon site de réservation en ligne. Incroyable pour le prix.", stars: 5 },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {Array(t.stars).fill('⭐').map((s, i) => <span key={i}>{s}</span>)}
                </div>
                <p className="text-gray-600 text-sm mb-4 italic">"{t.text}"</p>
                <div className="font-semibold text-gray-900 text-sm">{t.name} <span className="text-gray-400 font-normal">· {t.location}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Questions fréquentes</h2>
        <div className="space-y-4">
          {[
            { q: 'Y a-t-il des commissions sur les réservations ?', a: 'Non. StayDirect ne prélève aucune commission sur vos réservations. Vous payez uniquement l\'abonnement mensuel fixe.' },
            { q: 'Comment fonctionne la synchronisation des calendriers ?', a: 'Vous collez simplement votre lien iCal Airbnb ou Booking dans le dashboard. StayDirect importe automatiquement vos dates réservées pour éviter les doubles réservations.' },
            { q: 'Puis-je annuler à tout moment ?', a: 'Oui, vous pouvez annuler votre abonnement à tout moment depuis votre dashboard, sans frais ni engagement.' },
            { q: 'Comment mes voyageurs me paient-ils ?', a: 'Via Stripe, la plateforme de paiement la plus sécurisée au monde. L\'argent arrive directement sur votre compte en 2-7 jours ouvrés.' },
            { q: 'Puis-je utiliser StayDirect en plus d\'Airbnb ?', a: 'Absolument. La plupart de nos propriétaires continuent sur Airbnb et utilisent StayDirect en complément pour leurs réservations directes.' },
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
          <h2 className="text-3xl font-bold text-white mb-4">Prêt à arrêter de payer des commissions ?</h2>
          <p className="text-blue-100 text-lg mb-8">Rejoignez des centaines de propriétaires qui encaissent directement.</p>
          <Link href="/register" className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition inline-block shadow-lg">
            Créer mon compte gratuitement →
          </Link>
          <p className="text-blue-200 text-sm mt-4">Dès 19€/mois · Sans commission · Annulable à tout moment</p>
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
              <p className="text-sm leading-relaxed">La plateforme de réservation directe pour propriétaires.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#fonctionnalites" className="hover:text-white transition">Fonctionnalités</a></li>
                <li><a href="#tarifs" className="hover:text-white transition">Tarifs</a></li>
                <li><Link href="/register" className="hover:text-white transition">Inscription</Link></li>
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
              <h4 className="font-semibold text-white mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">CGU</a></li>
                <li><a href="#" className="hover:text-white transition">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
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
