'use client'

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co').replace(/^"|"$/g, '')
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder').replace(/^"|"$/g, '')
  return createBrowserClient(url, key)
}
