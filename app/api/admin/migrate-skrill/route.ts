export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "skrillEmail" TEXT`
  return NextResponse.json({ ok: true })
}
