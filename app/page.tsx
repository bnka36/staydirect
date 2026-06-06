import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-xl text-gray-900">StayDirect</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">
            Connexion
          </Link>
          <Link
            href="/register"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Commencer gratuitement
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          🎯 Zéro commission, 100% à vous
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Recevez des réservations directes<br />
          <span className="text-blue-600">sans payer Airbnb ni Booking</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          StayDirect vous donne votre propre site de réservation, synchronise vos calendriers Airbnb/Booking et encaisse les paiements directement sur votre compte.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-100"
          >
            Créer mon espace gratuit →
          </Link>
          <Link href="#comment-ca-marche" className="text-gray-600 hover:text-gray-900 font-medium">
            Voir comment ça marche
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-600 py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center text-white">
          <div>
            <div className="text-4xl font-bold">0%</div>
            <div className="text-blue-100 mt-1">Commission prélevée</div>
          </div>
          <div>
            <div className="text-4xl font-bold">15%</div>
            <div className="text-blue-100 mt-1">Économisé vs Airbnb</div>
          </div>
          <div>
            <div className="text-4xl font-bold">5 min</div>
            <div className="text-blue-100 mt-1">Pour démarrer</div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="comment-ca-marche" className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">Comment ça marche ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { step: '1', title: 'Créez votre espace', desc: "Inscrivez-vous gratuitement et ajoutez vos logements en quelques minutes.", icon: '🏠' },
            { step: '2', title: 'Connectez vos calendriers', desc: "Synchronisez Airbnb et Booking via iCal pour éviter les doubles réservations.", icon: '📅' },
            { step: '3', title: 'Recevez des paiements', desc: "Vos voyageurs réservent et paient directement sur votre site. L'argent va sur votre compte Stripe.", icon: '💳' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                {item.icon}
              </div>
              <div className="text-blue-600 font-semibold mb-2">Étape {item.step}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-2xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Prêt à garder 100% de vos revenus ?</h2>
          <p className="text-gray-500 mb-8">Rejoignez les propriétaires qui ont repris le contrôle de leurs réservations.</p>
          <Link href="/register" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition inline-block">
            Démarrer gratuitement
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-gray-400 text-sm">
        © 2025 StayDirect — staydirect.fr
      </footer>
    </main>
  )
}
