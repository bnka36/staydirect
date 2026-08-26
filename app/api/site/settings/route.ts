import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const VERCEL_TOKEN = process.env.VERCEL_TOKEN!
const VERCEL_TEAM = 'ayoub-stay'
const VERCEL_PROJECT = 'prj_cPYr0FrYBiPlLJDeJM0lEqwLUWPv'

async function addDomainToVercel(domain: string) {
  for (const d of [domain, `www.${domain}`]) {
    await fetch(`https://api.vercel.com/v10/projects/${VERCEL_PROJECT}/domains?teamId=${VERCEL_TEAM}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: d }),
    }).catch(() => {})
  }
}

async function removeDomainFromVercel(domain: string) {
  for (const d of [domain, `www.${domain}`]) {
    await fetch(`https://api.vercel.com/v9/projects/${VERCEL_PROJECT}/domains/${d}?teamId=${VERCEL_TEAM}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
    }).catch(() => {})
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { siteTitle: true, tagline: true, heroSubtitle: true, logo: true, theme: true, primaryColor: true, customDomain: true, slug: true, name: true, paypalMe: true, skrillEmail: true, sumupApiKey: true, phone: true, whatsapp: true },
  })
  return NextResponse.json(user)
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { siteTitle, tagline, heroSubtitle, logo, theme, primaryColor, customDomain, paypalMe, skrillEmail, sumupApiKey, phone, whatsapp } = body

  // Vérifier que le domaine perso n'est pas déjà pris
  if (customDomain) {
    const existing = await prisma.user.findFirst({
      where: { customDomain, NOT: { id: session.user.id } },
    })
    if (existing) return NextResponse.json({ error: 'Ce domaine est déjà utilisé' }, { status: 400 })
  }

  // Récupérer l'ancien domaine pour supprimer de Vercel si changé
  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { customDomain: true } })
  const oldDomain = currentUser?.customDomain

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { siteTitle, tagline, heroSubtitle: heroSubtitle || null, logo, theme, primaryColor, customDomain: customDomain || null, paypalMe: paypalMe || null, skrillEmail: skrillEmail || null, sumupApiKey: sumupApiKey || null, phone: phone || null, whatsapp: whatsapp || null },
  })

  // Synchroniser avec Vercel automatiquement
  if (customDomain && customDomain !== oldDomain) {
    if (oldDomain) await removeDomainFromVercel(oldDomain)
    await addDomainToVercel(customDomain)
  } else if (!customDomain && oldDomain) {
    await removeDomainFromVercel(oldDomain)
  }

  return NextResponse.json(user)
}
