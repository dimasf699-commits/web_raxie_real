import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isAdmin = req.auth?.user?.role === 'ADMIN'

  // Protect /admin routes
  if (nextUrl.pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl))
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', nextUrl))
    }
  }

  // Protect /account routes
  if (nextUrl.pathname.startsWith('/account')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl))
    }
  }
})

export const config = {
  // Run middleware on admin and account routes
  matcher: ['/admin/:path*', '/account/:path*'],
}
