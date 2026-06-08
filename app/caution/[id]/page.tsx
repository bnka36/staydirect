import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import CautionPayment from './CautionPayment'

export default async function CautionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const deposit = await prisma.securityDeposit.findUnique({
    where: { id },
    include: {
      property: { select: { name: true, city: true } },
      user: { select: { name: true } },
    },
  })

  if (!deposit) notFound()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">StayDirect</h1>
          <p className="text-gray-500 text-sm mt-1">Dépôt de garantie sécurisé</p>
        </div>

        {deposit.status === 'authorized' ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Dépôt déjà validé</h2>
            <p className="text-gray-500 text-sm">Votre dépôt de garantie de <strong>{deposit.amount}€</strong> a bien été pré-autorisé. Aucun montant n'a été débité.</p>
          </div>
        ) : deposit.status === 'released' ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Dépôt libéré</h2>
            <p className="text-gray-500 text-sm">Votre dépôt de garantie a été libéré. Aucun montant n'a été débité.</p>
          </div>
        ) : deposit.status === 'captured' ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Dépôt encaissé</h2>
            <p className="text-gray-500 text-sm">Le dépôt de garantie a été encaissé par votre hôte. Contactez-le pour plus d'informations.</p>
          </div>
        ) : (
          <CautionPayment
            depositId={deposit.id}
            amount={deposit.amount}
            guestName={deposit.guestName}
            ownerName={deposit.user.name || 'Votre hôte'}
            propertyName={deposit.property?.name}
            checkIn={deposit.checkIn?.toISOString() || null}
            checkOut={deposit.checkOut?.toISOString() || null}
            clientSecret={deposit.stripeClientSecret!}
            stripePublicKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
          />
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          🔒 Paiement sécurisé par Stripe · Aucun débit immédiat
        </p>
      </div>
    </div>
  )
}
