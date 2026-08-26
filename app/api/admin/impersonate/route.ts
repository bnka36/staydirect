export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mintSessionToken, setSessionCookie } from '@/lib/impersonation'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'bnk.a36@gmail.com'

// Ouvre une session en lecture sur le compte d'un client, sans toucher à son mot de passe.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (session?.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 })
  if (userId === session.user.id) {
    return NextResponse.json({ error: 'Vous êtes déjà connecté sur ce compte' }, { status: 400 })
  }

  const target = await prisma.user.findUnique({ where: { id: userId } })
  if (!target) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })

  const token = await mintSessionToken(target, session.user.id)
  const response = NextResponse.json({ ok: true })
  setSessionCookie(response, token)
  return response
}
