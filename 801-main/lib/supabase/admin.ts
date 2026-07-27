import { createClient } from '@supabase/supabase-js'
import { getSetting } from '@/lib/settings'

// Server-only admin client using the service-role key.
// Never expose this on the browser.
export async function createAdminClient() {
  let url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/^"|"$/g, '')
  let serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/^"|"$/g, '')

  if (!url || !serviceKey) {
    url = await getSetting('secret.supabase_url')
    serviceKey = await getSetting('secret.supabase_service_role_key')
  }

  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

