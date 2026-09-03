'use client'
import { useState } from 'react'

export interface RoomUnit {
  id: string
  label: string
  pricePerNight: number | null
  maxGuests: number | null
  isActive: boolean
  order: number
}

const lbl = 'block text-xs font-semibold text-gray-500 mb-1'
const inp = 'w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

export default function RoomUnitsManager({ propertyId, roomUnits, basePrice, baseMaxGuests, onChanged }: {
  propertyId: string
  roomUnits: RoomUnit[]
  basePrice: number
  baseMaxGuests: number
  onChanged: () => void
}) {
  const [generating, setGenerating] = useState(false)
  const [generateCount, setGenerateCount] = useState('')
  const [genError, setGenError] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newRoom, setNewRoom] = useState({ label: '', pricePerNight: '', maxGuests: '' })
  const [addError, setAddError] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ label: '', pricePerNight: '', maxGuests: '' })
  const [rowError, setRowError] = useState('')

  const handleGenerate = async () => {
    const count = parseInt(generateCount)
    if (!count || count < 1) return
    setGenerating(true)
    setGenError('')
    const res = await fetch('/api/room-units/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId, count }),
    })
    if (res.ok) {
      setGenerateCount('')
      onChanged()
    } else {
      const data = await res.json().catch(() => ({}))
      setGenError(data.error || 'Erreur lors de la génération')
    }
    setGenerating(false)
  }

  const handleAdd = async () => {
    if (!newRoom.label.trim()) return
    setAddError('')
    const res = await fetch('/api/room-units', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId, ...newRoom }),
    })
    if (res.ok) {
      setNewRoom({ label: '', pricePerNight: '', maxGuests: '' })
      setShowAdd(false)
      onChanged()
    } else {
      const data = await res.json().catch(() => ({}))
      setAddError(data.error || 'Erreur lors de la création')
    }
  }

  const startEdit = (r: RoomUnit) => {
    setEditing(r.id)
    setRowError('')
    setEditForm({ label: r.label, pricePerNight: r.pricePerNight?.toString() || '', maxGuests: r.maxGuests?.toString() || '' })
  }

  const saveEdit = async (id: string) => {
    setRowError('')
    const res = await fetch(`/api/room-units/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    if (res.ok) {
      setEditing(null)
      onChanged()
    } else {
      const data = await res.json().catch(() => ({}))
      setRowError(data.error || 'Erreur lors de la sauvegarde')
    }
  }

  const toggleActive = async (r: RoomUnit) => {
    await fetch(`/api/room-units/${r.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !r.isActive }),
    })
    onChanged()
  }

  const deleteRoom = async (r: RoomUnit) => {
    if (!confirm(`Supprimer ${r.label} ? Les réservations liées repasseront en "non attribuées".`)) return
    await fetch(`/api/room-units/${r.id}`, { method: 'DELETE' })
    onChanged()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-gray-900">🛏️ Chambres / unités</h3>
        <button onClick={() => setShowAdd(s => !s)} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 transition">
          {showAdd ? '✕ Fermer' : '+ Ajouter une chambre'}
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-4">{roomUnits.length} chambre{roomUnits.length > 1 ? 's' : ''} configurée{roomUnits.length > 1 ? 's' : ''}. Prix/capacité vides = utilise le prix/capacité de base du logement ({basePrice}€, {baseMaxGuests} voyageurs).</p>

      {roomUnits.length === 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
          <p className="text-sm text-blue-800 mb-2">Aucune chambre configurée pour l&apos;instant. Générez-les automatiquement :</p>
          <div className="flex items-center gap-2">
            <input type="number" min="1" value={generateCount} onChange={e => setGenerateCount(e.target.value)}
              placeholder="28" className={`${inp} max-w-[100px]`} />
            <button onClick={handleGenerate} disabled={generating || !generateCount}
              className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
              {generating ? '...' : 'Générer (Ch01, Ch02...)'}
            </button>
          </div>
          {genError && <p className="text-xs text-red-600 mt-2">❌ {genError}</p>}
        </div>
      )}

      {showAdd && (
        <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={lbl}>Nom *</label>
              <input value={newRoom.label} onChange={e => setNewRoom(f => ({ ...f, label: e.target.value }))} placeholder="Ch29" className={inp} />
            </div>
            <div>
              <label className={lbl}>Prix/nuit (€)</label>
              <input type="number" step="0.01" value={newRoom.pricePerNight} onChange={e => setNewRoom(f => ({ ...f, pricePerNight: e.target.value }))} placeholder={String(basePrice)} className={inp} />
            </div>
            <div>
              <label className={lbl}>Capacité</label>
              <input type="number" min="1" value={newRoom.maxGuests} onChange={e => setNewRoom(f => ({ ...f, maxGuests: e.target.value }))} placeholder={String(baseMaxGuests)} className={inp} />
            </div>
          </div>
          {addError && <p className="text-xs text-red-600">❌ {addError}</p>}
          <button onClick={handleAdd} disabled={!newRoom.label.trim()}
            className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
            ✓ Ajouter
          </button>
        </div>
      )}

      {roomUnits.length > 0 && (
        <div className="divide-y divide-gray-50">
          {roomUnits.map(r => (
            <div key={r.id} className="py-2.5">
              {editing === r.id ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <input value={editForm.label} onChange={e => setEditForm(f => ({ ...f, label: e.target.value }))} className={`${inp} w-24`} />
                  <input type="number" step="0.01" value={editForm.pricePerNight} onChange={e => setEditForm(f => ({ ...f, pricePerNight: e.target.value }))} placeholder={`${basePrice}€`} className={`${inp} w-24`} />
                  <input type="number" min="1" value={editForm.maxGuests} onChange={e => setEditForm(f => ({ ...f, maxGuests: e.target.value }))} placeholder={`${baseMaxGuests} pers.`} className={`${inp} w-24`} />
                  <button onClick={() => saveEdit(r.id)} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 transition">✓</button>
                  <button onClick={() => setEditing(null)} className="text-xs text-gray-400 hover:text-gray-600 px-2">Annuler</button>
                  {rowError && <p className="text-xs text-red-600 w-full">❌ {rowError}</p>}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-bold text-sm ${r.isActive ? 'text-gray-900' : 'text-gray-400 line-through'}`}>{r.label}</span>
                    <span className="text-xs text-gray-400">
                      {r.pricePerNight ? `${r.pricePerNight}€/nuit` : `${basePrice}€/nuit (base)`} · {r.maxGuests || baseMaxGuests} voyageurs
                    </span>
                    {!r.isActive && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">Inactive</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(r)} className="text-xs text-blue-500 hover:text-blue-700 px-2 py-1">Modifier</button>
                    <button onClick={() => toggleActive(r)} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1">{r.isActive ? 'Désactiver' : 'Activer'}</button>
                    <button onClick={() => deleteRoom(r)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1">Supprimer</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
