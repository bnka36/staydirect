'use client'
import { useState, useEffect } from 'react'
import RoomUnitsManager, { RoomUnit } from './RoomUnitsManager'
import RoomPlanningGrid, { PlanningReservation } from './RoomPlanningGrid'

interface Property {
  id: string
  name: string
  pricePerNight: number
  maxGuests: number
}

export default function RoomsPlanningTab({ properties }: { properties: Property[] }) {
  const [propertyId, setPropertyId] = useState(properties[0]?.id || '')
  const [roomUnits, setRoomUnits] = useState<RoomUnit[]>([])
  const [reservations, setReservations] = useState<PlanningReservation[]>([])
  const [loading, setLoading] = useState(true)

  const property = properties.find(p => p.id === propertyId)

  const fetchData = async (pid: string) => {
    if (!pid) { setLoading(false); return }
    setLoading(true)
    const [roomsRes, resvRes] = await Promise.all([
      fetch(`/api/room-units?propertyId=${pid}`),
      fetch('/api/reservations'),
    ])
    setRoomUnits(await roomsRes.json())
    const allResv: (PlanningReservation & { propertyId?: string; property?: { id: string } })[] = await resvRes.json()
    setReservations(allResv.filter(r => r.propertyId === pid || r.property?.id === pid))
    setLoading(false)
  }

  useEffect(() => { fetchData(propertyId) }, [propertyId])

  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
        <div className="text-4xl mb-3">🛏️</div>
        <p>Ajoutez d&apos;abord un logement pour gérer son planning de chambres</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {properties.length > 1 && (
        <select value={propertyId} onChange={e => setPropertyId(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      )}

      {loading ? (
        <div className="py-10 text-center text-gray-400">Chargement...</div>
      ) : property ? (
        <>
          <RoomUnitsManager
            propertyId={property.id}
            roomUnits={roomUnits}
            basePrice={property.pricePerNight}
            baseMaxGuests={property.maxGuests}
            onChanged={() => fetchData(property.id)}
          />
          <RoomPlanningGrid
            propertyId={property.id}
            roomUnits={roomUnits}
            reservations={reservations}
            basePrice={property.pricePerNight}
            onChanged={() => fetchData(property.id)}
          />
        </>
      ) : null}
    </div>
  )
}
