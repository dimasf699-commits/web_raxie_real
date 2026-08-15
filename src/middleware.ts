import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isAdmin = req.auth?.user?.role === 'ADMIN'

  // Protect /api/admin API routes
  if (nextUrl.pathname.startsWith('/api/admin')) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized: Silakan login terlebih dahulu' }, { status: 401 })
    }
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Akses khusus Admin' }, { status: 403 })
    }
    return NextResponse.next()
  }

  // Protect /api/account API routes
  if (nextUrl.pathname.startsWith('/api/account')) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized: Silakan login terlebih dahulu' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Protect /admin web pages
  if (nextUrl.pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl))
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', nextUrl))
    }
  }

  // Protect /account web pages
  if (nextUrl.pathname.startsWith('/account')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  // Run middleware on admin, account, and private API routes
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/api/admin/:path*',
    '/api/account/:path*',
  ],
}
