import { encode } from 'next-auth/jwt'
import { randomUUID } from 'crypto'
import type { NextResponse } from 'next/server'

const MAX_AGE = 30 * 24 * 60 * 60 // 30 jours, aligné sur la session JWT par défaut de NextAuth

type ImpersonableUser = {
  id: string
  name: string | null
  email: string
  image: string | null
  slug: string | null
}

function secureCookiesEnabled() {
  return process.env.NEXTAUTH_URL?.startsWith('https://') ?? process.env.NODE_ENV === 'production'
}

export function sessionCookieName() {
  return secureCookiesEnabled() ? '__Secure-next-auth.session-token' : 'next-auth.session-token'
}

// Fabrique un token de session minimal — le callback jwt() de lib/auth.ts relit ensuite
// plan/planExpiresAt/businessType en direct depuis la base dès que token.id est présent,
// donc pas besoin de les dupliquer ici. Le champ impersonatedBy indique qui regarde et
// permet de revenir à la session d'origine.
export async function mintSessionToken(user: ImpersonableUser, impersonatedBy: string | null) {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error('NEXTAUTH_SECRET manquant')
  const adminEmail = process.env.ADMIN_EMAIL || 'bnk.a36@gmail.com'
  const now = Math.floor(Date.now() / 1000)

  const token = {
    name: user.name,
    email: user.email,
    picture: user.image,
    sub: user.id,
    id: user.id,
    slug: user.slug,
    // Un compte visualisé en mode impersonation ne doit jamais hériter des droits admin.
    isAdmin: !impersonatedBy && user.email === adminEmail,
    impersonatedBy,
    iat: now,
    exp: now + MAX_AGE,
    jti: randomUUID(),
  }

  return encode({ token, secret, maxAge: MAX_AGE })
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(sessionCookieName(), token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: secureCookiesEnabled(),
    path: '/',
    maxAge: MAX_AGE,
  })
}
