export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { createHmac } from 'crypto'

function verifyState(state: string): string | null {
  const [userId, mac] = state.split('.')
  if (!userId || !mac) return null
  const secret = process.env.NEXTAUTH_SECRET!
  const expected = createHmac('sha256', secret).update(userId).digest('hex').slice(0, 16)
  return mac === expected ? userId : null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code || !state) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?stripe_error=missing_params`)
  }

  const userId = verifyState(state)
  if (!userId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?stripe_error=invalid_state`)
  }

  try {
    const response = await getStripe().oauth.token({ grant_type: 'authorization_code', code })
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
