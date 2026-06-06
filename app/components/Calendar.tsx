'use client'
import { useState } from 'react'
import { formatDate } from '@/lib/utils'

interface Reservation {
  id: string
  guestName: string
  checkIn: string
  checkOut: string
  status: string
  totalPrice: number
  property?: { name: string }
}

interface BlockedDate {
  date: string
  source: string
}

interface CalendarProps {
  reservations: Reservation[]
  blockedDates?: BlockedDate[]
  propertyName?: string
}

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export default function Calendar({ reservations, blockedDates = [] }: CalendarProps) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())

  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)
  const startDayOfWeek = (firstDay.getDay() + 6) % 7 // Lundi = 0

  const days = []
  for (let i = 0; i < startDayOfWeek; i++) days.push(null)
  for (let i = 1; i <= lastDay.getDate(); i++) days.push(i)

  const getDateStatus = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    const dateStr = date.toISOString().split('T')[0]

    // Vérifier réservations confirmées
    const reservation = reservations.find(r => {
      if (r.status === 'cancelled') return false
      const checkIn = new Date(r.checkIn).toISOString().split('T')[0]
      const checkOut = new Date(r.checkOut).toISOString().split('T')[0]
      return dateStr >= checkIn && dateStr < checkOut
    })
    if (reservation) return { type: 'reserved', reservation }

    // Vérifier dates bloquées iCal
    const blocked = blockedDates.find(b => b.date.split('T')[0] === dateStr)
    if (blocked) return { type: 'blocked', source: blocked.source }

    return { type: 'available' }
  }

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition">←</button>
        <h3 className="font-semibold text-gray-900">{MONTHS[currentMonth]} {currentYear}</h3>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition">→</button>
      </div>

      {/* Légende */}
      <div className="flex gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-blue-500"></div><span className="text-gray-500">Réservé (direct)</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-orange-400"></div><span className="text-gray-500">Airbnb/Booking</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-gray-100"></div><span className="text-gray-500">Disponible</span></div>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7 gap-1 relative">
        {days.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />
          const status = getDateStatus(day)
          const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()

          let bgClass = 'hover:bg-gray-50'
          if (status.type === 'reserved') bgClass = 'bg-blue-500 text-white'
          else if (status.type === 'blocked') bgClass = 'bg-orange-400 text-white'

          return (
            <div
              key={day}
              className={`aspect-square flex items-center justify-center text-sm rounded-lg cursor-default transition ${bgClass} ${isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
              onMouseEnter={(e) => {
                if (status.type === 'reserved' && status.reservation) {
                  setTooltip({
                    text: `${status.reservation.guestName} — ${status.reservation.property?.name || ''}`,
                    x: e.clientX,
                    y: e.clientY,
                  })
                } else if (status.type === 'blocked') {
                  setTooltip({ text: `Bloqué (${status.source})`, x: e.clientX, y: e.clientY })
                }
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              {day}
            </div>
          )
        })}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg pointer-events-none"
          style={{ left: tooltip.x + 10, top: tooltip.y - 30 }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Résumé du mois */}
      <div className="mt-4 pt-4 border-t border-gray-50 flex gap-4 text-sm text-gray-500">
        <span>
          {reservations.filter(r => {
            const ci = new Date(r.checkIn)
            return ci.getMonth() === currentMonth && ci.getFullYear() === currentYear && r.status === 'confirmed'
          }).length} réservation(s) ce mois
        </span>
      </div>
    </div>
  )
}
