export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const stripe = getStripe()
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user?.stripeAccountId) {
    return NextResponse.json({ error: 'Aucun abonnement trouvé' }, { status: 404 })
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeAccountId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur lors de l\'ouverture du portail de facturation'
    console.error('Erreur billing/portal:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
