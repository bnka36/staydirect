export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const user = await prisma.user.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      image: true,
      slug: true,
      siteTitle: true,
      tagline: true,
      logo: true,
      theme: true,
      primaryColor: true,
      properties: {
        where: { isActive: true },
        include: {
          blockedDates: {
            where: { date: { gte: new Date() } },
            select: { date: true },
          },
        },
      },
    },
  })

  if (!user) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  return NextResponse.json(user)
}
