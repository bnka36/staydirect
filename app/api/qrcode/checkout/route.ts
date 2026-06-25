import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

export async function POST(req: Request) {
  const { url, email } = await req.json()

  if (!url || !email) {
    return NextResponse.json({ error: 'URL et email requis' }, { status: 400 })
  }

  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'QR Code personnalisé',
            description: 'QR Code à vos couleurs — livré par email immédiatement',
          },
          unit_amount: 299,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    metadata: { url, email },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/qrcode/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/qrcode`,
  })

  return NextResponse.json({ url: session.url })
}
