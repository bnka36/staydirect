import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.$executeRaw`ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "amenities" TEXT[] DEFAULT '{}'`
    return NextResponse.json({ success: true, message: 'Colonne amenities ajoutée' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
