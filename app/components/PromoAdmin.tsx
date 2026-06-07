'use client'
import { useState, useEffect } from 'react'

interface PromoCode {
  id: string
  code: string
  type: string
  plan: string | null
  discountPercent: number | null
  maxUses: number
  uses: number
  expiresAt: string | null
  note: string | null
  createdAt: string
  redemptions: { user: { name: string; email: string } }[]
}

const PLAN_LABELS: Record<string, string> = {
  solo: 'Solo — 19€/mois',
  petit: 'Petit proprio — 39€/mois',
  pro: 'Pro / Agence — 69€/mois',
}

function generateCode() {
  const words = ['BETA', 'VIP', 'FREE', 'PROMO', 'STAY', 'EARLY', 'AMI', 'TEST', 'DIRECT']
  const word = words[Math.floor(Math.random() * words.length)]
  const num = Math.floor(Math.random() * 900) + 100
  return `${word}${num}`
}

export default function PromoAdmin() {
  const [codes, setCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    code: generateCode(),
    type: 'free_plan',
    plan: 'solo',
    discountPercent: 20,
    maxUses: 1,
    note: '',
    expiresAt: '',
  })
  const [creating, setCreating] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { fetchCodes() }, [])

  const fetchCodes = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/promo')
    if (res.ok) setCodes(await res.json())
    setLoading(false)
  }

  const handleCreate = async () => {
    if (!form.code) return
    setCreating(true)
    setError('')
    const res = await fetch('/api/admin/promo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      setSuccess(`Code "${form.code}" créé !`)
      setForm(f => ({ ...f, code: generateCode() }))
      await fetchCodes()
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(data.error || 'Erreur')
    }
    setCreating(false)
  }

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Supprimer le code "${code}" ?`)) return
    await fetch('/api/admin/promo', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await fetchCodes()
  }

  const copyCode = (code: string) => navigator.clipboard.writeText(code)

  const freeCodes = codes.filter(c => c.type === 'free_plan')
  const discountCodes = codes.filter(c => c.type === 'discount')

  return (
    <div className="space-y-6">
      {/* Créer un code */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
          <span className="text-2xl">🎟️</span> Créer un code promo
        </h3>

        {/* Type de code */}
        <div className="flex gap-3 mb-5">
          <button
            onClick={() => setForm(f => ({ ...f, type: 'free_plan' }))}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold border-2 transition flex flex-col items-center gap-1 ${form.type === 'free_plan' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
          >
            <span className="text-xl">🎁</span>
            <span>Plan gratuit</span>
            <span className="text-xs font-normal opacity-70">Accès complet offert</span>
          </button>
          <button
            onClick={() => setForm(f => ({ ...f, type: 'discount' }))}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold border-2 transition flex flex-col items-center gap-1 ${form.type === 'discount' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
          >
            <span className="text-xl">🏷️</span>
            <span>Réduction %</span>
            <span className="text-xs font-normal opacity-70">-X% sur l'abonnement</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Code */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono font-bold tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setForm(f => ({ ...f, code: generateCode() }))}
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition"
                title="Code aléatoire"
              >🔀</button>
            </div>
          </div>

          {/* Selon le type */}
          {form.type === 'free_plan' ? (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Plan offert</label>
              <select
                value={form.plan}
                onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(PLAN_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Réduction (%)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.discountPercent}
                  onChange={e => setForm(f => ({ ...f, discountPercent: parseInt(e.target.value) }))}
                  className="w-24 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex gap-1 flex-wrap">
                  {[10, 20, 30, 50].map(p => (
                    <button
                      key={p}
                      onClick={() => setForm(f => ({ ...f, discountPercent: p }))}
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-bold transition ${form.discountPercent === p ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
                    >
                      -{p}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Utilisations max</label>
            <input
              type="number"
              min="1"
              max="1000"
              value={form.maxUses}
              onChange={e => setForm(f => ({ ...f, maxUses: parseInt(e.target.value) }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Expire le (optionnel)</label>
            <input
              type="date"
              value={form.expiresAt}
              onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Note (pour toi)</label>
            <input
              type="text"
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="Ex: Ami Jean-Pierre, campagne Facebook, bêta-testeur..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Aperçu du code */}
        <div className={`mt-4 rounded-xl p-3 flex items-center gap-3 ${form.type === 'free_plan' ? 'bg-blue-50 border border-blue-100' : 'bg-purple-50 border border-purple-100'}`}>
          <span className="text-lg">{form.type === 'free_plan' ? '🎁' : '🏷️'}</span>
          <div className="text-sm">
            <span className="font-mono font-bold">{form.code || 'MON-CODE'}</span>
            <span className="text-gray-400 mx-2">→</span>
            {form.type === 'free_plan'
              ? <span className="font-semibold text-blue-700">Plan {PLAN_LABELS[form.plan] || form.plan} offert</span>
              : <span className="font-semibold text-purple-700">-{form.discountPercent}% sur l'abonnement</span>
            }
            {form.maxUses > 1 && <span className="text-gray-400 text-xs ml-2">({form.maxUses} utilisations)</span>}
          </div>
        </div>

        {success && <div className="mt-3 bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-2.5 rounded-xl">✅ {success}</div>}
        {error && <div className="mt-3 bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-2.5 rounded-xl">❌ {error}</div>}

        <button
          onClick={handleCreate}
          disabled={creating || !form.code}
          className={`mt-4 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition disabled:opacity-50 ${form.type === 'free_plan' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}`}
        >
          {creating ? 'Création...' : '✨ Créer ce code'}
        </button>
      </div>

      {/* Liste codes gratuits */}
      <CodeList title="🎁 Plans gratuits" codes={freeCodes} loading={loading} onDelete={handleDelete} onCopy={copyCode} />

      {/* Liste codes réduction */}
      <CodeList title="🏷️ Codes réduction" codes={discountCodes} loading={loading} onDelete={handleDelete} onCopy={copyCode} />
    </div>
  )
}

function CodeList({ title, codes, loading, onDelete, onCopy }: {
  title: string
  codes: PromoCode[]
  loading: boolean
  onDelete: (id: string, code: string) => void
  onCopy: (code: string) => void
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-gray-900 text-lg mb-5">{title}</h3>

      {loading ? (
        <div className="text-center py-6 text-gray-400">Chargement...</div>
      ) : codes.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-sm">Aucun code de ce type</div>
      ) : (
        <div className="space-y-3">
          {codes.map(c => (
            <div key={c.id} className={`border rounded-xl p-4 flex items-center justify-between gap-4 ${c.uses >= c.maxUses ? 'opacity-50 bg-gray-50' : 'bg-white'}`}>
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div
                  className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-sm cursor-pointer hover:bg-blue-100 transition shrink-0"
                  onClick={() => onCopy(c.code)}
                  title="Cliquer pour copier"
                >
                  {c.code}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {c.type === 'free_plan' ? (
                      <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {c.plan ? (c.plan === 'solo' ? 'Solo' : c.plan === 'petit' ? 'Petit proprio' : 'Pro') : '?'}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                        -{c.discountPercent}%
                      </span>
                    )}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.uses >= c.maxUses ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                      {c.uses}/{c.maxUses} util.
                    </span>
                    {c.expiresAt && (
                      <span className="text-xs text-gray-400">
                        Exp: {new Date(c.expiresAt).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                  {c.note && <div className="text-xs text-gray-400 mt-0.5 truncate">{c.note}</div>}
                  {c.redemptions.length > 0 && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      👤 {c.redemptions.map(r => r.user.name || r.user.email).join(', ')}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => onCopy(c.code)} className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition" title="Copier">📋</button>
                <button onClick={() => onDelete(c.id, c.code)} className="text-xs px-3 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
