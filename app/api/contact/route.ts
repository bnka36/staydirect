export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendContactNotification } from '@/lib/emails'

export async function POST(req: Request) {
  const { name, email, phone, plan, message } = await req.json()

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Nom, email et message requis' }, { status: 400 })
  }

  // Sauvegarder en base
  await prisma.contactMessage.create({
    data: { name, email, phone: phone || null, plan: plan || null, message },
  })

  // Envoyer email à l'admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@staydirect.fr'
  try {
    await sendContactNotification({ name, email, phone, plan, message, adminEmail })
  } catch (e) {
    console.error('Email contact error:', e)
  }

  return NextResponse.json({ success: true })
}
