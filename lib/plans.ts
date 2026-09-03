// Source unique de vérité pour la correspondance plan StayDirect <-> Price Stripe.
// Utilisé à la fois pour créer un abonnement (billing/subscribe) et pour resynchroniser
// le plan de l'utilisateur quand Stripe nous notifie d'un changement (webhook).
export const PLAN_PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER!,
  pro: process.env.STRIPE_PRICE_PRO!,
  business: process.env.STRIPE_PRICE_BUSINESS!,
  livret: process.env.STRIPE_PRICE_LIVRET!,
  hotel: process.env.STRIPE_PRICE_HOTEL!,
}

export function planFromPriceId(priceId: string): string | null {
  const entry = Object.entries(PLAN_PRICE_IDS).find(([, id]) => id === priceId)
  return entry ? entry[0] : null
}
