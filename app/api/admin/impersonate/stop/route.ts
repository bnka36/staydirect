export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import { mintSessionToken, setSessionCookie } from '@/lib/impersonation'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'bnk.a36@gmail.com'

// Restaure la session admin d'origine après une visualisation "voir comme ce client".
export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const adminId = token?.impersonatedBy as string | undefined
  if (!adminId) {
    return NextResponse.json({ error: "Aucune session admin à restaurer" }, { status: 400 })
  }

  const admin = await prisma.user.findUnique({ where: { id: adminId } })
  if (!admin || admin.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Session admin invalide' }, { status: 403 })
  }

  const newToken = await mintSessionToken(admin, null)
  const response = NextResponse.json({ ok: true })
  setSessionCookie(response, newToken)
  return response
}
