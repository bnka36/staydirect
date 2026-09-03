'use client'
import { useState } from 'react'
import { RoomUnit } from './RoomUnitsManager'

export interface PlanningReservation {
  id: string
  guestName: string
  guestEmail: string
  guestPhone?: string | null
  checkIn: string
  checkOut: string
  nights: number
  totalPrice: number
  status: string
  source?: string
  roomUnitId?: string | null
}

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

const SOURCE_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  airbnb:   { bg: '#fff1f2', border: '#fb7185', text: '#be123c', dot: '#f43f5e' },
  booking:  { bg: '#eff6ff', border: '#60a5fa', text: '#1d4ed8', dot: '#3b82f6' },
  abritel:  { bg: '#f5f3ff', border: '#a78bfa', text: '#6d28d9', dot: '#8b5cf6' },
  direct:   { bg: '#f0fdf4', border: '#4ade80', text: '#166534', dot: '#22c55e' },
  ical:     { bg: '#fef9c3', border: '#fbbf24', text: '#92400e', dot: '#f59e0b' },
  manual:   { bg: '#f1f5f9', border: '#94a3b8', text: '#475569', dot: '#64748b' },
}
const DEFAULT_COLOR = { bg: '#dbeafe', border: '#60a5fa', text: '#1e40af', dot: '#2563eb' }
function getSourceColor(source?: string) {
  if (!source) return DEFAULT_COLOR
  const key = source.toLowerCase()
  for (const k of Object.keys(SOURCE_COLORS)) if (key.includes(k)) return SOURCE_COLORS[k]
  return DEFAULT_COLOR
}

type Segment =
  | { type: 'resv'; resv: PlanningReservation; span: number }
  | { type: 'available'; span: number }

const lbl = 'block text-xs font-semibold text-gray-500 mb-1'
const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

export default function RoomPlanningGrid({ propertyId, roomUnits, reservations, basePrice, onChanged }: {
  propertyId: string
  roomUnits: RoomUnit[]
  reservations: PlanningReservation[]
  basePrice: number
  onChanged: () => void
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [monthOffset, setMonthOffset] = useState(0)
  const [createCell, setCreateCell] = useState<{ roomUnitId: string; date: string } | null>(null)
  const [editResv, setEditResv] = useState<PlanningReservation | null>(null)

  const monthDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  function dateStr(d: number) { return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` }
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const activeRooms = roomUnits.filter(r => r.isActive)
  const confirmedResvs = reservations.filter(r => r.status === 'confirmed')
  const unassigned = confirmedResvs.filter(r => !r.roomUnitId)

  function buildSegments(roomId: string): Segment[] {
    const roomResvs = confirmedResvs.filter(r => r.roomUnitId === roomId)
    const segments: Segment[] = []
    let idx = 0
    while (idx < days.length) {
      const ds = dateStr(days[idx])
      const dayDate = new Date(ds + 'T00:00:00')
      const resv = roomResvs.find(r => {
        const ci = new Date(r.checkIn); ci.setHours(0, 0, 0, 0)
        const co = new Date(r.checkOut); co.setHours(0, 0, 0, 0)
        return dayDate >= ci && dayDate < co
      })
      if (resv) {
        const co = new Date(resv.checkOut); co.setHours(0, 0, 0, 0)
        let span = 0, i = idx
        while (i < days.length) {
          const d = new Date(dateStr(days[i]) + 'T00:00:00')
          if (d >= co) break
          span++; i++
        }
        segments.push({ type: 'resv', resv, span: Math.max(span, 1) })
        idx += Math.max(span, 1)
        continue
      }
      let span = 0, i = idx
      while (i < days.length) {
        const d = new Date(dateStr(days[i]) + 'T00:00:00')
        const occupied = roomResvs.some(r => {
          const ci = new Date(r.checkIn); ci.setHours(0, 0, 0, 0)
          const co = new Date(r.checkOut); co.setHours(0, 0, 0, 0)
          return d >= ci && d < co
        })
        if (occupied) break
        span++; i++
      }
      segments.push({ type: 'available', span })
      idx += span
    }
    return segments
  }

  const colWidth = 34
  const roomColWidth = 90

  return (
    <div className="space-y-4">
      {unassigned.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <h4 className="font-bold text-amber-900 text-sm mb-3">⚠️ {unassigned.length} réservation{unassigned.length > 1 ? 's' : ''} non attribuée{unassigned.length > 1 ? 's' : ''}</h4>
          <div className="space-y-2">
            {unassigned.map(r => (
              <UnassignedRow key={r.id} r={r} roomUnits={activeRooms} onChanged={onChanged} />
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button onClick={() => setMonthOffset(o => o - 1)} className="w-8 h-8 hover:bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-bold transition">‹</button>
            <div className="font-bold text-gray-900">{MONTHS[month]} {year}</div>
            <button onClick={() => setMonthOffset(o => o + 1)} className="w-8 h-8 hover:bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-bold transition">›</button>
          </div>
          <button onClick={() => setMonthOffset(0)} className="text-xs font-semibold text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">Aujourd&apos;hui</button>
        </div>

        {activeRooms.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">Aucune chambre active. Configurez vos chambres ci-dessus.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="border-collapse" style={{ tableLayout: 'fixed', width: roomColWidth + colWidth * days.length }}>
              <colgroup>
                <col style={{ width: roomColWidth }} />
                {days.map((_, i) => <col key={i} style={{ width: colWidth }} />)}
              </colgroup>
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="bg-gray-50 px-2 text-left text-xs font-semibold text-gray-400 border-r border-gray-100" style={{ height: 40 }}>Chambre</th>
                  {days.map(d => {
                    const ds = dateStr(d)
                    const dow = new Date(year, month, d).getDay()
                    const isWeekend = dow === 0 || dow === 6
                    const isTdy = ds === todayStr
                    return (
                      <th key={d} className={`text-center text-[10px] font-semibold border-r border-gray-50 ${isTdy ? 'bg-blue-600 text-white' : isWeekend ? 'bg-gray-50 text-gray-400' : 'bg-white text-gray-500'}`}>
                        <div>{'DLMMJVS'[dow]}</div>
                        <div className="font-bold">{d}</div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {activeRooms.map(room => {
                  const segments = buildSegments(room.id)
                  let colIndex = 0
                  return (
                    <tr key={room.id} className="border-b border-gray-50" style={{ height: 40 }}>
                      <td className="border-r border-gray-100 px-2 bg-white">
                        <span className="text-xs font-mono font-bold text-gray-700">{room.label}</span>
                      </td>
                      {segments.map((seg, si) => {
                        const startIdx = colIndex
                        colIndex += seg.span

                        if (seg.type === 'resv') {
                          const c = getSourceColor(seg.resv.source)
                          return (
                            <td key={si} colSpan={seg.span} className="border-r border-gray-50 p-0.5 cursor-pointer" onClick={() => setEditResv(seg.resv)}>
                              <div className="h-full rounded-lg flex items-center px-2 overflow-hidden" style={{ backgroundColor: c.bg, border: `1.5px solid ${c.border}`, height: 30 }}>
                                {seg.span >= 2 && <span className="text-[10px] font-bold truncate" style={{ color: c.text }}>{seg.resv.guestName.split(' ')[0]}</span>}
                              </div>
                            </td>
                          )
                        }

                        // Cellules disponibles : une <td> cliquable par jour, pour créer une résa à cette date précise
                        return Array.from({ length: seg.span }, (_, ci) => {
                          const d = days[startIdx + ci]
                          const ds = dateStr(d)
                          return (
                            <td key={ds} className="border-r border-gray-50 p-0.5 cursor-pointer hover:bg-blue-50 transition"
                              onClick={() => setCreateCell({ roomUnitId: room.id, date: ds })}>
                              <div className="h-full rounded-lg" style={{ height: 30 }} />
                            </td>
                          )
                        })
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 py-3 border-t border-gray-50 flex flex-wrap gap-x-5 gap-y-2">
          {[
            { label: 'Airbnb', c: SOURCE_COLORS.airbnb },
            { label: 'Booking.com', c: SOURCE_COLORS.booking },
            { label: 'Direct', c: SOURCE_COLORS.direct },
          ].map(({ label, c }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="w-7 h-3 rounded" style={{ backgroundColor: c.bg, border: `1.5px solid ${c.border}` }} />
              <span>{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <div className="w-4 h-3 rounded bg-white border border-gray-200" />
            <span>Disponible (cliquer pour créer)</span>
          </div>
        </div>
      </div>

      {createCell && (
        <CreateReservationModal
          propertyId={propertyId}
          roomUnitId={createCell.roomUnitId}
          date={createCell.date}
          basePrice={basePrice}
          onClose={() => setCreateCell(null)}
          onCreated={() => { setCreateCell(null); onChanged() }}
        />
      )}
      {editResv && (
        <EditReservationModal
          resv={editResv}
          roomUnits={activeRooms}
          onClose={() => setEditResv(null)}
          onSaved={() => { setEditResv(null); onChanged() }}
        />
      )}
    </div>
  )
}

function UnassignedRow({ r, roomUnits, onChanged }: { r: PlanningReservation; roomUnits: RoomUnit[]; onChanged: () => void }) {
  const [roomId, setRoomId] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState('')

  const handleAssign = async () => {
    if (!roomId) return
    setAssigning(true)
    setError('')
    const res = await fetch(`/api/reservations/${r.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestName: r.guestName, guestEmail: r.guestEmail, guestPhone: r.guestPhone, roomUnitId: roomId }),
    })
    if (res.ok) {
      onChanged()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Erreur')
    }
    setAssigning(false)
  }

  return (
    <div className="flex items-center justify-between gap-3 bg-white rounded-xl px-3 py-2">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-gray-900 truncate">{r.guestName}</div>
        <div className="text-xs text-gray-400">{new Date(r.checkIn).toLocaleDateString('fr-FR')} → {new Date(r.checkOut).toLocaleDateString('fr-FR')} · {r.nights}n</div>
        {error && <div className="text-xs text-red-600 mt-0.5">❌ {error}</div>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <select value={roomId} onChange={e => setRoomId(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs">
          <option value="">Choisir une chambre</option>
          {roomUnits.map(ru => <option key={ru.id} value={ru.id}>{ru.label}</option>)}
        </select>
        <button onClick={handleAssign} disabled={!roomId || assigning}
          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
          {assigning ? '...' : 'Attribuer'}
        </button>
      </div>
    </div>
  )
}

function CreateReservationModal({ propertyId, roomUnitId, date, basePrice, onClose, onCreated }: {
  propertyId: string; roomUnitId: string; date: string; basePrice: number; onClose: () => void; onCreated: () => void
}) {
  const [form, setForm] = useState({ guestName: '', guestEmail: '', guestPhone: '', checkOut: '', totalPrice: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId, roomUnitId, checkIn: date, checkOut: form.checkOut, guestName: form.guestName, guestEmail: form.guestEmail, guestPhone: form.guestPhone, totalPrice: form.totalPrice }),
    })
    if (res.ok) { onCreated(); return }
    const data = await res.json().catch(() => ({}))
    setError(data.error || 'Erreur lors de la création')
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-gray-900 text-lg mb-4">Nouvelle réservation · {new Date(date).toLocaleDateString('fr-FR')}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className={lbl}>Nom du voyageur *</label>
            <input required value={form.guestName} onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))} className={inp} />
          </div>
          <div>
            <label className={lbl}>Date de départ *</label>
            <input required type="date" min={date} value={form.checkOut} onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))} className={inp} />
          </div>
          <div>
            <label className={lbl}>Email</label>
            <input type="email" value={form.guestEmail} onChange={e => setForm(f => ({ ...f, guestEmail: e.target.value }))} className={inp} />
          </div>
          <div>
            <label className={lbl}>Prix total (€)</label>
            <input type="number" step="0.01" min="0" value={form.totalPrice} onChange={e => setForm(f => ({ ...f, totalPrice: e.target.value }))} placeholder={`ex: ${basePrice}`} className={inp} />
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">❌ {error}</div>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition">Annuler</button>
            <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50">{saving ? '...' : '✓ Créer'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditReservationModal({ resv, roomUnits, onClose, onSaved }: {
  resv: PlanningReservation; roomUnits: RoomUnit[]; onClose: () => void; onSaved: () => void
}) {
  const [form, setForm] = useState({
    guestName: resv.guestName, guestEmail: resv.guestEmail, guestPhone: resv.guestPhone || '',
    checkIn: resv.checkIn.split('T')[0], checkOut: resv.checkOut.split('T')[0],
    totalPrice: resv.totalPrice, roomUnitId: resv.roomUnitId || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setError('')
    const res = await fetch(`/api/reservations/${resv.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) { onSaved(); return }
    const data = await res.json().catch(() => ({}))
    setError(data.error || 'Erreur lors de la sauvegarde')
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm('Supprimer cette réservation ?')) return
    setSaving(true)
    await fetch(`/api/reservations/${resv.id}`, { method: 'DELETE' })
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-gray-900 text-lg mb-4">Modifier la réservation</h3>
        <div className="space-y-3">
          <div>
            <label className={lbl}>Nom du voyageur</label>
            <input value={form.guestName} onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))} className={inp} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={lbl}>Arrivée</label>
              <input type="date" value={form.checkIn} onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))} className={inp} />
            </div>
            <div>
              <label className={lbl}>Départ</label>
              <input type="date" value={form.checkOut} onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))} className={inp} />
            </div>
          </div>
          <div>
            <label className={lbl}>Chambre</label>
            <select value={form.roomUnitId} onChange={e => setForm(f => ({ ...f, roomUnitId: e.target.value }))} className={inp}>
              <option value="">Non attribuée</option>
              {roomUnits.map(ru => <option key={ru.id} value={ru.id}>{ru.label}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Prix total (€)</label>
            <input type="number" step="0.01" value={form.totalPrice} onChange={e => setForm(f => ({ ...f, totalPrice: Number(e.target.value) }))} className={inp} />
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">❌ {error}</div>}
          <div className="flex gap-2 pt-1">
            <button onClick={handleDelete} disabled={saving} className="text-xs text-red-500 hover:text-red-700 px-2">Supprimer</button>
            <div className="flex-1" />
            <button onClick={onClose} className="border border-gray-200 text-gray-600 py-2 px-4 rounded-xl text-sm font-medium hover:bg-gray-50 transition">Annuler</button>
            <button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white py-2 px-4 rounded-xl text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50">{saving ? '...' : '✓ Sauvegarder'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
