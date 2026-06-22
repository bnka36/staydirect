export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const userId = searchParams.get('state')

  if (!code || !userId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?stripe_error=missing_params`)
  }

  try {
    const response = await stripe.oauth.token({ grant_type: 'authorization_code', code })
    const connectedAccountId = response.stripe_user_id

    await prisma.user.update({
      where: { id: userId },
      data: { stripeConnectId: connectedAccountId },
    })

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?stripe_connected=true`)
  } catch {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?stripe_error=oauth_failed`)
  }
}
