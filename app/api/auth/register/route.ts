import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

// Simple in-memory rate limiter: max 5 inscriptions par IP par heure
const attempts = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = attempts.get(ip)
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + 3600_000 })
    return true
  }
  if (entry.count >= 5) return false
  entry.count++
  return true
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans 1 heure.' }, { status: 429 })
  }

  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    let slug = slugify(name)

    // S'assurer que le slug est unique
    const slugExists = await prisma.user.findUnique({ where: { slug } })
    if (slugExists) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`
    }

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, slug },
    })

    return NextResponse.json({ id: user.id, email: user.email, slug: user.slug })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
