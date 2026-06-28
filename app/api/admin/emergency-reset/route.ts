export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('secret') !== 'reset-admin-2024-sd') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  const newPassword = searchParams.get('pwd')
  const targetEmail = searchParams.get('email') || process.env.ADMIN_EMAIL || 'bnk.a36@gmail.com'

  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'pwd requis (min 6 chars)' }, { status: 400 })
  }

  // Trouver le premier user avec cet email (insensible à la casse)
  const user = await prisma.user.findFirst({
    where: { email: { equals: targetEmail, mode: 'insensitive' } },
  })

  if (!user) {
    // Lister tous les users pour debug
    const all = await prisma.user.findMany({ select: { email: true } })
    return NextResponse.json({ error: 'User introuvable', emails: all.map(u => u.email) })
  }

  const hashed = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })

  return NextResponse.json({ ok: true, email: user.email })
}
