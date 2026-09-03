// Crée en une fois les 6 Price Stripe du plan Hôtel (voir lib/hotelTiers.ts) et affiche les
// lignes à coller dans les variables d'environnement Vercel. Ne modifie rien dans l'app —
// script à lancer une seule fois, à la main, avec votre propre clé secrète Stripe.
//
// Usage :
//   STRIPE_SECRET_KEY=sk_live_xxx node scripts/create-hotel-stripe-prices.mjs
//
// (remplacez par sk_test_xxx pour créer les prix en mode test d'abord, recommandé)

import Stripe from 'stripe'

const secretKey = process.env.STRIPE_SECRET_KEY
if (!secretKey) {
  console.error('❌ Variable STRIPE_SECRET_KEY manquante. Lancez :')
  console.error('   STRIPE_SECRET_KEY=sk_live_xxx node scripts/create-hotel-stripe-prices.mjs')
  process.exit(1)
}

const stripe = new Stripe(secretKey)

const TIERS = [
  { envVar: 'STRIPE_PRICE_HOTEL_10', amount: 5900, label: 'Hôtel — 1 à 10 chambres' },
  { envVar: 'STRIPE_PRICE_HOTEL_15', amount: 8900, label: 'Hôtel — 11 à 15 chambres' },
  { envVar: 'STRIPE_PRICE_HOTEL_20', amount: 12000, label: 'Hôtel — 16 à 20 chambres' },
  { envVar: 'STRIPE_PRICE_HOTEL_30', amount: 16000, label: 'Hôtel — 21 à 30 chambres' },
  { envVar: 'STRIPE_PRICE_HOTEL_50', amount: 19900, label: 'Hôtel — 31 à 50 chambres' },
  { envVar: 'STRIPE_PRICE_HOTEL_MAX', amount: 25000, label: 'Hôtel — 50+ chambres' },
]

async function main() {
  console.log('Création du produit "StayDirect — Plan Hôtel"...')
  const product = await stripe.products.create({
    name: 'StayDirect — Plan Hôtel',
    description: 'Abonnement StayDirect pour hôtels et résidences, tarif selon le nombre de chambres.',
  })

  const results = []
  for (const tier of TIERS) {
    const price = await stripe.prices.create({
      product: product.id,
      currency: 'eur',
      unit_amount: tier.amount,
      recurring: { interval: 'month' },
      nickname: tier.label,
    })
    console.log(`✓ ${tier.label} — ${(tier.amount / 100).toFixed(0)}€/mois — ${price.id}`)
    results.push({ ...tier, priceId: price.id })
  }

  console.log('\n─── À coller dans les variables d\'environnement Vercel ───\n')
  for (const r of results) {
    console.log(`${r.envVar}=${r.priceId}`)
  }
  console.log('')
}

main().catch(err => {
  console.error('❌ Erreur:', err.message)
  process.exit(1)
})
