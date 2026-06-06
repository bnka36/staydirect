import Link from 'next/link'

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-md w-full">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Réservation confirmée !</h1>
        <p className="text-gray-500 mb-8">
          Votre paiement a été accepté. Vous allez recevoir une confirmation par email.
        </p>
        <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition inline-block">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  )
}
