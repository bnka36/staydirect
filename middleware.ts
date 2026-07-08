import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://staydirect.fr'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const { pathname } = request.nextUrl

  // Ignorer domaines Vercel, localhost et staydirect.fr lui-même
  if (
    hostname.includes('vercel.app') ||
    hostname.includes('localhost') ||
    hostname.includes('127.0.0.1') ||
    hostname === 'staydirect.fr' ||
    hostname === 'www.staydirect.fr'
  ) {
    return NextResponse.next()
  }

  // Domaine personnalisé : appeler l'API sur staydirect.fr (pas sur le domaine custom)
  // Cela évite la boucle infinie où le middleware appelait sa propre URL
  try {
    const apiUrl = `${APP_URL}/api/domain?host=${encodeURIComponent(hostname)}`
    const res = await fetch(apiUrl, { next: { revalidate: 60 } })

    if (res.ok) {
      const data = await res.json()

      // Bloquer si essai expiré
      if (data.planExpiresAt && new Date(data.planExpiresAt) < new Date()) {
        const url = request.nextUrl.clone()
        url.pathname = '/site-suspendu'
        return NextResponse.rewrite(url)
      }

      if (data.slug && pathname === '/') {
        const url = request.nextUrl.clone()
        url.pathname = `/p/${data.slug}`
        return NextResponse.rewrite(url)
      }
    }
  } catch {
    // Silencieux si l'API échoue
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico).*)'],
}
