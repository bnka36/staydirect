'use client'
import { useState } from 'react'

interface Reservation {
  id: string
  guestName: string
  guestEmail: string
  checkIn: string
  checkOut: string
  nights: number
  totalPrice: number
  status: string
  source?: string
  propertyId?: string
  property?: { name: string; id: string }
}

interface BlockedDate {
  date: string
  source: string
  propertyName?: string
  propertyId?: string
}

interface Property {
  id: string
  name: string
  images?: string[]
}

interface Props {
  properties: Property[]
  reservations: Reservation[]
  blockedDates?: BlockedDate[]
}

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

// Source-based colors for reservation bars
const SOURCE_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  airbnb:   { bg: '#fff1f2', border: '#fb7185', text: '#be123c', dot: '#f43f5e' },
  booking:  { bg: '#eff6ff', border: '#60a5fa', text: '#1d4ed8', dot: '#3b82f6' },
  abritel:  { bg: '#f5f3ff', border: '#a78bfa', text: '#6d28d9', dot: '#8b5cf6' },
  vrbo:     { bg: '#f5f3ff', border: '#a78bfa', text: '#6d28d9', dot: '#8b5cf6' },
  direct:   { bg: '#f0fdf4', border: '#4ade80', text: '#166534', dot: '#22c55e' },
  ical:     { bg: '#fef9c3', border: '#fbbf24', text: '#92400e', dot: '#f59e0b' },
  manual:   { bg: '#f1f5f9', border: '#94a3b8', text: '#475569', dot: '#64748b' },
}
const DEFAULT_COLOR = { bg: '#dbeafe', border: '#60a5fa', text: '#1e40af', dot: '#2563eb' }

// Property colors for the label stripe
const PROP_DOTS = ['#2563eb','#7c3aed','#059669','#dc2626','#d97706','#0891b2']

const SOURCE_LABEL: Record<string, string> = {
  airbnb: 'Airbnb', booking: 'Booking.com', abritel: 'Abritel', vrbo: 'Vrbo',
  direct: 'Direct', ical: 'iCal', manual: 'Manuel',
}

function getSourceColor(source?: string) {
  if (!source) return DEFAULT_COLOR
  const key = source.toLowerCase()
  for (const k of Object.keys(SOURCE_COLORS)) {
    if (key.includes(k)) return SOURCE_COLORS[k]
  }
  return DEFAULT_COLOR
}

type ViewMode = 'month' | 'week'

type Segment =
  | { type: 'resv'; resv: Reservation; span: number }
  | { type: 'blocked'; span: number; source: string }
  | { type: 'available'; span: number }

export default function PMSCalendar({ properties, reservations, blockedDates = [] }: Props) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [monthOffset, setMonthOffset] = useState(0)
  const [weekOffset, setWeekOffset] = useState(0)
  const [view, setView] = useState<ViewMode>('month')
  const [selected, setSelected] = useState<Reservation | null>(null)

  // Month view
  const monthDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Week view — start on Monday
  const weekStart = new Date(today)
  const dayOfWeek = (today.getDay() + 6) % 7 // Monday=0
  weekStart.setDate(today.getDate() - dayOfWeek + weekOffset * 7)
  weekStart.setHours(0, 0, 0, 0)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  const days = view === 'month'
    ? Array.from({ length: daysInMonth }, (_, i) => i + 1)
    : weekDays.map(d => d.getDate())

  const confirmedResvs = reservations.filter(r => r.status === 'confirmed')

  function dateStr(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  function getDateForCell(idx: number): { y: number; m: number; d: number; str: string } {
    if (view === 'month') {
      return { y: year, m: month, d: idx + 1, str: dateStr(year, month, idx + 1) }
    } else {
      const day = weekDays[idx]
      return { y: day.getFullYear(), m: day.getMonth(), d: day.getDate(),
        str: `${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}` }
    }
  }

  function buildSegments(propId: string, propName: string): Segment[] {
    const totalDays = days.length
    const propResvs = confirmedResvs.filter(r =>
      r.propertyId === propId || r.property?.id === propId
    )
    const propBlocked = blockedDates.filter(b =>
      b.propertyId === propId || b.propertyName === propName
    )
    const blockedSet = new Map<string, string>()
    propBlocked.forEach(b => blockedSet.set(b.date.split('T')[0], b.source))

    const segments: Segment[] = []
    let idx = 0

    while (idx < totalDays) {
      const { str: ds } = getDateForCell(idx)
      const dayDate = new Date(ds + 'T00:00:00')

      const resv = propResvs.find(r => {
        const ci = new Date(r.checkIn); ci.setHours(0,0,0,0)
        const co = new Date(r.checkOut); co.setHours(0,0,0,0)
        return dayDate >= ci && dayDate < co
      })

      if (resv) {
        const co = new Date(resv.checkOut); co.setHours(0,0,0,0)
        let span = 0
        let i = idx
        while (i < totalDays) {
          const { str } = getDateForCell(i)
          const d = new Date(str + 'T00:00:00')
          if (d >= co) break
          span++; i++
        }
        segments.push({ type: 'resv', resv, span: Math.max(span, 1) })
        idx += Math.max(span, 1)
        continue
      }

      if (blockedSet.has(ds)) {
        let span = 0
        let i = idx
        while (i < totalDays) {
          const { str } = getDateForCell(i)
          if (!blockedSet.has(str)) break
          span++; i++
        }
        segments.push({ type: 'blocked', span, source: blockedSet.get(ds) || 'ical' })
        idx += span
        continue
      }

      let span = 0
      let i = idx
      while (i < totalDays) {
        const { str } = getDateForCell(i)
        const d = new Date(str + 'T00:00:00')
        const hasResv = propResvs.some(r => {
          const ci = new Date(r.checkIn); ci.setHours(0,0,0,0)
          const co = new Date(r.checkOut); co.setHours(0,0,0,0)
          return d >= ci && d < co
        })
        if (hasResv || blockedSet.has(str)) break
        span++; i++
      }
      segments.push({ type: 'available', span })
      idx += span
    }

    return segments
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`

  function isToday(idx: number) {
    return getDateForCell(idx).str === todayStr
  }

  // Headers
  const colWidth = view === 'week' ? 80 : 36
  const propColWidth = 160

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => view === 'month' ? setMonthOffset(o => o - 1) : setWeekOffset(o => o - 1)}
            className="w-8 h-8 hover:bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-bold text-lg transition">‹</button>
          <div>
            {view === 'month' ? (
              <>
                <div className="font-bold text-gray-900">{MONTHS[month]} {year}</div>
                <div className="text-xs text-gray-400">{properties.length} logement{properties.length > 1 ? 's' : ''}</div>
              </>
            ) : (
              <>
                <div className="font-bold text-gray-900">
                  {weekDays[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} – {weekDays[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div className="text-xs text-gray-400">Semaine · {properties.length} logement{properties.length > 1 ? 's' : ''}</div>
              </>
            )}
          </div>
          <button
            onClick={() => view === 'month' ? setMonthOffset(o => o + 1) : setWeekOffset(o => o + 1)}
            className="w-8 h-8 hover:bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-bold text-lg transition">›</button>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1.5 text-xs font-semibold transition ${view === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
              Mois
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1.5 text-xs font-semibold transition ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
              Semaine
            </button>
          </div>
          <button
            onClick={() => { setMonthOffset(0); setWeekOffset(0) }}
            className="text-xs font-semibold text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">
            Aujourd'hui
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="border-collapse" style={{ tableLayout: 'fixed', width: propColWidth + colWidth * days.length }}>
          <colgroup>
            <col style={{ width: propColWidth }} />
            {days.map((_, i) => <col key={i} style={{ width: colWidth }} />)}
          </colgroup>

          {/* Day headers */}
          <thead>
            <tr className="border-b border-gray-100">
              <th className="bg-gray-50 px-3 text-left text-xs font-semibold text-gray-400 border-r border-gray-100" style={{ height: 44 }}>
                Logement
              </th>
              {days.map((_, idx) => {
                const { y, m, d, str } = getDateForCell(idx)
                const dow = new Date(y, m, d).getDay()
                const isWeekend = dow === 0 || dow === 6
                const isTdy = str === todayStr
                return (
                  <th key={idx}
                    className={`text-center text-[10px] font-semibold border-r border-gray-50 ${isTdy ? 'bg-blue-600 text-white' : isWeekend ? 'bg-gray-50 text-gray-400' : 'bg-white text-gray-500'}`}>
                    <div>{'DLMMJVS'[dow]}</div>
                    {view === 'week' ? (
                      <div className="font-bold text-sm">{d}</div>
                    ) : (
                      <div className="font-bold">{d}</div>
                    )}
                    {view === 'week' && (
                      <div className={`text-[9px] ${isTdy ? 'text-blue-200' : 'text-gray-400'}`}>
                        {new Date(y, m, d).toLocaleDateString('fr-FR', { month: 'short' })}
                      </div>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {properties.map((prop, pi) => {
              const propDot = PROP_DOTS[pi % PROP_DOTS.length]
              const segments = buildSegments(prop.id, prop.name)
              const rowHeight = view === 'week' ? 56 : 48

              return (
                <tr key={prop.id} className="border-b border-gray-50" style={{ height: rowHeight }}>
                  {/* Property label */}
                  <td className="border-r border-gray-100 px-2 bg-white">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: propDot }} />
                      {prop.images?.[0]
                        ? <img src={prop.images[0]} className="w-7 h-7 rounded-lg object-cover flex-shrink-0" alt="" />
                        : <div className="w-7 h-7 rounded-lg flex-shrink-0 text-xs flex items-center justify-center bg-gray-100">🏠</div>}
                      <span className="text-xs font-semibold text-gray-700 truncate leading-tight">{prop.name}</span>
                    </div>
                  </td>

                  {/* Segments */}
                  {segments.map((seg, si) => {
                    if (seg.type === 'resv') {
                      const c = getSourceColor(seg.resv.source)
                      const firstName = seg.resv.guestName.split(' ')[0]
                      const srcLabel = seg.resv.source ? (SOURCE_LABEL[seg.resv.source.toLowerCase()] || seg.resv.source) : 'Direct'
                      const isSelected = selected?.id === seg.resv.id
                      return (
                        <td key={si} colSpan={seg.span}
                          className="border-r border-gray-50 p-0.5 cursor-pointer"
                          onClick={() => setSelected(isSelected ? null : seg.resv)}>
                          <div className="h-full rounded-lg flex items-center px-2 gap-1.5 overflow-hidden"
                            style={{
                              backgroundColor: isSelected ? c.border : c.bg,
                              border: `1.5px solid ${c.border}`,
                              height: rowHeight - 10,
                            }}>
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: isSelected ? 'white' : c.dot }} />
                            {seg.span >= 2 && (
                              <span className="text-[11px] font-bold truncate" style={{ color: isSelected ? 'white' : c.text }}>
                                {firstName}
                              </span>
                            )}
                            {seg.span >= 3 && (
                              <span className="text-[10px] opacity-80 truncate" style={{ color: isSelected ? 'white' : c.text }}>
                                · {srcLabel}
                              </span>
                            )}
                          </div>
                        </td>
                      )
                    }

                    if (seg.type === 'blocked') {
                      const label = SOURCE_LABEL[seg.source] || 'Bloqué'
                      return (
                        <td key={si} colSpan={seg.span} className="border-r border-gray-50 p-0.5">
                          <div className="h-full rounded-lg flex items-center px-2 overflow-hidden"
                            style={{ backgroundColor: '#fef3c7', border: '1.5px solid #fbbf24', height: rowHeight - 10 }}>
                            <span className="text-[10px] font-semibold text-amber-700 truncate">
                              {seg.span >= 2 ? `⊘ ${label}` : '⊘'}
                            </span>
                          </div>
                        </td>
                      )
                    }

                    return (
                      <td key={si} colSpan={seg.span}
                        className="border-r border-gray-50 bg-white" />
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-t border-gray-50 flex flex-wrap gap-x-5 gap-y-2">
        {[
          { label: 'Airbnb', c: SOURCE_COLORS.airbnb },
          { label: 'Booking.com', c: SOURCE_COLORS.booking },
          { label: 'Direct', c: SOURCE_COLORS.direct },
          { label: 'Abritel', c: SOURCE_COLORS.abritel },
          { label: 'Bloqué (iCal)', c: { bg: '#fef3c7', border: '#fbbf24', dot: '#f59e0b', text: '#92400e' } },
        ].map(({ label, c }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-7 h-3 rounded" style={{ backgroundColor: c.bg, border: `1.5px solid ${c.border}` }} />
            <span>{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <div className="w-4 h-3 rounded bg-gray-100 border border-gray-200" />
          <span>Disponible</span>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
              style={{ backgroundColor: getSourceColor(selected.source).bg, color: getSourceColor(selected.source).text }}>
              {selected.guestName[0].toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-gray-900">{selected.guestName}</div>
              <div className="text-sm text-gray-500">{selected.guestEmail}</div>
              <div className="text-xs text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
                <span>{new Date(selected.checkIn).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                {' → '}
                {new Date(selected.checkOut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                {' · '}{selected.nights} nuit{selected.nights > 1 ? 's' : ''}</span>
                {selected.source && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: getSourceColor(selected.source).bg, color: getSourceColor(selected.source).text }}>
                    {SOURCE_LABEL[selected.source.toLowerCase()] || selected.source}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            {selected.totalPrice > 0 && (
              <>
                <div className="text-xl font-black text-green-600">{selected.totalPrice}€</div>
                <div className="text-xs text-gray-400">encaissé</div>
              </>
            )}
            <button onClick={() => setSelected(null)}
              className="mt-1 text-xs text-gray-400 hover:text-gray-700">Fermer ✕</button>
          </div>
        </div>
      )}
    </div>
  )
}
