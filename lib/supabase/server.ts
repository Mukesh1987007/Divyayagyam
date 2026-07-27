import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSetting } from '@/lib/settings'

export async function createClient() {
  const cookieStore = await cookies()
  
  let sbUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/^"|"$/g, '')
  let sbKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').replace(/^"|"$/g, '')

  if (!sbUrl || !sbKey) {
    sbUrl = await getSetting('secret.supabase_url').catch(() => '')
    sbKey = await getSetting('secret.supabase_anon_key').catch(() => '')
  }

  const finalUrl = sbUrl || 'https://placeholder.supabase.co'
  const finalKey = sbKey || 'placeholder'

  return createServerClient(
    finalUrl,
    finalKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component cannot set cookies; middleware handles refresh
          }
        },
      },
    }
  )
}

