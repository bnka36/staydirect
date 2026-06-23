export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const host = searchParams.get('host')
  if (!host) return NextResponse.json({ slug: null })

  const user = await prisma.user.findFirst({
    where: { customDomain: host },
    select: { slug: true },
  })

  return NextResponse.json({ slug: user?.slug ?? null })
}
