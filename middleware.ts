import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const DOMAIN_MAP: Record<string, string> = {
  'lockech.com': '/p/villa-kech',
  'www.lockech.com': '/p/villa-kech',
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const targetPath = DOMAIN_MAP[hostname]

  if (targetPath) {
    const { pathname } = request.nextUrl
    // Rewrite: l'URL reste lockech.com mais le contenu vient de /p/villa-kech
    if (pathname === '/' || pathname === '') {
      const url = request.nextUrl.clone()
      url.pathname = targetPath
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\.ico).*)'],
}
