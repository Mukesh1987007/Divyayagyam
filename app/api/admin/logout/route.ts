import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE_NAME } from '@/lib/admin-session'

export async function POST(req: NextRequest) {
  const { origin } = new URL(req.url)
  const res = NextResponse.redirect(`${origin}/admin/login`, { status: 303 })
  res.cookies.delete(ADMIN_COOKIE_NAME)
  return res
}

export async function GET(req: NextRequest) { return POST(req) }
