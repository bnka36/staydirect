import { prisma } from '@/lib/prisma'

// Recherche un code promo voyageur valide pour ce logement : propre au logement, ou global
// à l'hôte (propertyId null), actif, non expiré, pas encore épuisé.
export async function findValidGuestPromoCode(userId: string, propertyId: string, code: string) {
  const normalized = code.trim().toUpperCase()
  if (!normalized) return null

  const promo = await prisma.guestPromoCode.findFirst({
    where: {
      userId,
      code: normalized,
      isActive: true,
      OR: [{ propertyId }, { propertyId: null }],
    },
  })

  if (!promo) return null
  if (promo.expiresAt && promo.expiresAt < new Date()) return null
  if (promo.maxUses !== null && promo.uses >= promo.maxUses) return null

  return promo
}

export function applyGuestPromoDiscount(amount: number, promo: { discountPercent: number | null; discountAmount: number | null }): number {
  let discount = 0
  if (promo.discountPercent) discount += Math.round(amount * promo.discountPercent) / 100
  if (promo.discountAmount) discount += promo.discountAmount
  return Math.min(amount, Math.round(discount * 100) / 100)
}
