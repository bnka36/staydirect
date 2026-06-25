'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function QRCodePage() {
  const [url, setUrl] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!url.startsWith('http')) {
      setError('Entrez une URL valide (commençant par https://)')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/qrcode/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, email }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setError('Erreur lors de la création du paiement')
    } catch {
      setError('Erreur réseau, réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navbar */}
      <nav className="bg-white/95 border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="font-bold text-xl text-gray-900">StayDirect</span>
          </Link>
          <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition text-sm">
            Essai gratuit
          </Link>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-16">
        {/* Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold border border-green-100 mb-6">
            ⚡ Livré par email en 30 secondes
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Votre QR Code<br />
            <span className="text-blue-600">pour seulement 2,99€</span>
          </h1>
          <p className="text-gray-500 text-lg">
            Dirigez vos clients vers votre page de réservation, votre site ou n'importe quelle URL.
          </p>
        </div>

        {/* Avantages */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: '📲', text: 'Scannable instantanément' },
            { icon: '🎨', text: 'Couleurs pro' },
            { icon: '📧', text: 'Reçu par email' },
          ].map((item) => (
            <div key={item.text} className="bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-xs text-gray-600 font-medium">{item.text}</div>
            </div>
          ))}
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL de destination *
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://votre-site.com/reservation"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">L'URL vers laquelle le QR code redirigera</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Votre email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">Le QR code vous sera envoyé ici</p>
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-100 disabled:opacity-60"
            >
              {loading ? 'Redirection...' : 'Payer 2,99€ et recevoir mon QR Code →'}
            </button>

            <p className="text-center text-xs text-gray-400">
              Paiement sécurisé par Stripe · Sans abonnement
            </p>
          </form>
        </div>

        {/* Upsell discret */}
        <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-100 text-center">
          <p className="text-sm font-semibold text-blue-900 mb-1">Vous gérez des locations ?</p>
          <p className="text-sm text-blue-700 mb-4">
            Créez votre site de réservation directe et encaissez sans commission.
          </p>
          <Link href="/register" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-xl font-medium text-sm hover:bg-blue-700 transition">
            Essai gratuit 14 jours →
          </Link>
        </div>
      </div>
    </main>
  )
}
