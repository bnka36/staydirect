export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'

const stripe = getStripe()

// POST — action sur une caution (capture ou libération)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { id } = await params
  const { action, captureAmount } = await req.json()
  // action: 'capture' | 'release'

  const deposit = await prisma.securityDeposit.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!deposit) return NextResponse.json({ error: 'Caution introuvable' }, { status: 404 })
  if (deposit.status !== 'authorized') {
    return NextResponse.json({ error: 'Cette caution ne peut pas être modifiée' }, { status: 400 })
  }
  if (!deposit.stripePaymentIntentId) {
    return NextResponse.json({ error: 'Erreur Stripe' }, { status: 400 })
  }

  if (action === 'capture') {
    // Encaisser la caution (tout ou partie)
    const amountToCapture = captureAmount
      ? Math.round(captureAmount * 100)
      : Math.round(deposit.amount * 100)

    await stripe.paymentIntents.capture(deposit.stripePaymentIntentId, {
      amount_to_capture: amountToCapture,
    })

    await prisma.securityDeposit.update({
      where: { id },
      data: { status: 'captured', capturedAt: new Date() },
    })

    return NextResponse.json({ success: true, action: 'captured' })
  }

  if (action === 'release') {
    // Libérer la caution (annuler l'autorisation)
    await stripe.paymentIntents.cancel(deposit.stripePaymentIntentId)

    await prisma.securityDeposit.update({
      where: { id },
      data: { status: 'released', releasedAt: new Date() },
    })

    return NextResponse.json({ success: true, action: 'released' })
  }

  return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
}
