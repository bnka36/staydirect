import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const { pathname } = request.nextUrl

  // Ignorer les domaines Vercel et localhost
  if (
    hostname.includes('vercel.app') ||
    hostname.includes('localhost') ||
    hostname.includes('127.0.0.1')
  ) {
    return NextResponse.next()
  }

  // Pour les domaines personnalisés, appeler l'API pour résoudre le slug
  try {
    const apiUrl = `${request.nextUrl.protocol}//${request.headers.get('host')}/api/domain?host=${encodeURIComponent(hostname)}`
    // On utilise l'URL interne (même serveur) pour éviter le DNS externe
    const internalUrl = new URL('/api/domain', request.url)
    internalUrl.searchParams.set('host', hostname)

    const res = await fetch(internalUrl.toString(), { next: { revalidate: 60 } })
    if (res.ok) {
      const data = await res.json()
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
