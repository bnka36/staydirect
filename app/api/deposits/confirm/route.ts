export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST — appelé après confirmation Stripe côté client
export async function POST(req: Request) {
  const { depositId } = await req.json()

  const deposit = await prisma.securityDeposit.findUnique({ where: { id: depositId } })
  if (!deposit) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  // Mettre à jour le statut
  await prisma.securityDeposit.update({
    where: { id: depositId },
    data: { status: 'authorized' },
  })

  return NextResponse.json({ success: true })
}
