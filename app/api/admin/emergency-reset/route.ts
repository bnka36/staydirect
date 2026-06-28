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
  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'pwd requis (min 6 chars)' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(newPassword, 12)
  const user = await prisma.user.update({
    where: { email: 'bnk.a36@gmail.com' },
    data: { password: hashed },
  })

  return NextResponse.json({ ok: true, email: user.email })
}
