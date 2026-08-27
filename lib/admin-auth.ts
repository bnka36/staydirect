import { NextRequest, NextResponse } from 'next/server'

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'extend-trial-2024-sd'

/**
 * Verify admin access via Authorization header (preferred) or ?secret= query param (legacy).
 * Returns null if authorized, or a 401 NextResponse if not.
 *
 * Usage:
 *   const unauth = verifyAdmin(req)
 *   if (unauth) return unauth
 */
export function verifyAdmin(req: NextRequest | Request): NextResponse | null {
  // 1. Check Authorization header: "Bearer <secret>"
  const authHeader = req instanceof Request
    ? req.headers.get('authorization')
    : (req as NextRequest).headers.get('authorization')

  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim()
    if (token === ADMIN_SECRET) return null
  }

  // 2. Legacy fallback: ?secret= query param
  const url = new URL(req.url)
  if (url.searchParams.get('secret') === ADMIN_SECRET) return null

  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
}
