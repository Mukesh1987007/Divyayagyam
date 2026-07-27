import { prisma } from './prisma'

let secretsLoaded = false

/**
 * Loads all secrets from the database and populates process.env with them.
 * This overrides standard env variables at runtime using admin-configured values.
 */
export async function initSecrets(force = false) {
  if (secretsLoaded && !force) return

  try {
    const settings = await prisma.websiteSetting.findMany({
      where: {
        OR: [
          { group: 'secrets' },
          { key: { startsWith: 'secret_' } }
        ]
      }
    })

    settings.forEach(setting => {
      const val = setting.value
      if (val === undefined || val === null) return

      // Handle both pure strings and JSON-wrapped values
      let cleanVal = ''
      if (typeof val === 'string') {
        cleanVal = val
      } else {
        try {
          cleanVal = typeof val === 'object' ? (val as any).value ?? JSON.stringify(val) : String(val)
        } catch {
          cleanVal = String(val)
        }
      }

      if (!cleanVal) return

      // Only map safe configurations (e.g. non-secret settings)
      // Highly privileged keys (Razorpay Secret, Supabase Service Role, Admin Password) 
      // are no longer read from the database for security reasons.
      switch (setting.key) {
        case 'secret_razorpay_key_id':
          process.env.RAZORPAY_KEY_ID = cleanVal
          process.env['NEXT_PUBLIC_' + 'RAZORPAY_KEY_ID'] = cleanVal
          break
        case 'secret_supabase_url':
          process.env['NEXT_PUBLIC_' + 'SUPABASE_URL'] = cleanVal
          break
        case 'secret_supabase_anon_key':
          process.env['NEXT_PUBLIC_' + 'SUPABASE_ANON_KEY'] = cleanVal
          break
        case 'secret_admin_email':
          process.env.ADMIN_EMAIL = cleanVal
          break
        default:
          // Do nothing for sensitive keys
          break
      }
    })

    secretsLoaded = true
// console.log('[Secrets Engine] Successfully loaded DB site secrets into environment variables.') (removed for production)
  } catch (err) {
// console.error('[Secrets Engine] Error loading secrets from database:', err) (removed for production)
  }
}
