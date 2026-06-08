'use client'
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

interface Props {
  depositId: string
  amount: number
  guestName: string
  ownerName: string
  propertyName?: string | null
  checkIn: string | null
  checkOut: string | null
  clientSecret: string
  stripePublicKey: string
}

function PaymentForm({ depositId, amount, clientSecret }: { depositId: string; amount: number; clientSecret: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setStatus('loading')
    setErrorMsg('')

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) return

    // Confirmer la préautorisation
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    })

    if (error) {
      setStatus('error')
      setErrorMsg(error.message || 'Erreur de paiement')
      return
    }

    if (paymentIntent?.status === 'requires_capture') {
      // Notifier notre API
      await fetch('/api/deposits/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId }),
      })
      setStatus('success')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-6">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Dépôt validé !</h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          Votre dépôt de garantie de <strong>{amount}€</strong> a bien été pré-autorisé.<br />
          <strong>Votre carte n'a pas été débitée.</strong><br />
          Le montant sera libéré après votre séjour.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-2">Coordonnées bancaires</label>
        <div className="border border-gray-200 rounded-xl px-4 py-3.5 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition">
          <CardElement options={{
            style: {
              base: { fontSize: '15px', color: '#1e293b', fontFamily: 'system-ui, sans-serif', '::placeholder': { color: '#94a3b8' } },
              invalid: { color: '#ef4444' },
            },
            hidePostalCode: true,
          }} />
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          ❌ {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || status === 'loading'}
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-base hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {status === 'loading' ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Validation en cours...
          </>
        ) : (
          <>🔒 Valider le dépôt de {amount}€</>
        )}
      </button>

      <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
        <span>🔐 Chiffré SSL</span>
        <span>·</span>
        <span>💳 Stripe sécurisé</span>
        <span>·</span>
        <span>0€ débité maintenant</span>
      </div>
    </form>
  )
}

export default function CautionPayment({ depositId, amount, guestName, ownerName, propertyName, checkIn, checkOut, clientSecret, stripePublicKey }: Props) {
  const stripePromise = loadStripe(stripePublicKey)
  const fmt = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Info caution */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white">
        <div className="text-center">
          <div className="text-5xl font-black mb-1">{amount}€</div>
          <div className="text-blue-200 text-sm">Dépôt de garantie</div>
        </div>
        <div className="mt-5 space-y-2">
          {propertyName && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-blue-300">🏠</span>
              <span className="text-blue-100">{propertyName}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-blue-300">👤</span>
            <span className="text-blue-100">Hôte : {ownerName}</span>
          </div>
          {checkIn && checkOut && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-blue-300">📅</span>
              <span className="text-blue-100">{fmt(checkIn)} → {fmt(checkOut)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Explication */}
      <div className="bg-amber-50 border-b border-amber-100 px-5 py-3">
        <p className="text-xs text-amber-700 font-medium text-center">
          ⚠️ Votre carte sera <strong>bloquée mais non débitée</strong>. Le montant est libéré après votre séjour.
        </p>
      </div>

      {/* Formulaire */}
      <div className="p-6">
        <p className="text-sm text-gray-500 mb-5">
          Bonjour <strong>{guestName}</strong>, votre hôte vous demande de pré-autoriser un dépôt de garantie pour sécuriser votre séjour.
        </p>

        <Elements stripe={stripePromise}>
          <PaymentForm depositId={depositId} amount={amount} clientSecret={clientSecret} />
        </Elements>
      </div>
    </div>
  )
}
