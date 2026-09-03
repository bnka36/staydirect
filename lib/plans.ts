import { HOTEL_TIERS } from './hotelTiers'

// Source unique de vérité pour la correspondance plan StayDirect <-> Price Stripe.
// Utilisé à la fois pour créer un abonnement (billing/subscribe) et pour resynchroniser
// le plan de l'utilisateur quand Stripe nous notifie d'un changement (webhook).
// Le plan "hotel" a plusieurs Price Stripe possibles selon le nombre de chambres
// (voir HOTEL_TIERS) — ils ne sont donc pas listés ici mais résolus séparément.
export const PLAN_PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER!,
  pro: process.env.STRIPE_PRICE_PRO!,
  business: process.env.STRIPE_PRICE_BUSINESS!,
  livret: process.env.STRIPE_PRICE_LIVRET!,
}

export function planFromPriceId(priceId: string): string | null {
  const entry = Object.entries(PLAN_PRICE_IDS).find(([, id]) => id === priceId)
  if (entry) return entry[0]
  if (HOTEL_TIERS.some(t => process.env[t.envVar] === priceId)) return 'hotel'
  return null
}
