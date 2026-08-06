export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')
  const email = searchParams.get('email')
  const type = searchParams.get('type')

  if (secret !== 'extend-trial-2024-sd') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!email || !type) return NextResponse.json({ error: 'email et type requis' }, { status: 400 })

  const user = await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { businessType: type },
    select: { email: true, businessType: true, slug: true, name: true, phone: true },
  })

  return NextResponse.json({ ok: true, ...user })
}
