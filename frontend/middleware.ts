import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes qui nécessitent une session
const PROTECTED = ['/dashboard', '/chat', '/history', '/settings']
// Routes réservées aux visiteurs non connectés
const AUTH_ONLY = ['/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Lire le token depuis le cookie ou localStorage (côté serveur on utilise cookie)
  const token = request.cookies.get('syntax-access-token')?.value

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
  const isAuthOnly  = AUTH_ONLY.some((p) => pathname.startsWith(p))

  // Pas connecté → redirige vers /login
  if (isProtected && !token) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Déjà connecté → redirige vers /dashboard
  if (isAuthOnly && token) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/chat/:path*',
    '/history/:path*',
    '/settings/:path*',
    '/login',
  ],
}
