import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function proxy(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value
  const { pathname } = request.nextUrl

  // Only protect /admin/* routes — main website is open
  if (!pathname.startsWith('/admin')) return NextResponse.next()

  // Allow static assets and API routes through
  if (pathname.startsWith('/_next') || pathname.startsWith('/api')) return NextResponse.next()

  // Redirect unauthenticated users to login (unless already on login page)
  if (!token && pathname !== '/admin/login') {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/admin/login'
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from login to dashboard
  if (token && pathname === '/admin/login') {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/admin/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|jpeg|webp|ico)).*)',
  ],
}
