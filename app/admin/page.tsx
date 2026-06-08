'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface User {
  id: string
  name: string | null
  email: string
  plan: string | null
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

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL

const PLAN_LABELS: Record<string, { label: string; color: string; price: number }> = {
  solo: { label: 'Solo', color: 'bg-blue-100 text-blue-700', price: 19 },
  petit: { label: 'Petit proprio', color: 'bg-purple-100 text-purple-700', price: 39 },
  pro: { label: 'Pro', color: 'bg-green-100 text-green-700', price: 69 },
  starter: { label: 'Gratuit', color: 'bg-gray-100 text-gray-500', price: 0 },
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<{ users: User[]; messages: Message[]; planCounts: Record<string, number>; mrr: number } | null>(null)
  const [tab, setTab] = useState<'overview' | 'users' | 'messages'>('overview')
  const [loading, setLoading] = useState(true)

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(PLAN_LABELS).map(([key, info]) => (
              <div key={key} className="bg-gray-50 rounded-xl p-4 text-center">
                <div className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-2 ${info.color}`}>{info.label}</div>
                <div className="text-2xl font-black text-gray-900">{data.planCounts[key] || 0}</div>
                <div className="text-xs text-gray-400">{info.price > 0 ? `${info.price}€/mois` : 'Gratuit'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {[
            { key: 'users', label: `👥 Clients (${data.users.length})` },
            { key: 'messages', label: `📬 Messages (${unreadMessages} non lus)` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as 'users' | 'messages')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${tab === t.key ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* USERS */}
        {tab === 'users' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Client</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Plan</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Logements</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Inscrit le</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map(u => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <div className="font-medium text-gray-900 text-sm">{u.name || '—'}</div>
                      <div className="text-xs text-gray-400">{u.email}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${PLAN_LABELS[u.plan || 'starter']?.color || 'bg-gray-100 text-gray-500'}`}>
                        {PLAN_LABELS[u.plan || 'starter']?.label || u.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{u.properties.length} logement{u.properties.length > 1 ? 's' : ''}</td>
                    <td className="px-5 py-3 text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.users.length === 0 && (
              <div className="text-center py-10 text-gray-400">Aucun inscrit pour l'instant</div>
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
