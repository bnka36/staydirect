export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('secret') !== 'extend-trial-2024-sd') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  const slug = searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'slug requis' }, { status: 400 })

  const user = await prisma.user.update({
    where: { slug },
    data: { skrillEmail: null },
    select: { slug: true, name: true, email: true, skrillEmail: true, stripeConnectId: true },
  })

  return NextResponse.json({ ok: true, ...user })
}
