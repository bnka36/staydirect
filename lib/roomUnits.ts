import { prisma } from '@/lib/prisma'

// Un logement est "multi-unités" (hôtel, résidence...) dès qu'il a au moins une RoomUnit
// active. Un logement simple (meublé classique) n'en a aucune et garde l'ancien
// fonctionnement (BlockedDate + une seule réservation à la fois sur le Property).
export async function getActiveRoomUnitCount(propertyId: string): Promise<number> {
  return prisma.roomUnit.count({ where: { propertyId, isActive: true } })
}

// Nombre de réservations confirmées qui chevauchent la période, tous logements confondus
// (peu importe la chambre attribuée) — c'est ce nombre qu'on compare au nombre de chambres
// actives pour savoir s'il reste de la place.
export async function countOverlappingReservations(propertyId: string, checkIn: Date, checkOut: Date, excludeReservationId?: string): Promise<number> {
  return prisma.reservation.count({
    where: {
      propertyId,
      status: 'confirmed',
      ...(excludeReservationId ? { id: { not: excludeReservationId } } : {}),
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
    },
  })
}
