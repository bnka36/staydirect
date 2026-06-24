import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.$executeRaw`ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "baseGuests" INTEGER`
    await prisma.$executeRaw`ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "pricePerExtraGuest" DOUBLE PRECISION`
    return NextResponse.json({ success: true, message: 'Colonnes baseGuests et pricePerExtraGuest ajoutées' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
