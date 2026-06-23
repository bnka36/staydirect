export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createHmac } from 'crypto'

function signState(userId: string): string {
  const secret = process.env.NEXTAUTH_SECRET!
  const mac = createHmac('sha256', secret).update(userId).digest('hex').slice(0, 16)
  return `${userId}.${mac}`
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const clientId = process.env.STRIPE_CONNECT_CLIENT_ID!
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/billing/connect/callback`

  const url = new URL('https://connect.stripe.com/oauth/authorize')
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('scope', 'read_write')
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('state', signState(session.user.id))
  url.searchParams.set('stripe_user[email]', session.user.email || '')

  return NextResponse.redirect(url.toString())
}
