export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'bnk.a36@gmail.com'

function isAdmin(session: any) {
  return session?.user?.email === ADMIN_EMAIL
}

// PATCH — modifier plan / nom / email d'un utilisateur
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { userId, plan, name, email, planExpiresAt } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 })

  const data: Record<string, any> = {}
  if (plan !== undefined) data.plan = plan
  if (name !== undefined) data.name = name
  if (email !== undefined) data.email = email
  if (planExpiresAt !== undefined) data.planExpiresAt = planExpiresAt ? new Date(planExpiresAt) : null

  const user = await prisma.user.update({ where: { id: userId }, data })
  return NextResponse.json({ ok: true, user })
}

// DELETE — supprimer un utilisateur et toutes ses données
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 })

  // Supprimer en cascade (propriétés, réservations, etc.)
  const properties = await prisma.property.findMany({ where: { userId }, select: { id: true } })
  const propertyIds = properties.map(p => p.id)

  await prisma.$transaction([
    prisma.blockedDate.deleteMany({ where: { propertyId: { in: propertyIds } } }),
    prisma.priceOverride.deleteMany({ where: { propertyId: { in: propertyIds } } }),
    prisma.reservation.deleteMany({ where: { propertyId: { in: propertyIds } } }),
    prisma.welcomeBook.deleteMany({ where: { propertyId: { in: propertyIds } } }),
    prisma.property.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ])

  return NextResponse.json({ ok: true })
}
