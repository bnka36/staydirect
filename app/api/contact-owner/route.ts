export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendGuestMessageToOwner } from '@/lib/emails'

export async function POST(req: Request) {
  const { propertyId, guestName, guestEmail, guestPhone, message } = await req.json()

  if (!propertyId || !guestName || !guestEmail || !message) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { user: true },
  })

  if (!property) {
    return NextResponse.json({ error: 'Logement introuvable' }, { status: 404 })
  }

  try {
    await sendGuestMessageToOwner({
      guestName,
      guestEmail,
      guestPhone: guestPhone || undefined,
      message,
      propertyName: property.name,
      ownerEmail: property.user.email,
      ownerName: property.user.name || 'Hôte',
    })
  } catch (e) {
    console.error('Contact owner email error:', e)
    return NextResponse.json({ error: 'Erreur envoi email' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
