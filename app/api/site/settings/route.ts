import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { siteTitle: true, tagline: true, logo: true, theme: true, primaryColor: true, customDomain: true, slug: true, name: true, paypalMe: true, skrillEmail: true, sumupApiKey: true, channexApiKey: true, phone: true, whatsapp: true },
  })
  return NextResponse.json(user)
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { siteTitle, tagline, logo, theme, primaryColor, customDomain, paypalMe, skrillEmail, sumupApiKey, channexApiKey, phone, whatsapp } = body

  // Vérifier que le domaine perso n'est pas déjà pris
  if (customDomain) {
    const existing = await prisma.user.findFirst({
      where: { customDomain, NOT: { id: session.user.id } },
    })
    if (existing) return NextResponse.json({ error: 'Ce domaine est déjà utilisé' }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { siteTitle, tagline, logo, theme, primaryColor, customDomain: customDomain || null, paypalMe: paypalMe || null, skrillEmail: skrillEmail || null, sumupApiKey: sumupApiKey || null, channexApiKey: channexApiKey || null, phone: phone || null, whatsapp: whatsapp || null },
  })

  return NextResponse.json(user)
}
