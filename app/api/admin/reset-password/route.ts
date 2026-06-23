export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const ADMIN_EMAIL = 'bnk.a36@gmail.com'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (session?.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const { email, password } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: 'email et password requis' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  }

  const hashed = await bcrypt.hash(password, 12)
  await prisma.user.update({ where: { email }, data: { password: hashed } })

  return NextResponse.json({ success: true, email })
}
