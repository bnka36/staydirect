'use client'
import { useState, useMemo } from 'react'

interface Reservation {
  id: string
  guestName: string
  checkIn: string
  checkOut: string
  status: string
  totalPrice: number
  nights: number
  property?: { name: string }
}

interface BlockedDate {
  date: string
  source: string
  propertyName?: string
}

interface CalendarProps {
  reservations: Reservation[]
  blockedDates?: BlockedDate[]
  propertyName?: string
}

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const COLORS = [
  { bg: '#2563eb', light: '#dbeafe' },
  { bg: '#7c3aed', light: '#ede9fe' },
  { bg: '#059669', light: '#d1fae5' },
  { bg: '#dc2626', light: '#fee2e2' },
  { bg: '#d97706', light: '#fef3c7' },
  { bg: '#0891b2', light: '#cffafe' },
]

const BLOCKED_COLORS = [
  { bg: '#ea580c', light: '#fed7aa' },
  { bg: '#9333ea', light: '#f3e8ff' },
  { bg: '#0f766e', light: '#ccfbf1' },
  { bg: '#b45309', light: '#fef3c7' },
  { bg: '#be185d', light: '#fce7f3' },
  { bg: '#1d4ed8', light: '#dbeafe' },
]

function toDateStr(d: Date) {
  return d.toISOString().split('T')[0]
}

function getSourceLabel(source: string) {
  const s = source.toLowerCase()
  if (s.includes('airbnb')) return 'Airbnb'
  if (s.includes('booking')) return 'Booking'
  return 'iCal'
}

function abbr(name: string) {
  return name.split(' ').map((w: string) => w[0]).join('').substring(0, 3).toUpperCase()
}

export default function Calendar({ reservations, blockedDates = [] }: CalendarProps) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null)
  const [filterProperty, setFilterProperty] = useState<string>('all')

  const confirmedReservations = reservations.filter(r => r.status === 'confirmed')

  const resColors = new Map<string, typeof COLORS[0]>()
  confirmedReservations.forEach((r, i) => {
    resColors.set(r.id, COLORS[i % COLORS.length])
  })

  const propertyNames = useMemo(() => {
    const names = Array.from(new Set(blockedDates.map(b => b.propertyName || '').filter(Boolean)))
    return names
  }, [blockedDates])

  const blockedPropertyColors = useMemo(() => {
    const map = new Map<string, typeof BLOCKED_COLORS[0]>()
    propertyNames.forEach((name, i) => {
      map.set(name, BLOCKED_COLORS[i % BLOCKED_COLORS.length])
    })
    return map
  }, [propertyNames])

  const allProperties = useMemo(() => {
    const set = new Set<string>()
    confirmedReservations.forEach(r => { if (r.property?.name) set.add(r.property.name) })
    propertyNames.forEach(n => set.add(n))
    return Array.from(set)
  }, [confirmedReservations, propertyNames])

  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)
  const startDow = (firstDay.getDay() + 6) % 7

  const days: (number | null)[] = []
  for (let i = 0; i < startDow; i++) days.push(null)
  for (let i = 1; i <= lastDay.getDate(); i++) days.push(i)

  const filteredBlocked = filterProperty === 'all'
    ? blockedDates
    : blockedDates.filter(b => b.propertyName === filterProperty)

  const filteredReservations = filterProperty === 'all'
    ? confirmedReservations
    : confirmedReservations.filter(r => r.property?.name === filterProperty)

  const getDayInfo = (day: number) => {
    const dateStr = toDateStr(new Date(currentYear, currentMonth, day))

    const reservation = filteredReservations.find(r => {
      const ci = new Date(r.checkIn).toISOString().split('T')[0]
      const co = new Date(r.checkOut).toISOString().split('T')[0]
      return dateStr >= ci && dateStr < co
    })

    if (reservation) {
      const ci = new Date(reservation.checkIn).toISOString().split('T')[0]
      const coDate = new Date(reservation.checkOut)
      coDate.setDate(coDate.getDate() - 1)
      const lastNight = toDateStr(coDate)
      return {
        type: 'reserved' as const,
        reservation,
        isCheckIn: dateStr === ci,
        isCheckOut: dateStr === lastNight,
        isFirst: dateStr === ci || day === 1,
        color: resColors.get(reservation.id)!,
      }
    }

    const blocked = filteredBlocked.find(b => b.date.split('T')[0] === dateStr)
    if (blocked) return {
      type: 'blocked' as const,
      source: blocked.source,
      propertyName: blocked.propertyName,
      color: blockedPropertyColors.get(blocked.propertyName || '') || BLOCKED_COLORS[0],
    }

    return { type: 'available' as const }
  }

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const monthCount = filteredReservations.filter(r => {
    const ci = new Date(r.checkIn)
    return ci.getMonth() === currentMonth && ci.getFullYear() === currentYear
  }).length

  const monthRevenue = filteredReservations
    .filter(r => {
      const ci = new Date(r.checkIn)
      return ci.getMonth() === currentMonth && ci.getFullYear() === currentYear
    })
    .reduce((sum, r) => sum + r.totalPrice, 0)

  const monthBlocked = filteredBlocked.filter(b => {
    const d = new Date(b.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  }).length

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <button onClick={prevMonth} className="w-9 h-9 hover:bg-gray-100 rounded-xl flex items-center justify-center transition text-gray-600 font-bold">{'‹'}</button>
        <div className="text-center">
          <div className="font-bold text-gray-900">{MONTHS[currentMonth]} {currentYear}</div>
          <div className="text-xs text-gray-400">
            {monthCount} réservation{monthCount > 1 ? 's' : ''} {'·'} {monthBlocked} nuit{monthBlocked > 1 ? 's' : ''} ext.
            {monthRevenue > 0 ? ` · ${monthRevenue.toFixed(0)}€` : ''}
          </div>
        </div>
        <button onClick={nextMonth} className="w-9 h-9 hover:bg-gray-100 rounded-xl flex items-center justify-center transition text-gray-600 font-bold">{'›'}</button>
      </div>

      {allProperties.length > 1 && (
        <div className="px-6 py-2 border-b border-gray-50">
          <select
            value={filterProperty}
            onChange={e => setFilterProperty(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:border-blue-400 w-full"
          >
            <option value="all">Tous les logements</option>
            {allProperties.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="p-4">
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            if (!day) return <div key={`e-${i}`} className="h-16" />
            const info = getDayInfo(day)
            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()

            if (info.type === 'reserved') {
              const { reservation, isCheckIn, color, isFirst } = info
              const firstName = reservation.guestName.split(' ')[0]
              return (
                <div key={day} className="h-16 relative cursor-pointer group"
                  onClick={() => setSelectedRes(selectedRes?.id === reservation.id ? null : reservation)}>
                  <div className="absolute top-6 bottom-2 left-0 right-0 flex items-center transition-opacity group-hover:opacity-80"
                    style={{ backgroundColor: color.light, marginLeft: isCheckIn ? '4px' : '0', borderRadius: isCheckIn ? '8px 0 0 8px' : '0' }}>
                    {isCheckIn && <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg" style={{ backgroundColor: color.bg }} />}
                    {isFirst && <span className="text-xs font-bold truncate pl-2 pr-1" style={{ color: color.bg }}>{firstName}</span>}
                  </div>
                  <div className={`absolute top-1 left-0 right-0 text-center text-xs font-medium ${isToday ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>
                    {isToday ? <span className="inline-flex w-5 h-5 bg-blue-600 text-white rounded-full items-center justify-center text-xs font-bold">{day}</span> : day}
                  </div>
                </div>
              )
            }

            if (info.type === 'blocked') {
              const src = getSourceLabel(info.source)
              const propShort = info.propertyName ? abbr(info.propertyName) : ''
              const color = info.color
              return (
                <div key={day} className="h-16 relative" title={`${info.propertyName || ''} - ${src}`}>
                  <div className="absolute top-6 bottom-2 left-0.5 right-0.5 rounded flex flex-col items-center justify-center gap-0.5 overflow-hidden"
                    style={{ backgroundColor: color.light }}>
                    <span className="text-[9px] font-bold leading-none" style={{ color: color.bg }}>{src}</span>
                    {propShort && <span className="text-[8px] leading-none font-medium" style={{ color: color.bg }}>{propShort}</span>}
                  </div>
                  <div className="absolute top-1 left-0 right-0 text-center text-xs text-gray-400">{day}</div>
                </div>
              )
            }

            return (
              <div key={day} className="h-16 relative hover:bg-gray-50 rounded-lg transition">
                <div className={`absolute top-1 left-0 right-0 text-center text-xs font-medium ${isToday ? '' : 'text-gray-700'}`}>
                  {isToday ? <span className="inline-flex w-5 h-5 bg-blue-600 text-white rounded-full items-center justify-center text-xs font-bold">{day}</span> : day}
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex gap-3 mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-100 border-l-2 border-blue-600" />
            <span>Direct</span>
          </div>
          {propertyNames.map((name, i) => {
            const c = BLOCKED_COLORS[i % BLOCKED_COLORS.length]
            return (
              <div key={name} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: c.light, borderLeft: `2px solid ${c.bg}` }} />
                <span>{name}</span>
              </div>
            )
          })}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200" />
            <span>Disponible</span>
          </div>
        </div>
      </div>

      {selectedRes && (
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-bold text-gray-900">{selectedRes.guestName}</div>
              <div className="text-sm text-gray-500 mt-1">
                {new Date(selectedRes.checkIn).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} {'→'}{' '}
                {new Date(selectedRes.checkOut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} {'·'} {selectedRes.nights} nuit{selectedRes.nights > 1 ? 's' : ''}
              </div>
              {selectedRes.property?.name && (
                <div className="text-xs text-gray-400 mt-0.5">{'\u{1F3E0}'} {selectedRes.property.name}</div>
              )}
            </div>
            <div className="text-right">
              <div className="font-black text-lg text-green-600">{selectedRes.totalPrice.toFixed(2)}{'€'}</div>
              <div className="text-xs text-gray-400">encaissé</div>
            </div>
          </div>
          <button onClick={() => setSelectedRes(null)} className="mt-3 text-xs text-gray-400 hover:text-gray-600">Fermer {'✕'}</button>
        </div>
      )}
    </div>
  )
}
