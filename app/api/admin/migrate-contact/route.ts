export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('secret') !== 'migrate-contact-2024') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT`
  await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT`
  return NextResponse.json({ ok: true })
}
