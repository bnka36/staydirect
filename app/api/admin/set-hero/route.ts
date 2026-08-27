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
  if (!slug) return NextResponse.json({ error: 'slug requis' }, { status: 400 })

  const data: Record<string, string | null> = {}
  const siteTitle = searchParams.get('siteTitle')
  const tagline = searchParams.get('tagline')
  const heroSubtitle = searchParams.get('heroSubtitle')
  if (siteTitle !== null) data.siteTitle = siteTitle
  if (tagline !== null) data.tagline = tagline
  if (heroSubtitle !== null) data.heroSubtitle = heroSubtitle

  const user = await prisma.user.update({
    where: { slug },
    data,
    select: { slug: true, siteTitle: true, tagline: true, heroSubtitle: true },
  })

  return NextResponse.json({ ok: true, ...user })
}
