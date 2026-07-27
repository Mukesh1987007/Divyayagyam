import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/admin-session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

  const isAdminRoute = pathname.startsWith('/admin')
  const isAdminLogin = pathname === '/admin/login' || pathname.startsWith('/admin/login/')

  // ---- Admin Auth Guard (Turbo Speed & Isolated) ----
  if (isAdminRoute) {
    if (!isAdminLogin) {
      const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value
      const session = await verifyAdminToken(token)
      if (!session) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin/login'
        url.searchParams.set('redirect', pathname)
        return NextResponse.redirect(url)
      }
    } else {
      // If logged-in admin visits /admin/login, redirect to /admin
      const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value
      if (await verifyAdminToken(token)) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin'
        return NextResponse.redirect(url)
      }
    }

    // Direct bypass of Supabase session update on admin routes
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  const response = await updateSession(request)
  response.headers.set('x-pathname', pathname)
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
