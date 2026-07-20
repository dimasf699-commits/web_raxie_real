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
      // Redirect non-admins to the home page or account page
      return NextResponse.redirect(new URL('/', nextUrl))
    }
  }
})

export const config = {
  // Only run middleware on admin routes to optimize performance
  matcher: ['/admin/:path*'],
}
