export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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
  url.searchParams.set('state', session.user.id)
  url.searchParams.set('stripe_user[email]', session.user.email || '')

  return NextResponse.redirect(url.toString())
}
