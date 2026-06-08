export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const book = await prisma.welcomeBook.findUnique({
    where: { id },
    include: {
      property: {
        select: {
          name: true,
          city: true,
          images: true,
          user: { select: { name: true, image: true } },
        },
      },
    },
  })

  if (!book || !book.isActive) return NextResponse.json({ error: 'Livret introuvable' }, { status: 404 })

  // Incrémenter les vues
  await prisma.welcomeBook.update({ where: { id }, data: { views: book.views + 1 } })

  return NextResponse.json(book)
}
