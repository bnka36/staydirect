'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function QRCodeSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [targetUrl, setTargetUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!sessionId) return
    fetch(`/api/qrcode/generate?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.qrDataUrl) {
          setQrDataUrl(data.qrDataUrl)
          setTargetUrl(data.url)
        } else {
          setError('Erreur lors de la génération du QR code.')
        }
      })
      .catch(() => setError('Erreur réseau.'))
      .finally(() => setLoading(false))
  }, [sessionId])

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <nav className="bg-white/95 border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="font-bold text-xl text-gray-900">StayDirect</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        {loading && (
          <div className="text-gray-500 text-lg">Génération de votre QR code...</div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl">{error}</div>
        )}

        {qrDataUrl && (
          <>
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              ✅ QR Code généré et envoyé par email !
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Votre QR Code est prêt</h1>
            <p className="text-gray-500 mb-8">Il a aussi été envoyé à votre adresse email.</p>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8 mb-8">
              <img
                src={qrDataUrl}
                alt="QR Code"
                className="w-48 h-48 mx-auto mb-4 rounded-xl border-4 border-gray-100"
              />
              <p className="text-xs text-gray-400 break-all">{targetUrl}</p>

              <a
                href={qrDataUrl}
                download="qrcode-staydirect.png"
                className="mt-6 inline-block bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition"
              >
                Télécharger le QR Code →
              </a>
            </div>

            {/* Upsell */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <p className="text-lg font-bold text-blue-900 mb-2">
                Envie d'une vraie page de réservation ?
              </p>
              <p className="text-sm text-blue-700 mb-5">
                Créez votre site en 5 minutes, encaissez directement sans commission, synchronisez Airbnb et Booking.
              </p>
              <Link
                href="/register"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
              >
                Essai gratuit 14 jours →
              </Link>
              <p className="text-xs text-gray-400 mt-3">Sans carte bancaire</p>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
