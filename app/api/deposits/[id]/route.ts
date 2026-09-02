export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'

// POST — action sur une caution (capture ou libération)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const stripe = getStripe()
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
    // Encaisser la caution (tout ou partie). Le montant autorisé inclut les frais de
    // service StayDirect en plus du montant de la caution ; on capture toujours ces frais
    // en plus de la part encaissée pour l'hôte, sans jamais dépasser le total autorisé.
    const capturedDeposit = Math.min(captureAmount || deposit.amount, deposit.amount)
    const feeAmountCents = Math.round((deposit.feeAmount || 0) * 100)
    const amountToCapture = Math.min(
      Math.round(capturedDeposit * 100) + feeAmountCents,
      Math.round((deposit.amount + (deposit.feeAmount || 0)) * 100),
    )

    // On bascule le statut de façon atomique AVANT d'appeler Stripe : si deux requêtes
    // arrivent en même temps (double-clic), une seule gagne cette mise à jour ; l'autre
    // sort immédiatement sans jamais toucher Stripe.
    const claimed = await prisma.securityDeposit.updateMany({
      where: { id, status: 'authorized' },
      data: { status: 'captured', capturedAt: new Date() },
    })
    if (claimed.count === 0) {
      return NextResponse.json({ error: 'Cette caution a déjà été traitée' }, { status: 409 })
    }

    try {
      await stripe.paymentIntents.capture(deposit.stripePaymentIntentId, {
        amount_to_capture: amountToCapture,
        application_fee_amount: feeAmountCents,
      })
    } catch (err) {
      // Stripe a refusé (autorisation expirée/annulée entre-temps, etc.) : on repasse la
      // caution dans son état précédent plutôt que de la laisser "captured" à tort.
      await prisma.securityDeposit.update({ where: { id }, data: { status: 'authorized', capturedAt: null } })
      const message = err instanceof Error ? err.message : 'Erreur Stripe lors de l\'encaissement'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    return NextResponse.json({ success: true, action: 'captured' })
  }

  if (action === 'release') {
    const claimed = await prisma.securityDeposit.updateMany({
      where: { id, status: 'authorized' },
      data: { status: 'released', releasedAt: new Date() },
    })
    if (claimed.count === 0) {
      return NextResponse.json({ error: 'Cette caution a déjà été traitée' }, { status: 409 })
    }

    try {
      // Libérer la caution (annuler l'autorisation)
      await stripe.paymentIntents.cancel(deposit.stripePaymentIntentId)
    } catch (err) {
      await prisma.securityDeposit.update({ where: { id }, data: { status: 'authorized', releasedAt: null } })
      const message = err instanceof Error ? err.message : 'Erreur Stripe lors de la libération'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    return NextResponse.json({ success: true, action: 'released' })
  }

  return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
}
