import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const VALID_TYPES = ['meuble', 'maison_hotes', 'chambre_hotes', 'hotel', 'appart_hotel', 'camping']

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { businessType } = await req.json()
  if (!VALID_TYPES.includes(businessType)) return NextResponse.json({ error: 'Type invalide' }, { status: 400 })

  await prisma.user.update({
    where: { email: session.user.email },
    data: { businessType },
  })

  return NextResponse.json({ ok: true })
}
