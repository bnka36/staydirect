export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('secret') !== 'extend-trial-2024-sd') {
    return NextResponse.json({ error: 'Non autorisÃ©' }, { status: 401 })
  }
  const slug = searchParams.get('slug')
  const apiKey = searchParams.get('key')
  if (!slug || !apiKey) return NextResponse.json({ error: 'slug et key requis' }, { status: 400 })

  const user = await prisma.user.update({
    where: { slug },
    data: { sumupApiKey: apiKey },
    select: { slug: true, name: true, email: true, sumupApiKey: true },
  })

  return NextResponse.json({ ok: true, ...user })
}
