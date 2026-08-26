export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { listSiteminderProperties } from '@/lib/siteminder'

// Liste les hôtels disponibles dans le compte SiteMinder du client (pour le connecter
// à un logement StayDirect depuis le dashboard).
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { siteminderApiKey: true } })
  if (!user?.siteminderApiKey) {
    return NextResponse.json({ error: "Renseignez d'abord votre clé API SiteMinder dans Mon site." }, { status: 400 })
  }

  try {
    const properties = await listSiteminderProperties(user.siteminderApiKey)
    return NextResponse.json({ properties })
  } catch (e) {
    console.error('SiteMinder list properties error:', e)
    return NextResponse.json({ error: 'Impossible de récupérer vos hôtels SiteMinder — vérifiez votre clé API' }, { status: 502 })
  }
}
