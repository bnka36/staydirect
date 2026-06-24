import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams
  const reservation = id ? await prisma.reservation.findUnique({
    where: { id },
    include: { property: { include: { user: true } } },
  }) : null

  const fmt = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const fmtPrice = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-start justify-center px-4 pt-12 pb-20">
      <div className="w-full max-w-lg">

        {/* Header succès */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-100">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Réservation confirmée !</h1>
          <p className="text-gray-500">Votre paiement a été accepté avec succès</p>
        </div>

        {reservation ? (
          <>
            {/* Détails réservation */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
              {reservation.property.images?.[0] && (
                <img src={reservation.property.images[0]} className="w-full h-40 object-cover" alt={reservation.property.name} />
              )}
              <div className="p-6">
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Votre logement</div>
                <h2 className="text-xl font-black text-gray-900 mb-1">🏠 {reservation.property.name}</h2>
                {reservation.property.city && (
                  <p className="text-sm text-gray-400 mb-5">📍 {reservation.property.city}</p>
                )}

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <div className="text-xs font-semibold text-blue-500 uppercase mb-1">Arrivée</div>
                    <div className="text-sm font-bold text-blue-900">{fmt(reservation.checkIn)}</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <div className="text-xs font-semibold text-blue-500 uppercase mb-1">Départ</div>
                    <div className="text-sm font-bold text-blue-900">{fmt(reservation.checkOut)}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center py-3 border-t border-gray-50">
                  <span className="text-sm text-gray-500">Durée du séjour</span>
                  <span className="font-bold text-gray-900">{reservation.nights} nuit{reservation.nights > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-t border-gray-50">
                  <span className="text-sm text-gray-500">Voyageur</span>
                  <span className="font-bold text-gray-900">{reservation.guestName}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-t border-gray-50">
                  <span className="text-sm text-gray-500">Montant payé</span>
                  <span className="text-xl font-black text-green-600">{fmtPrice(reservation.totalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Prochaines étapes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
              <h3 className="font-bold text-gray-900 mb-4">📋 Prochaines étapes</h3>
              <div className="space-y-4">
                {[
                  { icon: '📧', title: 'Email de confirmation', desc: `Un email de confirmation a été envoyé à ${reservation.guestEmail}` },
                  { icon: '📞', title: 'Contact hôte', desc: `Votre hôte ${reservation.property.user.name || 'vous'} vous contactera avant votre arrivée` },
                  { icon: '📖', title: 'Livret d\'accueil', desc: 'Vous recevrez le livret numérique avec toutes les infos pratiques' },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">{step.icon}</div>
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">{step.title}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact hôte */}
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 mb-6">
              <div className="text-xs font-bold text-gray-400 uppercase mb-2">Votre hôte</div>
              <div className="font-bold text-gray-900">{reservation.property.user.name}</div>
              <a href={`mailto:${reservation.property.user.email}`} className="text-blue-600 text-sm hover:underline">{reservation.property.user.email}</a>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center mb-6">
            <p className="text-gray-500">Votre réservation a bien été enregistrée.<br />Vous allez recevoir une confirmation par email.</p>
          </div>
        )}

        {/* Badge confiance */}
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6 text-center">
          <p className="text-green-700 text-sm font-semibold">🔒 Paiement sécurisé · 0% commission · Réservation directe</p>
          <p className="text-green-600 text-xs mt-1">Vous avez économisé les frais de service Airbnb/Booking (~16%)</p>
        </div>

        <div className="text-center">
          <Link href="/" className="text-gray-400 text-sm hover:text-gray-600 underline">Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  )
}
