'use client'
import { useState, useEffect } from 'react'

interface Deposit {
  id: string
  guestName: string
  guestEmail: string
  guestPhone: string | null
  amount: number
  status: string
  checkIn: string | null
  checkOut: string | null
  note: string | null
  expiresAt: string | null
  capturedAt: string | null
  releasedAt: string | null
  createdAt: string
  property: { name: string } | null
}

interface Property {
  id: string
  name: string
  city: string
}

const STATUS: Record<string, { label: string; color: string; icon: string }> = {
  pending:    { label: 'En attente',  color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
  authorized: { label: 'Autorisé',   color: 'bg-blue-100 text-blue-700',    icon: '🔒' },
  captured:   { label: 'Encaissé',   color: 'bg-green-100 text-green-700',  icon: '✅' },
  released:   { label: 'Libéré',     color: 'bg-gray-100 text-gray-500',    icon: '🔓' },
  expired:    { label: 'Expiré',     color: 'bg-red-100 text-red-600',      icon: '❌' },
  cancelled:  { label: 'Annulé',     color: 'bg-gray-100 text-gray-400',    icon: '✕'  },
}

export default function DepositsManager({ properties }: { properties: Property[] }) {
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ guestName: '', guestEmail: '', guestPhone: '', amount: '', propertyId: '', checkIn: '', checkOut: '', note: '' })
  const [creating, setCreating] = useState(false)
  const [createdLink, setCreatedLink] = useState('')
  const [createError, setCreateError] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [captureModal, setCaptureModal] = useState<Deposit | null>(null)
  const [captureAmount, setCaptureAmount] = useState('')

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://staydirect.fr'

  useEffect(() => { fetchDeposits() }, [])

  const fetchDeposits = async () => {
    setLoading(true)
    const res = await fetch('/api/deposits')
    setDeposits(await res.json())
    setLoading(false)
  }

  const handleCreate = async () => {
    if (!form.guestName || !form.guestEmail || !form.amount) return
    setCreating(true)
    setCreateError('')
    const res = await fetch('/api/deposits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    })
    const data = await res.json()
    if (res.ok) {
      setCreatedLink(`${appUrl}/caution/${data.id}`)
      setForm({ guestName: '', guestEmail: '', guestPhone: '', amount: '', propertyId: '', checkIn: '', checkOut: '', note: '' })
      await fetchDeposits()
    } else {
      setCreateError(data.error || 'Erreur lors de la création de la caution')
    }
    setCreating(false)
  }

  const handleAction = async (deposit: Deposit, action: 'capture' | 'release', amount?: number) => {
    setActionLoading(deposit.id + action)
    await fetch(`/api/deposits/${deposit.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, captureAmount: amount }),
    })
    await fetchDeposits()
    setActionLoading(null)
    setCaptureModal(null)
  }

  const copyLink = (link: string) => navigator.clipboard.writeText(link)
  const fmt = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

  const stats = {
    total: deposits.length,
    authorized: deposits.filter(d => d.status === 'authorized').length,
    captured: deposits.filter(d => d.status === 'captured').length,
    totalAuthorized: deposits.filter(d => d.status === 'authorized').reduce((s, d) => s + d.amount, 0),
  }

  return (
    <div className="space-y-5">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
          <div className="text-2xl font-black text-blue-700">{stats.authorized}</div>
          <div className="text-xs text-gray-500 mt-1">🔒 Cautions actives</div>
          <div className="text-sm font-bold text-blue-600 mt-0.5">{stats.totalAuthorized}€ bloqués</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
          <div className="text-2xl font-black text-green-700">{stats.captured}</div>
          <div className="text-xs text-gray-500 mt-1">✅ Encaissées</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
          <div className="text-2xl font-black text-gray-700">{stats.total}</div>
          <div className="text-xs text-gray-500 mt-1">📋 Total</div>
        </div>
      </div>

      {/* Bouton créer */}
      <button
        onClick={() => { setShowForm(!showForm); setCreatedLink('') }}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
      >
        {showForm ? '✕ Fermer' : '+ Nouvelle demande de caution'}
      </button>

      {/* Formulaire création */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-gray-900 text-lg">🔒 Nouvelle caution bancaire</h3>

          {createdLink ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-3">
              <div className="font-bold text-green-800">✅ Demande créée ! Email envoyé au voyageur.</div>
              <div className="text-sm text-green-700">Vous pouvez aussi lui envoyer ce lien manuellement :</div>
              <div className="flex gap-2">
                <div className="flex-1 bg-white border border-green-200 rounded-xl px-3 py-2 text-xs font-mono text-green-700 truncate">{createdLink}</div>
                <button onClick={() => copyLink(createdLink)} className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-700 transition">📋 Copier</button>
              </div>
              <button onClick={() => { setCreatedLink(''); setShowForm(false) }} className="text-sm text-green-600 hover:underline">Créer une autre demande →</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Nom du voyageur *</label>
                  <input value={form.guestName} onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))} placeholder="Jean Dupont" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Email voyageur *</label>
                  <input type="email" value={form.guestEmail} onChange={e => setForm(f => ({ ...f, guestEmail: e.target.value }))} placeholder="jean@email.com" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Téléphone</label>
                  <input value={form.guestPhone} onChange={e => setForm(f => ({ ...f, guestPhone: e.target.value }))} placeholder="+33 6..." className={inp} />
                </div>
                <div>
                  <label className={lbl}>Montant caution (€) *</label>
                  <input type="number" min="1" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="300" className={inp} />
                </div>
                {properties.length > 0 && (
                  <div>
                    <label className={lbl}>Logement (optionnel)</label>
                    <select value={form.propertyId} onChange={e => setForm(f => ({ ...f, propertyId: e.target.value }))} className={inp}>
                      <option value="">Aucun</option>
                      {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className={lbl}>Check-in</label>
                  <input type="date" value={form.checkIn} onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Check-out</label>
                  <input type="date" value={form.checkOut} onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))} className={inp} />
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Note (pour vous)</label>
                  <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Ex: Appartement Paris 11ème" className={inp} />
                </div>
              </div>
              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">❌ {createError}</div>
              )}
              <button onClick={handleCreate} disabled={creating || !form.guestName || !form.guestEmail || !form.amount}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50">
                {creating ? '⏳ Création...' : '🔒 Créer & envoyer par email'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Liste des cautions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Toutes les cautions</h3>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-400">Chargement...</div>
        ) : deposits.length === 0 ? (
          <div className="py-10 text-center text-gray-400">
            <div className="text-3xl mb-2">🔒</div>
            <div className="text-sm">Aucune caution créée pour l'instant</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {deposits.map(d => {
              const st = STATUS[d.status] || STATUS.pending
              const cautionUrl = `${appUrl}/caution/${d.id}`
              return (
                <div key={d.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <span className="font-bold text-gray-900">{d.guestName}</span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${st.color}`}>{st.icon} {st.label}</span>
                        <span className="text-lg font-black text-gray-900">{d.amount}€</span>
                      </div>
                      <div className="text-xs text-gray-400 space-y-0.5">
                        <div>{d.guestEmail}{d.guestPhone && ` · ${d.guestPhone}`}</div>
                        {d.property && <div>🏠 {d.property.name}</div>}
                        {d.checkIn && d.checkOut && <div>📅 {fmt(d.checkIn)} → {fmt(d.checkOut)}</div>}
                        {d.note && <div>📝 {d.note}</div>}
                        {d.status === 'pending' && d.expiresAt && (
                          <div className="text-orange-500">⏰ Expire le {fmt(d.expiresAt)}</div>
                        )}
                        {d.capturedAt && <div className="text-green-600">✅ Encaissé le {fmt(d.capturedAt)}</div>}
                        {d.releasedAt && <div className="text-gray-500">🔓 Libéré le {fmt(d.releasedAt)}</div>}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      {/* Actions selon statut */}
                      {d.status === 'pending' && (
                        <button onClick={() => copyLink(cautionUrl)}
                          className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-semibold hover:bg-blue-100 transition">
                          📋 Copier lien
                        </button>
                      )}
                      {d.status === 'authorized' && (
                        <>
                          <button
                            onClick={() => { setCaptureModal(d); setCaptureAmount(String(d.amount)) }}
                            className="text-xs px-3 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition"
                          >
                            ⚠️ Encaisser
                          </button>
                          <button
                            onClick={() => handleAction(d, 'release')}
                            disabled={actionLoading === d.id + 'release'}
                            className="text-xs px-3 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
                          >
                            {actionLoading === d.id + 'release' ? '...' : '✅ Libérer'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal capture */}
      {captureModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">⚠️ Encaisser la caution</h3>
            <p className="text-sm text-gray-500 mb-4">
              Vous allez débiter <strong>{captureModal.guestName}</strong>. Cette action est irréversible.
            </p>
            <div className="mb-4">
              <label className={lbl}>Montant à encaisser (max {captureModal.amount}€)</label>
              <input type="number" min="1" max={captureModal.amount} value={captureAmount}
                onChange={e => setCaptureAmount(e.target.value)} className={inp} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCaptureModal(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50 transition">
                Annuler
              </button>
              <button
                onClick={() => handleAction(captureModal, 'capture', parseFloat(captureAmount))}
                disabled={!!actionLoading}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-red-700 transition disabled:opacity-50"
              >
                {actionLoading ? '...' : `Encaisser ${captureAmount}€`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const lbl = 'block text-xs font-semibold text-gray-500 mb-1.5'
const inp = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
