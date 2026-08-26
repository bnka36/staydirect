export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { channexRequest } from '@/lib/channex'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { channexApiKey: true, channexPropertyId: true },
  })

  if (!user?.channexApiKey) return NextResponse.json({ connected: false })

  try {
    await channexRequest(user.channexApiKey, 'GET', '/properties')
    return NextResponse.json({ connected: true, propertyId: user.channexPropertyId })
  } catch {
    return NextResponse.json({ connected: false, error: 'Clé API invalide' })
  }
}
