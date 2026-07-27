import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ADMIN_COOKIE_NAME } from '@/lib/admin-session'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  const { origin } = new URL(request.url)
  const res = NextResponse.redirect(`${origin}/`, { status: 303 })
  
  // Clear admin session as well to ensure complete logout
  res.cookies.delete(ADMIN_COOKIE_NAME)
  
  return res
}

export async function GET(request: NextRequest) {
  return POST(request)
}
