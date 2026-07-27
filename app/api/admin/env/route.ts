import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-session'
import { isSuperAdmin } from '@/lib/rbac'
import { withSafeApi } from '@/lib/safe-api'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const DEFAULT_ENV_TEMPLATE = `# Database URLs
DATABASE_URL="${process.env.DATABASE_URL || ''}"
DIRECT_URL="${process.env.DIRECT_URL || ''}"

# Supabase Credentials
SUPABASE_URL="${process.env.SUPABASE_URL || 'https://ctbhiqkgzgmjicvcgsxa.supabase.co'}"
NEXT_PUBLIC_SUPABASE_URL="${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ctbhiqkgzgmjicvcgsxa.supabase.co'}"

SUPABASE_PUBLISHABLE_KEY="${process.env.SUPABASE_PUBLISHABLE_KEY || ''}"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}"

SUPABASE_SECRET_KEY="${process.env.SUPABASE_SECRET_KEY || ''}"
SUPABASE_SERVICE_ROLE_KEY="${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}"

SUPABASE_JWKS_URL="${process.env.SUPABASE_JWKS_URL || ''}"

# Super Admin Credentials & Security
ADMIN_EMAIL="${process.env.ADMIN_EMAIL || 'admin@divyayagyam.com'}"
ADMIN_PASSWORD="${process.env.ADMIN_PASSWORD || ''}"
ADMIN_SESSION_SECRET="${process.env.ADMIN_SESSION_SECRET || ''}"
`

function getEnvFilePaths() {
  const cwd = process.cwd()
  return {
    envLocal: path.join(cwd, '.env.local'),
    env: path.join(cwd, '.env'),
  }
}

function parseEnvString(content: string): Record<string, string> {
  const envMap: Record<string, string> = {}
  const lines = content.split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim()
      let val = trimmed.slice(eqIdx + 1).trim()
      // Strip surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      envMap[key] = val
    }
  }
  return envMap
}

function ensureEnvFilesExist(): string {
  const { envLocal, env } = getEnvFilePaths()
  let content = ''

  if (fs.existsSync(envLocal)) {
    content = fs.readFileSync(envLocal, 'utf-8')
  } else if (fs.existsSync(env)) {
    content = fs.readFileSync(env, 'utf-8')
  } else {
    // Auto-create if missing
    content = DEFAULT_ENV_TEMPLATE
    try {
      fs.writeFileSync(envLocal, DEFAULT_ENV_TEMPLATE, 'utf-8')
      fs.writeFileSync(env, DEFAULT_ENV_TEMPLATE, 'utf-8')
    } catch (e) {
      // ignore
    }
  }

  try {
    if (!fs.existsSync(envLocal)) fs.writeFileSync(envLocal, content, 'utf-8')
    if (!fs.existsSync(env)) fs.writeFileSync(env, content, 'utf-8')
  } catch (e) {
    // ignore
  }

  return content
}

async function verifySecurityPassword(admin: any, passwordProvided: string | null): Promise<boolean> {
  if (!passwordProvided) return false

  if (admin?.passwordHash) {
    const isMatch = await bcrypt.compare(passwordProvided, admin.passwordHash)
    if (isMatch) return true
  }

  if (process.env.ADMIN_PASSWORD && passwordProvided === process.env.ADMIN_PASSWORD) {
    return true
  }

  return false
}

// POST: Verify password and either load or save .env secrets
export const POST = withSafeApi(async (req: NextRequest) => {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ ok: false, error: 'Unauthorized session' }, { status: 401 })
  }

  const roleSlug = admin.role?.slug || admin.role?.name || ''
  if (!isSuperAdmin(roleSlug) && admin.email.toLowerCase() !== (process.env.ADMIN_EMAIL || '').toLowerCase()) {
    return NextResponse.json({ ok: false, error: 'Access Denied: Only Super Admin can access environment secrets.' }, { status: 403 })
  }

  const body = await req.json()
  const { action, securityPassword, env: updatedEnv } = body

  // Security Lock Check
  const isAuthorized = await verifySecurityPassword(admin, securityPassword)
  if (!isAuthorized) {
    return NextResponse.json(
      { ok: false, error: 'Invalid Master Security Password. Access Denied!' },
      { status: 403 }
    )
  }

  // Action 1: Unlock and Read Secrets
  if (action === 'read' || action === 'unlock') {
    const rawContent = ensureEnvFilesExist()
    const parsedEnv = parseEnvString(rawContent)

    // Ensure standard keys exist
    const standardKeys = [
      'DATABASE_URL', 'DIRECT_URL',
      'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY', 'RAZORPAY_KEY_ID',
      'RAZORPAY_KEY_SECRET', 'GEMINI_API_KEY',
      'ADMIN_EMAIL', 'ADMIN_PASSWORD'
    ]

    for (const k of standardKeys) {
      if (!(k in parsedEnv) && process.env[k]) {
        parsedEnv[k] = process.env[k] || ''
      }
    }

    return NextResponse.json({
      ok: true,
      unlocked: true,
      message: 'Vault Unlocked Successfully!',
      env: parsedEnv,
      raw: rawContent
    })
  }

  // Action 2: Save and Apply Secrets Live
  if (action === 'save') {
    if (!updatedEnv || typeof updatedEnv !== 'object') {
      return NextResponse.json({ ok: false, error: 'Invalid environment payload' }, { status: 400 })
    }

    const lines: string[] = [
      '# Divyayagyam Environment Secrets',
      `# Last Updated: ${new Date().toISOString()}`,
      ''
    ]

    for (const [key, value] of Object.entries(updatedEnv)) {
      const k = key.trim().toUpperCase()
      if (!k) continue
      const v = String(value ?? '').trim()
      lines.push(`${k}="${v}"`)

      // Update process.env in memory immediately
      process.env[k] = v
    }

    const newContent = lines.join('\n') + '\n'
    const { envLocal, env } = getEnvFilePaths()

    fs.writeFileSync(envLocal, newContent, 'utf-8')
    fs.writeFileSync(env, newContent, 'utf-8')

    return NextResponse.json({
      ok: true,
      unlocked: true,
      message: 'Environment secrets saved & applied live to .env and .env.local successfully!'
    })
  }

  return NextResponse.json({ ok: false, error: 'Invalid action requested' }, { status: 400 })
})
