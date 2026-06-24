'use client'
import { useState, useRef } from 'react'

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
const DAYS_SHORT = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

const PROP_COLORS = [
  { bar: '#2563eb', bg: '#eff6ff', text: '#1d4ed8' },
  { bar: '#7c3aed', bg: '#f5f3ff', text: '#6d28d9' },
  { bar: '#059669', bg: '#ecfdf5', text: '#047857' },
  { bar: '#dc2626', bg: '#fef2f2', text: '#b91c1c' },
  { bar: '#d97706', bg: '#fffbeb', text: '#b45309' },
  { bar: '#0891b2', bg: '#ecfeff', text: '#0e7490' },
]

const SOURCE_ICON: Record<string, string> = {
  airbnb: '🏠', booking: '🔵', abritel: '🏡', direct: '✅', ical: '📅',
}

function fmt(d: Date) {
  return d.toISOString().split('T')[0]
}

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

export default function PMSCalendar({ properties, reservations, blockedDates = [] }: Props) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [monthOffset, setMonthOffset] = useState(0)
  const [selected, setSelected] = useState<Reservation | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const displayDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
  const year = displayDate.getFullYear()
  const month = displayDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const confirmedResvs = reservations.filter(r => r.status === 'confirmed')

  const PROP_ROW_H = 56 // px
  const DAY_W = 40 // px per day
  const LABEL_W = 160 // px for property name column

  const getResvForProperty = (propId: string) =>
    confirmedResvs.filter(r =>
      r.propertyId === propId || r.property?.id === propId
    )

  const getBlockedForProperty = (propId: string, propName: string) =>
    blockedDates.filter(b =>
      b.propertyId === propId || b.propertyName === propName
    )

  const isWeekend = (day: number) => {
    const dow = new Date(year, month, day).getDay()
    return dow === 0 || dow === 6
  }

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const todayOffset = (() => {
    if (month === today.getMonth() && year === today.getFullYear()) {
      return today.getDate() - 1
    }
    return -1
  })()

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => setMonthOffset(o => o - 1)}
            className="w-8 h-8 hover:bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-bold transition text-lg">‹</button>
          <div>
            <div className="font-bold text-gray-900 text-base">{MONTHS[month]} {year}</div>
            <div className="text-xs text-gray-400">{properties.length} logement{properties.length > 1 ? 's' : ''}</div>
          </div>
          <button onClick={() => setMonthOffset(o => o + 1)}
            className="w-8 h-8 hover:bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-bold transition text-lg">›</button>
        </div>
        <button onClick={() => setMonthOffset(0)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">
          Aujourd'hui
        </button>
      </div>

      {/* Scrollable grid */}
      <div className="overflow-x-auto" ref={scrollRef}>
        <div style={{ minWidth: LABEL_W + DAY_W * daysInMonth }}>

          {/* Day headers */}
          <div className="flex sticky top-[69px] z-10 bg-white border-b border-gray-100">
            <div style={{ width: LABEL_W, minWidth: LABEL_W }}
              className="flex-shrink-0 text-xs font-semibold text-gray-400 px-4 py-2 border-r border-gray-100 bg-white">
              Logement
            </div>
            {days.map(d => (
              <div key={d}
                style={{ width: DAY_W, minWidth: DAY_W }}
                className={`flex-shrink-0 flex flex-col items-center justify-center py-1.5 border-r border-gray-50
                  ${isToday(d) ? 'bg-blue-600 text-white' : isWeekend(d) ? 'bg-gray-50 text-gray-500' : 'text-gray-600'}`}>
                <span className="text-[10px] leading-none">{DAYS_SHORT[new Date(year, month, d).getDay()]}</span>
                <span className={`text-xs font-bold leading-tight ${isToday(d) ? 'text-white' : ''}`}>{d}</span>
              </div>
            ))}
          </div>

          {/* Property rows */}
          {properties.map((prop, pi) => {
            const color = PROP_COLORS[pi % PROP_COLORS.length]
            const propResvs = getResvForProperty(prop.id)
            const propBlocked = getBlockedForProperty(prop.id, prop.name)

            // Group consecutive blocked dates into spans
            const blockedDays = propBlocked
              .map(b => new Date(b.date))
              .filter(d => d.getMonth() === month && d.getFullYear() === year)
              .map(d => d.getDate())
              .sort((a, b) => a - b)

            const blockedSpans: { startDay: number; endDay: number; source: string }[] = []
            let i = 0
            while (i < blockedDays.length) {
              const start = blockedDays[i]
              let end = start
              while (i + 1 < blockedDays.length && blockedDays[i + 1] === blockedDays[i] + 1) {
                i++
                end = blockedDays[i]
              }
              const src = propBlocked.find(b => new Date(b.date).getDate() === start)?.source || 'ical'
              blockedSpans.push({ startDay: start, endDay: end + 1, source: src })
              i++
            }

            // Build reservation bars
            const bars: { resv: Reservation; startDay: number; endDay: number }[] = []
            propResvs.forEach(r => {
              const ci = new Date(r.checkIn)
              ci.setHours(0, 0, 0, 0)
              const co = new Date(r.checkOut)
              co.setHours(0, 0, 0, 0)
              const monthStart = new Date(year, month, 1)
              const monthEnd = new Date(year, month + 1, 0) // last day of month

              if (co <= monthStart || ci > monthEnd) return

              const startDay = ci < monthStart ? 1 : ci.getDate()
              const endDay = co > monthEnd ? daysInMonth + 1 : co.getDate()

              bars.push({ resv: r, startDay, endDay })
            })

            return (
              <div key={prop.id} className="flex border-b border-gray-50 group relative"
                style={{ height: PROP_ROW_H }}>
                {/* Property label */}
                <div style={{ width: LABEL_W, minWidth: LABEL_W }}
                  className="flex-shrink-0 flex items-center gap-2.5 px-3 border-r border-gray-100 bg-white sticky left-0 z-10">
                  {prop.images?.[0]
                    ? <img src={prop.images[0]} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" alt="" />
                    : <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-sm"
                        style={{ backgroundColor: color.bg, color: color.bar }}>🏠</div>
                  }
                  <span className="text-xs font-semibold text-gray-700 leading-tight truncate">{prop.name}</span>
                </div>

                {/* Day cells */}
                <div className="flex flex-1 relative">
                  {days.map(d => {
                    return (
                      <div key={d}
                        style={{ width: DAY_W, minWidth: DAY_W }}
                        className={`flex-shrink-0 h-full border-r border-gray-50 relative
                          ${isToday(d) ? 'bg-blue-50/60' : isWeekend(d) ? 'bg-gray-50/50' : ''}`}>

                      </div>
                    )
                  })}

                  {/* Today line */}
                  {todayOffset >= 0 && (
                    <div className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-20 pointer-events-none"
                      style={{ left: todayOffset * DAY_W + DAY_W / 2 }} />
                  )}

                  {/* Blocked date bars */}
                  {blockedSpans.map(({ startDay, endDay, source }, idx) => {
                    const left = (startDay - 1) * DAY_W + 2
                    const width = (endDay - startDay) * DAY_W - 4
                    if (width <= 0) return null
                    const srcIcon = SOURCE_ICON[source] || '🔒'
                    const srcLabel = source === 'airbnb' ? 'Airbnb' : source === 'booking' ? 'Booking' : source === 'abritel' ? 'Abritel' : 'Fermé'
                    return (
                      <div key={`blocked-${idx}`}
                        className="absolute top-2 bottom-2 rounded-lg flex items-center px-2 gap-1 overflow-hidden pointer-events-none"
                        style={{ left, width, backgroundColor: '#fee2e2', border: '1.5px solid #fca5a5' }}>
                        <span className="text-[10px] flex-shrink-0">{srcIcon}</span>
                        {width > 40 && <span className="text-[10px] font-semibold text-red-500 truncate">{srcLabel}</span>}
                      </div>
                    )
                  })}

                  {/* Reservation bars */}
                  {bars.map(({ resv, startDay, endDay }) => {
                    const left = (startDay - 1) * DAY_W + 2
                    const width = (endDay - startDay) * DAY_W - 4
                    const src = resv.source || 'direct'
                    const isSelected = selected?.id === resv.id
                    const srcIcon = SOURCE_ICON[src] || '✅'
                    const firstName = resv.guestName.split(' ')[0]

                    return (
                      <div key={resv.id}
                        className="absolute top-2 bottom-2 rounded-lg cursor-pointer transition-all hover:shadow-md hover:scale-y-105 z-10 flex items-center px-2 gap-1.5 overflow-hidden"
                        style={{
                          left,
                          width,
                          backgroundColor: isSelected ? color.bar : color.bg,
                          border: `1.5px solid ${color.bar}`,
                          color: isSelected ? 'white' : color.text,
                        }}
                        onClick={() => setSelected(isSelected ? null : resv)}>
                        <span className="text-[11px] flex-shrink-0">{srcIcon}</span>
                        {width > 50 && (
                          <span className="text-[11px] font-bold truncate">{firstName}</span>
                        )}
                        {width > 100 && (
                          <span className="text-[10px] opacity-70 truncate">
                            {resv.totalPrice > 0 ? `${resv.totalPrice}€` : ''}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {properties.length === 0 && (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
              Aucun logement configuré
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-t border-gray-50 flex flex-wrap gap-4 items-center">
        {Object.entries(SOURCE_ICON).map(([src, icon]) => (
          <div key={src} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>{icon}</span>
            <span className="capitalize">{src === 'direct' ? 'Direct' : src === 'airbnb' ? 'Airbnb' : src === 'booking' ? 'Booking' : src}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="w-3 h-3 rounded bg-red-100" />
          <span>Bloqué</span>
        </div>
      </div>

      {/* Reservation detail panel */}
      {selected && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-black text-sm flex-shrink-0">
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
                {selected.source && ` · ${SOURCE_ICON[selected.source] || ''} ${selected.source}`}
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
              className="mt-2 text-xs text-gray-400 hover:text-gray-700">Fermer ✕</button>
          </div>
        </div>
      )}
    </div>
  )
}
