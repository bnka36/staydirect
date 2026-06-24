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

const PROP_COLORS = [
  { bar: '#2563eb', bg: '#dbeafe', text: '#1e40af' },
  { bar: '#7c3aed', bg: '#ede9fe', text: '#5b21b6' },
  { bar: '#059669', bg: '#d1fae5', text: '#065f46' },
  { bar: '#dc2626', bg: '#fee2e2', text: '#991b1b' },
  { bar: '#d97706', bg: '#fef3c7', text: '#92400e' },
  { bar: '#0891b2', bg: '#cffafe', text: '#155e75' },
]

const SOURCE_LABEL: Record<string, string> = {
  airbnb: 'Airbnb', booking: 'Booking', abritel: 'Abritel', direct: 'Direct', ical: 'iCal'
}

type Segment =
  | { type: 'resv'; resv: Reservation; span: number; colorIdx: number }
  | { type: 'blocked'; span: number; source: string }
  | { type: 'available'; span: number }

export default function PMSCalendar({ properties, reservations, blockedDates = [] }: Props) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [monthOffset, setMonthOffset] = useState(0)
  const [selected, setSelected] = useState<Reservation | null>(null)

  const year = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1).getFullYear()
  const month = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1).getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const isMobileView = typeof window !== 'undefined' && window.innerWidth < 640

  const confirmedResvs = reservations.filter(r => r.status === 'confirmed')

  // Assign a color index per property
  const propColorMap: Record<string, number> = {}
  properties.forEach((p, i) => { propColorMap[p.id] = i % PROP_COLORS.length })

  function dateStr(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  function buildSegments(propId: string, propName: string): Segment[] {
    const propResvs = confirmedResvs.filter(r =>
      r.propertyId === propId || r.property?.id === propId
    )
    const propBlocked = blockedDates.filter(b =>
      b.propertyId === propId || b.propertyName === propName
    )
    const blockedSet = new Map<string, string>()
    propBlocked.forEach(b => blockedSet.set(b.date.split('T')[0], b.source))

    const colorIdx = propColorMap[propId] ?? 0
    const segments: Segment[] = []
    let d = 1

    while (d <= daysInMonth) {
      const ds = dateStr(year, month, d)

      // Check if a reservation starts on or before this day and covers it
      const resv = propResvs.find(r => {
        const ci = new Date(r.checkIn); ci.setHours(0, 0, 0, 0)
        const co = new Date(r.checkOut); co.setHours(0, 0, 0, 0)
        const dayDate = new Date(year, month, d)
        return dayDate >= ci && dayDate < co
      })

      if (resv) {
        const ci = new Date(resv.checkIn); ci.setHours(0, 0, 0, 0)
        const co = new Date(resv.checkOut); co.setHours(0, 0, 0, 0)
        // How many days does this reservation occupy in this month from day d?
        const endOfMonth = new Date(year, month + 1, 0)
        const effectiveEnd = co < endOfMonth ? co : new Date(year, month + 1, 1)
        const span = Math.round((effectiveEnd.getTime() - new Date(year, month, d).getTime()) / 86400000)
        const clampedSpan = Math.min(span, daysInMonth - d + 1)
        segments.push({ type: 'resv', resv, span: clampedSpan, colorIdx })
        d += clampedSpan
        continue
      }

      // Check if blocked
      if (blockedSet.has(ds)) {
        // Count consecutive blocked days
        let span = 0
        let dd = d
        while (dd <= daysInMonth && blockedSet.has(dateStr(year, month, dd))) {
          span++; dd++
        }
        const src = blockedSet.get(ds) || 'ical'
        segments.push({ type: 'blocked', span, source: src })
        d += span
        continue
      }

      // Available — group consecutive available days
      let span = 0
      let dd = d
      while (dd <= daysInMonth) {
        const dds = dateStr(year, month, dd)
        const hasResv = propResvs.some(r => {
          const ci = new Date(r.checkIn); ci.setHours(0, 0, 0, 0)
          const co = new Date(r.checkOut); co.setHours(0, 0, 0, 0)
          const dayDate = new Date(year, month, dd)
          return dayDate >= ci && dayDate < co
        })
        if (hasResv || blockedSet.has(dds)) break
        span++; dd++
      }
      segments.push({ type: 'available', span })
      d += span
    }

    return segments
  }

  const todayInMonth = month === today.getMonth() && year === today.getFullYear()
    ? today.getDate() : -1

  // Find which column (1-indexed day) "today" falls in
  function getDayCol(day: number): boolean {
    return day === todayInMonth
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => setMonthOffset(o => o - 1)}
            className="w-8 h-8 hover:bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-bold text-lg transition">‹</button>
          <div>
            <div className="font-bold text-gray-900">{MONTHS[month]} {year}</div>
            <div className="text-xs text-gray-400">{properties.length} logement{properties.length > 1 ? 's' : ''}</div>
          </div>
          <button onClick={() => setMonthOffset(o => o + 1)}
            className="w-8 h-8 hover:bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-bold text-lg transition">›</button>
        </div>
        <button onClick={() => setMonthOffset(0)}
          className="text-xs font-semibold text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">
          Aujourd'hui
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="border-collapse" style={{ tableLayout: 'fixed', width: (isMobileView ? 100 : 160) + (isMobileView ? 28 : 36) * daysInMonth }}>
          <colgroup>
            <col style={{ width: isMobileView ? 100 : 160 }} />
            {days.map(d => <col key={d} style={{ width: isMobileView ? 28 : 36 }} />)}
          </colgroup>

          {/* Day headers */}
          <thead>
            <tr className="border-b border-gray-100">
              <th className="bg-gray-50 px-3 text-left text-xs font-semibold text-gray-400 border-r border-gray-100" style={{ height: 44 }}>
                Logement
              </th>
              {days.map(d => {
                const dow = new Date(year, month, d).getDay()
                const isWeekend = dow === 0 || dow === 6
                const isTdy = getDayCol(d)
                return (
                  <th key={d}
                    className={`text-center text-[10px] font-semibold border-r border-gray-50 ${isTdy ? 'bg-blue-600 text-white' : isWeekend ? 'bg-gray-50 text-gray-400' : 'bg-white text-gray-500'}`}>
                    <div>{'DLMMJVS'[dow]}</div>
                    <div className="font-bold">{d}</div>
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {properties.map((prop, pi) => {
              const color = PROP_COLORS[pi % PROP_COLORS.length]
              const segments = buildSegments(prop.id, prop.name)

              return (
                <tr key={prop.id} className="border-b border-gray-50" style={{ height: 48 }}>
                  {/* Property label */}
                  <td className="border-r border-gray-100 px-2 bg-white">
                    <div className="flex items-center gap-2">
                      {prop.images?.[0]
                        ? <img src={prop.images[0]} className="w-7 h-7 rounded-lg object-cover flex-shrink-0" alt="" />
                        : <div className="w-7 h-7 rounded-lg flex-shrink-0 text-xs flex items-center justify-center"
                            style={{ backgroundColor: color.bg, color: color.bar }}>🏠</div>}
                      <span className="text-xs font-semibold text-gray-700 truncate leading-tight">{prop.name}</span>
                    </div>
                  </td>

                  {/* Segments */}
                  {segments.map((seg, si) => {
                    if (seg.type === 'resv') {
                      const c = PROP_COLORS[seg.colorIdx]
                      const firstName = seg.resv.guestName.split(' ')[0]
                      const srcLabel = seg.resv.source ? (SOURCE_LABEL[seg.resv.source] || seg.resv.source) : 'Client'
                      return (
                        <td key={si} colSpan={seg.span}
                          className="border-r border-gray-50 p-0.5 cursor-pointer"
                          onClick={() => setSelected(selected?.id === seg.resv.id ? null : seg.resv)}>
                          <div className="h-full rounded-lg flex items-center px-2 gap-1 overflow-hidden"
                            style={{ backgroundColor: selected?.id === seg.resv.id ? c.bar : c.bg, border: `1.5px solid ${c.bar}`, height: 34 }}>
                            <span className="text-[11px] font-bold truncate"
                              style={{ color: selected?.id === seg.resv.id ? 'white' : c.text }}>
                              {seg.span >= 2 ? firstName : ''}
                            </span>
                            {seg.span >= 3 && (
                              <span className="text-[10px] opacity-70 truncate"
                                style={{ color: selected?.id === seg.resv.id ? 'white' : c.text }}>
                                · {srcLabel}
                              </span>
                            )}
                          </div>
                        </td>
                      )
                    }

                    if (seg.type === 'blocked') {
                      const label = SOURCE_LABEL[seg.source] || 'Fermé'
                      return (
                        <td key={si} colSpan={seg.span} className="border-r border-gray-50 p-0.5">
                          <div className="h-full rounded-lg flex items-center px-2 overflow-hidden"
                            style={{ backgroundColor: '#fee2e2', border: '1.5px solid #fca5a5', height: 34 }}>
                            <span className="text-[10px] font-semibold text-red-500 truncate">
                              {seg.span >= 2 ? label : ''}
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
      <div className="px-5 py-3 border-t border-gray-50 flex flex-wrap gap-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="w-8 h-3.5 rounded" style={{ backgroundColor: '#dbeafe', border: '1.5px solid #2563eb' }} />
          <span>Direct</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="w-8 h-3.5 rounded" style={{ backgroundColor: '#fee2e2', border: '1.5px solid #fca5a5' }} />
          <span>Bloqué (iCal)</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="w-4 h-3.5 rounded bg-gray-100 border border-gray-200" />
          <span>Disponible</span>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-black text-sm flex-shrink-0">
              {selected.guestName[0].toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-gray-900">{selected.guestName}</div>
              <div className="text-sm text-gray-500">{selected.guestEmail}</div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(selected.checkIn).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                {' → '}
                {new Date(selected.checkOut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                {' · '}{selected.nights} nuit{selected.nights > 1 ? 's' : ''}
                {selected.source && ` · ${SOURCE_LABEL[selected.source] || selected.source}`}
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
