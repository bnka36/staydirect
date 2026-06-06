import Link from 'next/link'

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-md w-full">
        <div className="text-6xl mb-6">❌</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Paiement annulé</h1>
        <p className="text-gray-500 mb-8">
          Votre réservation n&apos;a pas été finalisée. Vous pouvez réessayer à tout moment.
        </p>
        <Link href="javascript:history.back()" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition inline-block">
          Réessayer
        </Link>
      </div>
    </div>
  )
}
