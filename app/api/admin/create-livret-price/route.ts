export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

// Endpoint temporaire — créer le produit Stripe "Livret" à 2.99€/mois
// Appeler une seule fois puis supprimer
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('secret') !== 'create-livret-2024') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const stripe = getStripe()

  // Créer le produit
  const product = await stripe.products.create({
    name: 'Livret d\'accueil QR Code',
    description: 'Livret numérique personnalisé accessible par QR code pour vos voyageurs',
    metadata: { plan: 'livret' },
  })

  // Créer le prix récurrent 2.99€/mois
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 299,
    currency: 'eur',
    recurring: { interval: 'month' },
    nickname: 'Livret QR — 2.99€/mois',
  })

  return NextResponse.json({
    ok: true,
    productId: product.id,
    priceId: price.id,
    message: `✅ Ajouter STRIPE_PRICE_LIVRET=${price.id} dans les variables Vercel`,
  })
}
