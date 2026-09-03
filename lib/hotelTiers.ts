// Paliers tarifaires du plan Hôtel selon le nombre de chambres. Fichier sans lecture d'env
// var — importable côté client (page pricing) et côté serveur (résolution du vrai Price
// Stripe dans lib/plans.ts). Les noms de variables d'env ne sont pas des secrets, seule
// leur valeur résolue (process.env[...]) doit rester côté serveur.
export interface HotelTier {
  maxRooms: number | null // null = dernier palier, sans plafond
  envVar: string          // nom de la variable d'env contenant le Price ID Stripe
  displayPrice: number     // prix affiché sur /pricing (doit correspondre au Price Stripe)
}

export const HOTEL_TIERS: HotelTier[] = [
  { maxRooms: 10, envVar: 'STRIPE_PRICE_HOTEL_10', displayPrice: 59 },
  { maxRooms: 15, envVar: 'STRIPE_PRICE_HOTEL_15', displayPrice: 89 },
  { maxRooms: 20, envVar: 'STRIPE_PRICE_HOTEL_20', displayPrice: 120 },
  { maxRooms: 30, envVar: 'STRIPE_PRICE_HOTEL_30', displayPrice: 160 },
  { maxRooms: 50, envVar: 'STRIPE_PRICE_HOTEL_50', displayPrice: 199 },
  { maxRooms: null, envVar: 'STRIPE_PRICE_HOTEL_MAX', displayPrice: 250 },
]

export function hotelTierForRoomCount(count: number): HotelTier {
  return HOTEL_TIERS.find(t => t.maxRooms === null || count <= t.maxRooms) || HOTEL_TIERS[HOTEL_TIERS.length - 1]
}
