import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/admin-session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ---- Admin auth guard ----
  const isAdminRoute = pathname.startsWith('/admin')
  const isAdminLogin = pathname === '/admin/login' || pathname.startsWith('/admin/login/')

  if (isAdminRoute && !isAdminLogin) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value
    const session = await verifyAdminToken(token)
    if (!session) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  // If logged-in admin visits /admin/login, redirect to /admin
  if (isAdminLogin) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value
    if (await verifyAdminToken(token)) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
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
