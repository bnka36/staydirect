export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('secret') !== 'reset-admin-2024-sd') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const action = searchParams.get('action')

  // Créer le compte admin s'il n'existe pas
  if (action === 'create-admin') {
    const pwd = searchParams.get('pwd')
    if (!pwd || pwd.length < 6) return NextResponse.json({ error: 'pwd requis' }, { status: 400 })

    const existing = await prisma.user.findFirst({ where: { email: { equals: 'bnk.a36@gmail.com', mode: 'insensitive' } } })
    if (existing) {
      const hashed = await bcrypt.hash(pwd, 12)
      await prisma.user.update({ where: { id: existing.id }, data: { password: hashed } })
      return NextResponse.json({ ok: true, action: 'updated', email: existing.email })
    }

    const hashed = await bcrypt.hash(pwd, 12)
    const user = await prisma.user.create({
      data: {
        name: 'Admin StayDirect',
        email: 'bnk.a36@gmail.com',
        password: hashed,
        slug: 'admin-staydirect',
        plan: 'business',
      },
    })
    return NextResponse.json({ ok: true, action: 'created', email: user.email })
  }

  // Reset mot de passe par email
  const targetEmail = searchParams.get('email')
  const newPassword = searchParams.get('pwd')
  if (!targetEmail || !newPassword) return NextResponse.json({ error: 'email et pwd requis' }, { status: 400 })

  const user = await prisma.user.findFirst({ where: { email: { equals: targetEmail, mode: 'insensitive' } } })
  if (!user) return NextResponse.json({ error: 'introuvable' }, { status: 404 })

  const hashed = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
  return NextResponse.json({ ok: true, email: user.email })
}
