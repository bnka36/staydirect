'use client'
import { useState } from 'react'

interface Props {
  currentPlan: string
  onActivated?: (plan: string) => void
}

const PLAN_LABELS: Record<string, string> = {
  solo: 'Solo',
  petit: 'Petit propriétaire',
  pro: 'Pro / Agence',
  starter: 'Starter',
}

export default function PromoActivate({ currentPlan, onActivated }: Props) {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<{ type?: string; planLabel?: string; discountPercent?: number; message?: string } | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const handleActivate = async () => {
    if (!code.trim()) return
    setStatus('loading')
    setErrorMsg('')
    setResult(null)

    const res = await fetch('/api/promo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim() }),
    })
    const data = await res.json()

    if (res.ok) {
      setStatus('success')
      setResult(data)
      if (data.type === 'free_plan') {
        onActivated?.(data.plan)
        setTimeout(() => window.location.reload(), 1800)
      }
    } else {
      setStatus('error')
      setErrorMsg(data.error || 'Erreur inconnue')
    }
  }

  if (status === 'success' && result?.type === 'free_plan') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
        <div className="text-3xl mb-2">🎉</div>
        <div className="font-bold text-green-800 text-lg">Plan {result.planLabel} activé !</div>
        <div className="text-green-600 text-sm mt-1">Rechargement en cours...</div>
      </div>
    )
  }

  if (status === 'success' && result?.type === 'discount') {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-3xl">🏷️</div>
          <div>
            <div className="font-bold text-purple-900 text-lg">Code -{result.discountPercent}% validé !</div>
            <div className="text-purple-600 text-sm">Ce code sera appliqué automatiquement quand tu choisis un abonnement</div>
          </div>
        </div>
        <div className="bg-white border border-purple-100 rounded-xl px-4 py-3 mt-3 flex items-center gap-3">
          <span className="font-mono font-bold text-purple-700 tracking-wider">{code.toUpperCase()}</span>
          <span className="text-xs text-gray-400">→</span>
          <span className="text-sm font-semibold text-green-700">-{result.discountPercent}% sur ton 1er mois</span>
        </div>
        <a
          href="/pricing"
          className="mt-3 block text-center bg-purple-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-purple-700 transition"
        >
          Choisir un abonnement →
        </a>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-xl">🎟️</div>
        <div>
          <div className="font-bold text-gray-900">Code promo</div>
          <div className="text-xs text-gray-500">Plan gratuit ou réduction sur l'abonnement</div>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleActivate()}
          placeholder="Ex: BETA2024 ou PROMO20"
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
        />
        <button
          onClick={handleActivate}
          disabled={status === 'loading' || !code.trim()}
          className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-purple-700 transition disabled:opacity-50"
        >
          {status === 'loading' ? '...' : 'Activer'}
        </button>
      </div>

      {errorMsg && (
        <div className="text-sm font-medium px-3 py-2 rounded-xl bg-red-50 text-red-600">
          ❌ {errorMsg}
        </div>
      )}
    </div>
  )
}
