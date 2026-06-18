import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const DOMAIN_MAP: Record<string, string> = {
  'lockech.com': '/p/villa-kech',
  'www.lockech.com': '/p/villa-kech',
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const slug = DOMAIN_MAP[hostname]

  if (slug) {
    const { pathname } = request.nextUrl
    if (pathname === '/' || pathname === '') {
      const url = request.nextUrl.clone()
      url.pathname = slug
      return NextResponse.redirect(url, { status: 301 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\.ico).*)'],
}
