export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('secret') !== 'extend-trial-2024-sd') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const email = searchParams.get('email')
  const hours = parseInt(searchParams.get('hours') || '48')
  if (!email) return NextResponse.json({ error: 'email requis' }, { status: 400 })

  const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })
  if (!user) return NextResponse.json({ error: 'introuvable' }, { status: 404 })

  const plan = searchParams.get('plan')
  const newExpiry = new Date(Date.now() + hours * 60 * 60 * 1000)
  await prisma.user.update({
    where: { id: user.id },
    data: { planExpiresAt: newExpiry, ...(plan ? { plan } : {}) },
  })

  return NextResponse.json({ ok: true, email: user.email, newExpiry, plan: plan || user.plan })
}
