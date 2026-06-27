import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function PendingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { property: { include: { user: true } } },
  })

  const fmt = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const fmtPrice = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-start justify-center px-4 pt-12 pb-20">
      <div className="w-full max-w-lg">

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-100">
            <span className="text-4xl">📋</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Demande envoyée !</h1>
          <p className="text-gray-500">Votre demande de réservation a été transmise à l'hôte</p>
        </div>

        {reservation && (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
              {reservation.property.images?.[0] && (
                <img src={reservation.property.images[0]} className="w-full h-40 object-cover" alt={reservation.property.name} />
              )}
              <div className="p-6">
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
                  <span className="text-sm text-gray-500">Montant total</span>
                  <span className="text-xl font-black text-gray-900">{fmtPrice(reservation.totalPrice)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
              <h3 className="font-bold text-gray-900 mb-4">📋 Prochaines étapes</h3>
              <div className="space-y-4">
                {[
                  { icon: '📧', title: 'Confirmation en attente', desc: `L'hôte ${reservation.property.user.name || ''} va confirmer votre demande et vous envoyer les instructions de paiement` },
                  { icon: '💳', title: 'Paiement à venir', desc: 'Une fois confirmée, vous recevrez un lien pour finaliser le paiement' },
                  { icon: '📖', title: 'Livret d\'accueil', desc: 'Après paiement, vous recevrez le livret numérique avec toutes les infos pratiques' },
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

            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 mb-6">
              <div className="text-xs font-bold text-gray-400 uppercase mb-2">Contacter l'hôte directement</div>
              <div className="font-bold text-gray-900">{reservation.property.user.name}</div>
              <a href={`mailto:${reservation.property.user.email}`} className="text-blue-600 text-sm hover:underline">{reservation.property.user.email}</a>
              {(reservation.property.user as any).whatsapp && (
                <a href={`https://wa.me/${(reservation.property.user as any).whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-2 bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-xl w-fit hover:bg-green-600 transition">
                  📱 WhatsApp
                </a>
              )}
            </div>
          </>
        )}

        <div className="text-center">
          <Link href="/" className="text-gray-400 text-sm hover:text-gray-600 underline">Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  )
}
