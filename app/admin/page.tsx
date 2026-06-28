'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface User {
  id: string
  name: string | null
  email: string
  plan: string | null
  planExpiresAt: string | null
  createdAt: string
  properties: { id: string; name: string }[]
  stripeSubscriptionId: string | null
}

interface Message {
  id: string
  name: string
  email: string
  phone: string | null
  plan: string | null
  message: string
  read: boolean
  createdAt: string
}

const PLAN_LABELS: Record<string, { label: string; color: string; price: number }> = {
  starter: { label: 'Essai', color: 'bg-gray-100 text-gray-500', price: 0 },
  solo: { label: 'Solo', color: 'bg-blue-100 text-blue-700', price: 19 },
  petit: { label: 'Petit proprio', color: 'bg-purple-100 text-purple-700', price: 39 },
  pro: { label: 'Pro', color: 'bg-green-100 text-green-700', price: 69 },
  livret: { label: 'Livret QR', color: 'bg-emerald-100 text-emerald-700', price: 2.99 },
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<{ users: User[]; messages: Message[]; planCounts: Record<string, number>; mrr: number } | null>(null)
  const [tab, setTab] = useState<'users' | 'messages' | 'analytics'>('users')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editUser, setEditUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', plan: '', planExpiresAt: '' })
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status])

  useEffect(() => {
    if (status === 'authenticated') fetchData()
  }, [status])

  const fetchData = async () => {
    const res = await fetch('/api/admin/stats')
    if (res.status === 403) { router.push('/dashboard'); return }
    setData(await res.json())
    setLoading(false)
  }

  const openEdit = (u: User) => {
    setEditUser(u)
    setEditForm({
      name: u.name || '',
      email: u.email,
      plan: u.plan || 'starter',
      planExpiresAt: u.planExpiresAt ? new Date(u.planExpiresAt).toISOString().split('T')[0] : '',
    })
  }

  const handleSave = async () => {
    if (!editUser) return
    setSaving(true)
    await fetch('/api/admin/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: editUser.id,
        name: editForm.name,
        email: editForm.email,
        plan: editForm.plan,
        planExpiresAt: editForm.planExpiresAt || null,
      }),
    })
    setSaving(false)
    setEditUser(null)
    fetchData()
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    await fetch('/api/admin/user', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: confirmDelete.id }),
    })
    setDeleting(false)
    setConfirmDelete(null)
    fetchData()
  }

  const markRead = async (id: string) => {
    await fetch('/api/admin/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId: id }),
    })
    fetchData()
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) return null

  const filteredUsers = data.users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  )
  const unreadMessages = data.messages.filter(m => !m.read).length
  const payingUsers = data.users.filter(u => u.plan && u.plan !== 'starter').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div>
            <div className="font-bold text-gray-900">StayDirect Admin</div>
            <div className="text-xs text-gray-400">Tableau de bord fondateur</div>
          </div>
        </div>
        <a href="/dashboard" className="text-sm text-blue-600 hover:underline">→ Mon dashboard</a>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <KPI icon="👥" label="Inscrits total" value={data.users.length} color="blue" />
          <KPI icon="💳" label="Clients payants" value={payingUsers} color="green" />
          <KPI icon="💰" label="MRR estimé" value={`${data.mrr}€`} color="purple" />
          <KPI icon="📬" label="Messages non lus" value={unreadMessages} color="orange" />
        </div>

        {/* Répartition plans */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">Répartition des plans</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(PLAN_LABELS).map(([key, info]) => (
              <div key={key} className="bg-gray-50 rounded-xl px-5 py-3 text-center min-w-[100px]">
                <div className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-2 ${info.color}`}>{info.label}</div>
                <div className="text-2xl font-black text-gray-900">{data.planCounts[key] || 0}</div>
                <div className="text-xs text-gray-400">{info.price > 0 ? `${info.price}€/mois` : 'Gratuit'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {[
            { key: 'users', label: `👥 Clients (${data.users.length})` },
            { key: 'messages', label: `📬 Messages (${unreadMessages} non lus)` },
            { key: 'analytics', label: '📊 Analytics' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as 'users' | 'messages' | 'analytics')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${tab === t.key ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* USERS */}
        {tab === 'users' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Barre de recherche */}
            <div className="px-5 py-4 border-b border-gray-100">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher par nom ou email..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Client</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Plan</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Logements</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Inscrit le</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <div className="font-medium text-gray-900 text-sm">{u.name || '—'}</div>
                      <div className="text-xs text-gray-400">{u.email}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${PLAN_LABELS[u.plan || 'starter']?.color || 'bg-gray-100 text-gray-500'}`}>
                        {PLAN_LABELS[u.plan || 'starter']?.label || u.plan}
                      </span>
                      {u.planExpiresAt && (
                        <div className="text-xs text-orange-500 mt-0.5">
                          exp. {new Date(u.planExpiresAt).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{u.properties.length}</td>
                    <td className="px-5 py-3 text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="text-xs bg-blue-50 text-blue-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
                        >
                          ✏️ Modifier
                        </button>
                        <button
                          onClick={() => setConfirmDelete(u)}
                          className="text-xs bg-red-50 text-red-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-red-100 transition"
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-10 text-gray-400">Aucun client trouvé</div>
            )}
          </div>
        )}

        {/* MESSAGES */}
        {tab === 'messages' && (
          <div className="space-y-3">
            {data.messages.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
                Aucun message reçu pour l'instant
              </div>
            )}
            {data.messages.map(m => (
              <div key={m.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${!m.read ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-bold text-gray-900">{m.name}</span>
                      {!m.read && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">Nouveau</span>}
                      {m.plan && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${PLAN_LABELS[m.plan]?.color || 'bg-gray-100 text-gray-500'}`}>
                          {PLAN_LABELS[m.plan]?.label || m.plan}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm mb-3">
                      <a href={`mailto:${m.email}`} className="text-blue-600 hover:underline">{m.email}</a>
                      {m.phone && <a href={`tel:${m.phone}`} className="text-gray-600">{m.phone}</a>}
                    </div>
                    <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                      {m.message}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <a href={`mailto:${m.email}?subject=Re: Votre demande StayDirect`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition text-center">
                      ↩️ Répondre
                    </a>
                    {!m.read && (
                      <button onClick={() => markRead(m.id)}
                        className="border border-gray-200 text-gray-500 px-4 py-2 rounded-xl text-xs font-medium hover:bg-gray-50 transition">
                        ✓ Marquer lu
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ANALYTICS */}
        {tab === 'analytics' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">📊 Google Analytics</h3>
                <p className="text-sm text-gray-400 mt-0.5">Statistiques de visite de staydirect.fr</p>
              </div>
              <a
                href="https://analytics.google.com/analytics/web/#/p481234567/reports/intelligenthome"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition"
              >
                Ouvrir Google Analytics →
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-xs font-semibold text-blue-500 uppercase mb-1">Visiteurs</div>
                <div className="text-2xl font-black text-blue-700">—</div>
                <div className="text-xs text-blue-400 mt-0.5">Voir dans Google Analytics</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="text-xs font-semibold text-green-500 uppercase mb-1">Sessions</div>
                <div className="text-2xl font-black text-green-700">—</div>
                <div className="text-xs text-green-400 mt-0.5">Voir dans Google Analytics</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <div className="text-xs font-semibold text-purple-500 uppercase mb-1">Pages vues</div>
                <div className="text-2xl font-black text-purple-700">—</div>
                <div className="text-xs text-purple-400 mt-0.5">Voir dans Google Analytics</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 text-center">
              <p className="text-gray-500 text-sm mb-3">Les statistiques détaillées sont disponibles directement dans Google Analytics.</p>
              <a
                href="https://analytics.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.25 17.292l-4.5-4.364 1.857-1.858 2.643 2.506 5.643-5.784 1.857 1.857-7.5 7.643z" fill="#4285F4"/></svg>
                Ouvrir analytics.google.com
              </a>
              <p className="text-xs text-gray-400 mt-3">ID de suivi : G-VYCQZQNLPV · Actif sur staydirect.fr</p>
            </div>
          </div>
        )}

      {/* Modal Modifier */}
      {editUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">✏️ Modifier le client</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Nom</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Plan</label>
                <select
                  value={editForm.plan}
                  onChange={e => setEditForm(f => ({ ...f, plan: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="starter">Essai gratuit</option>
                  <option value="solo">Solo — 19€/mois</option>
                  <option value="petit">Petit proprio — 39€/mois</option>
                  <option value="pro">Pro — 69€/mois</option>
                  <option value="livret">Livret QR — 2.99€/mois</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Expiration du plan <span className="text-gray-400 font-normal">(laisser vide = sans expiration)</span>
                </label>
                <input
                  type="date"
                  value={editForm.planExpiresAt}
                  onChange={e => setEditForm(f => ({ ...f, planExpiresAt: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditUser(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm"
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmer suppression */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Supprimer ce client ?</h2>
            <p className="text-sm text-gray-500 mb-1"><strong>{confirmDelete.name || confirmDelete.email}</strong></p>
            <p className="text-xs text-red-500 mb-6">Tous ses logements, réservations et livrets seront supprimés définitivement.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50 text-sm"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function KPI({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-100',
    green: 'bg-green-50 border-green-100',
    purple: 'bg-purple-50 border-purple-100',
    orange: 'bg-orange-50 border-orange-100',
  }
  const textColors: Record<string, string> = {
    blue: 'text-blue-700', green: 'text-green-700', purple: 'text-purple-700', orange: 'text-orange-700',
  }
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className={`text-2xl font-black ${textColors[color]}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  )
}
