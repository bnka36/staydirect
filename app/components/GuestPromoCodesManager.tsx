'use client'
import { useState, useEffect } from 'react'

interface PromoCode {
  id: string
  code: string
  propertyId: string | null
  discountPercent: number | null
  discountAmount: number | null
  maxUses: number | null
  uses: number
  expiresAt: string | null
  isActive: boolean
  property: { name: string } | null
}

interface Property {
  id: string
  name: string
}

const lbl = 'block text-xs font-semibold text-gray-500 mb-1.5'
const inp = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

export default function GuestPromoCodesManager({ properties }: { properties: Property[] }) {
  const [codes, setCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ code: '', propertyId: '', discountPercent: '', discountAmount: '', maxUses: '', expiresAt: '' })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [actionError, setActionError] = useState('')

  const fetchCodes = async () => {
    setLoading(true)
    const res = await fetch('/api/promo-codes')
    setCodes(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchCodes() }, [])

  const handleCreate = async () => {
    if (!form.code || (!form.discountPercent && !form.discountAmount)) return
    setCreating(true)
    setCreateError('')
    const res = await fetch('/api/promo-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setForm({ code: '', propertyId: '', discountPercent: '', discountAmount: '', maxUses: '', expiresAt: '' })
      setShowForm(false)
      await fetchCodes()
    } else {
      const data = await res.json().catch(() => ({}))
      setCreateError(data.error || 'Erreur lors de la création')
    }
    setCreating(false)
  }

  const toggleActive = async (c: PromoCode) => {
    setActionError('')
    const res = await fetch(`/api/promo-codes/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !c.isActive }),
    })
    if (!res.ok) { setActionError('Erreur lors de la mise à jour'); return }
    await fetchCodes()
  }

  const deleteCode = async (id: string) => {
    if (!confirm('Supprimer ce code promo ?')) return
    setActionError('')
    const res = await fetch(`/api/promo-codes/${id}`, { method: 'DELETE' })
    if (!res.ok) { setActionError('Erreur lors de la suppression'); return }
    await fetchCodes()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-gray-900">🎟️ Codes promo voyageurs</h3>
        <button onClick={() => setShowForm(s => !s)}
          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 transition">
          {showForm ? '✕ Fermer' : '+ Créer un code'}
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-4">Codes de réduction pour vos voyageurs, à saisir lors de la réservation.</p>

      {showForm && (
        <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Code *</label>
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="ETE2026" className={inp} />
            </div>
            <div>
              <label className={lbl}>Logement (optionnel)</label>
              <select value={form.propertyId} onChange={e => setForm(f => ({ ...f, propertyId: e.target.value }))} className={inp}>
                <option value="">Tous les logements</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Remise en %</label>
              <input type="number" min="1" max="100" value={form.discountPercent}
                onChange={e => setForm(f => ({ ...f, discountPercent: e.target.value, discountAmount: '' }))}
                placeholder="10" className={inp} />
            </div>
            <div>
              <label className={lbl}>Ou remise fixe (€)</label>
              <input type="number" min="1" step="0.01" value={form.discountAmount}
                onChange={e => setForm(f => ({ ...f, discountAmount: e.target.value, discountPercent: '' }))}
                placeholder="50" className={inp} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Nombre d&apos;utilisations max (optionnel)</label>
              <input type="number" min="1" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                placeholder="Illimité" className={inp} />
            </div>
            <div>
              <label className={lbl}>Expire le (optionnel)</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} className={inp} />
            </div>
          </div>
          {createError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">❌ {createError}</div>}
          <button onClick={handleCreate} disabled={creating || !form.code || (!form.discountPercent && !form.discountAmount)}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50">
            {creating ? '...' : '✓ Créer le code'}
          </button>
        </div>
      )}

      {actionError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg mb-3">❌ {actionError}</div>}

      {loading ? (
        <div className="py-6 text-center text-gray-400 text-sm">Chargement...</div>
      ) : codes.length === 0 ? (
        <div className="py-6 text-center text-gray-400 text-sm">Aucun code promo créé</div>
      ) : (
        <div className="divide-y divide-gray-50">
          {codes.map(c => (
            <div key={c.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-900 text-sm">{c.code}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {c.discountPercent ? `-${c.discountPercent}%` : `-${c.discountAmount}€`}
                  {' · '}{c.property?.name || 'Tous les logements'}
                  {' · '}{c.uses} utilisation{c.uses > 1 ? 's' : ''}{c.maxUses ? ` / ${c.maxUses}` : ''}
                  {c.expiresAt && ` · expire le ${new Date(c.expiresAt).toLocaleDateString('fr-FR')}`}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleActive(c)}
                  className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition">
                  {c.isActive ? 'Désactiver' : 'Activer'}
                </button>
                <button onClick={() => deleteCode(c.id)}
                  className="text-xs px-2.5 py-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg font-medium transition">
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
