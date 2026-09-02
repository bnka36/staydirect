'use client'
import { useState, useEffect } from 'react'

interface PriceOverride {
  id: string
  date: string
  price: number
}

interface BlockedDate {
  date: string
}

interface Reservation {
  checkIn: string
  checkOut: string
  status: string
}

interface Props {
  propertyId: string
  basePrice: number
  blockedDates?: BlockedDate[]
  reservations?: Reservation[]
}

export default function PriceCalendar({ propertyId, basePrice, blockedDates = [], reservations = [] }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [priceOverrides, setPriceOverrides] = useState<PriceOverride[]>([])
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [newPrice, setNewPrice] = useState('')
  const [rangeEnd, setRangeEnd] = useState('')
  const [saving, setSaving] = useState(false)
  const [mode, setMode] = useState<'single' | 'range'>('single')

  const fmt = (n: number) => `${n}€`

  useEffect(() => {
    fetchOverrides()
  }, [propertyId])

  const fetchOverrides = async () => {
    const res = await fetch(`/api/price-overrides?propertyId=${propertyId}`)
    const data = await res.json()
    setPriceOverrides(data)
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayAdj = firstDay === 0 ? 6 : firstDay - 1

  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  const getDateStr = (day: number) => {
    const d = new Date(year, month, day)
    d.setHours(12, 0, 0, 0)
    return d.toISOString().split('T')[0]
  }

  const getOverride = (day: number) => {
    const dateStr = getDateStr(day)
    return priceOverrides.find(o => o.date.split('T')[0] === dateStr)
  }

  const isBlocked = (day: number) => {
    const dateStr = getDateStr(day)
    return blockedDates.some(b => b.date.split('T')[0] === dateStr)
  }

  const isReserved = (day: number) => {
    const d = new Date(year, month, day)
    return reservations.some(r => {
      if (r.status !== 'confirmed') return false
      const cin = new Date(r.checkIn)
      const cout = new Date(r.checkOut)
      return d >= cin && d < cout
    })
  }

  const isPast = (day: number) => {
    const d = new Date(year, month, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return d < today
  }

  const handleDayClick = (day: number) => {
    if (isPast(day) || isBlocked(day) || isReserved(day)) return
    const dateStr = getDateStr(day)
    const override = getOverride(day)
    setSelectedDay(dateStr)
    setNewPrice(override ? String(override.price) : String(basePrice))
    setRangeEnd('')
  }

  const handleSave = async () => {
    if (!selectedDay || !newPrice) return
    setSaving(true)
    await fetch('/api/price-overrides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId,
        date: selectedDay,
        dateEnd: mode === 'range' && rangeEnd ? rangeEnd : selectedDay,
        price: parseFloat(newPrice),
      }),
    })
    await fetchOverrides()
    setSelectedDay(null)
    setNewPrice('')
    setRangeEnd('')
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!selectedDay) return
    setSaving(true)
    await fetch('/api/price-overrides', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId, date: selectedDay }),
    })
    await fetchOverrides()
    setSelectedDay(null)
    setSaving(false)
  }

  const selectedOverride = selectedDay ? priceOverrides.find(o => o.date.split('T')[0] === selectedDay) : null

  return (
    <div className="space-y-4">
      {/* Légende */}
      <div className="flex items-center gap-4 flex-wrap text-xs">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-white border border-gray-200" /><span className="text-gray-500">Prix de base ({fmt(basePrice)})</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-100 border border-blue-300" /><span className="text-gray-500">Prix modifié</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-100 border border-green-300" /><span className="text-gray-500">Réservé</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-100 border border-red-300" /><span className="text-gray-500">Bloqué iCal</span></div>
      </div>

      {/* Navigation mois */}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition font-bold text-gray-600">‹</button>
        <h3 className="font-bold text-gray-900 capitalize">{monthName}</h3>
        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition font-bold text-gray-600">›</button>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 gap-1">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
        ))}

        {/* Espaces vides */}
        {Array(firstDayAdj).fill(null).map((_, i) => <div key={`empty-${i}`} />)}

        {/* Jours */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const dateStr = getDateStr(day)
          const override = getOverride(day)
          const blocked = isBlocked(day)
          const reserved = isReserved(day)
          const past = isPast(day)
          const isSelected = selectedDay === dateStr
          const isWeekend = new Date(year, month, day).getDay() === 0 || new Date(year, month, day).getDay() === 6

          let bgClass = 'bg-white border-gray-100 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
          if (past) bgClass = 'bg-gray-50 border-gray-100 opacity-40 cursor-default'
          else if (blocked) bgClass = 'bg-red-50 border-red-200 cursor-default'
          else if (reserved) bgClass = 'bg-green-50 border-green-200 cursor-default'
          else if (override) bgClass = 'bg-blue-50 border-blue-300 hover:bg-blue-100 cursor-pointer'
          else if (isWeekend) bgClass = 'bg-orange-50 border-orange-100 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'

          if (isSelected) bgClass = 'bg-blue-600 border-blue-600 cursor-pointer'

          return (
            <div
              key={day}
              onClick={() => handleDayClick(day)}
              className={`border rounded-xl p-1 text-center transition min-h-[52px] flex flex-col items-center justify-center ${bgClass}`}
            >
              <div className={`text-xs font-bold mb-0.5 ${isSelected ? 'text-white' : past ? 'text-gray-300' : 'text-gray-700'}`}>
                {day}
              </div>
              <div className={`text-xs font-semibold leading-none ${isSelected ? 'text-blue-200' : override ? 'text-blue-600' : reserved ? 'text-green-600' : blocked ? 'text-red-400' : isWeekend ? 'text-orange-500' : 'text-gray-400'}`}>
                {blocked ? '✕' : reserved ? '✓' : override ? fmt(override.price) : fmt(basePrice)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Panel modification prix */}
      {selectedDay && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-900">
              Modifier le prix — {new Date(selectedDay).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h4>
            <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
          </div>

          {/* Mode single ou plage */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode('single')}
              className={`flex-1 py-2 text-sm rounded-xl font-medium transition ${mode === 'single' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
            >
              Ce jour seulement
            </button>
            <button
              onClick={() => setMode('range')}
              className={`flex-1 py-2 text-sm rounded-xl font-medium transition ${mode === 'range' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
            >
              Plage de dates
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                {mode === 'range' ? 'Du' : 'Date'}
              </label>
              <input
                type="date"
                value={selectedDay}
                readOnly
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
              />
            </div>
            {mode === 'range' && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Au</label>
                <input
                  type="date"
                  value={rangeEnd}
                  min={selectedDay}
                  onChange={e => setRangeEnd(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Prix pour {mode === 'range' ? 'cette période' : 'ce jour'} (€/nuit)
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min="0"
                step="0.01"
                value={newPrice}
                onChange={e => setNewPrice(e.target.value)}
                className="w-32 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder={String(basePrice)}
              />
              <span className="text-gray-400 text-sm">€/nuit</span>
              {parseFloat(newPrice) !== basePrice && (
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${parseFloat(newPrice) > basePrice ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {parseFloat(newPrice) > basePrice ? '+' : ''}{Math.round(((parseFloat(newPrice) - basePrice) / basePrice) * 100)}% vs base
                </span>
              )}
            </div>
          </div>

          {/* Suggestions rapides */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-gray-400 self-center">Raccourcis :</span>
            {[-20, -10, +10, +20, +30, +50].map(pct => (
              <button
                key={pct}
                onClick={() => setNewPrice(String(Math.round(basePrice * (1 + pct / 100))))}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${pct < 0 ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
              >
                {pct > 0 ? '+' : ''}{pct}%
              </button>
            ))}
            <button
              onClick={() => setNewPrice(String(basePrice))}
              className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
            >
              Base ({fmt(basePrice)})
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !newPrice}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 text-sm"
            >
              {saving ? 'Enregistrement...' : `Appliquer ${newPrice ? fmt(parseFloat(newPrice)) : ''}`}
            </button>
            {selectedOverride && (
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl font-medium border border-red-200 text-red-500 hover:bg-red-50 transition text-sm"
              >
                Supprimer
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
