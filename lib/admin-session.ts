import { cookies } from 'next/headers'
import { cache } from 'react'

const COOKIE_NAME = 'dvj_admin_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

function b64urlEncode(buf: ArrayBuffer | Uint8Array): string {
  const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let str = ''
  for (let i = 0; i < arr.byteLength; i++) str += String.fromCharCode(arr[i])
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecodeStr(s: string): string {
  const norm = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)
  return atob(norm)
}

function utf8Encode(s: string): Uint8Array {
  return new TextEncoder().encode(s)
}

async function importKey(secret: string): Promise<CryptoKey> {
  return globalThis.crypto.subtle.importKey(
    'raw',
    utf8Encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

async function hmacSign(secret: string, data: string): Promise<string> {
  const key = await importKey(secret)
  const sig = await globalThis.crypto.subtle.sign('HMAC', key, utf8Encode(data))
  return b64urlEncode(sig)
}

export async function signAdminToken(email: string): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET || 'random-fallback-if-missing'
  const payload = JSON.stringify({ email, exp: Date.now() + SESSION_TTL_MS })
  const b64 = b64urlEncode(utf8Encode(payload))
  const sig = await hmacSign(secret, b64)
  return `${b64}.${sig}`
}

export async function verifyAdminToken(token: string | undefined | null): Promise<{ email: string } | null> {
  if (!token) return null
  const [b64, sig] = token.split('.')
  if (!b64 || !sig) return null
  const secret = process.env.ADMIN_SESSION_SECRET || 'random-fallback-if-missing'
  const expected = await hmacSign(secret, b64)
  if (expected !== sig) return null
  try {
    const payload = JSON.parse(b64urlDecodeStr(b64)) as { email: string; exp: number }
    if (Date.now() > payload.exp) return null
    return { email: payload.email }
  } catch { return null }
}

export async function getAdminSession(): Promise<{ email: string } | null> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  return verifyAdminToken(token)
}

export const getAdminUser = cache(async () => {
  const session = await getAdminSession()
  if (!session) return null

  const sessionEmail = session.email.toLowerCase()

  try {
    const { initSecrets } = await import('@/lib/secrets')
    await initSecrets()

    const { prisma } = await import('@/lib/prisma')

    // Case-insensitive DB lookup
    const user = await prisma.user.findFirst({
      where: { email: { equals: sessionEmail, mode: 'insensitive' } },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true }
            }
          }
        }
      }
    })

    if (user) {
      const permissions = user.role?.permissions.map(p => p.permission.slug) || []
      return { ...user, permissions }
    }

    // Fallback: Super Admin from environment (may not have a DB record)
    const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim().toLowerCase() : null
    if (adminEmail && sessionEmail === adminEmail) {
      // Return a virtual super-admin object
      return {
        id: 'super-admin',
        email: sessionEmail,
        fullName: 'Super Admin',
        name: 'Super Admin',
        role: { name: 'Super Admin', slug: 'admin', isSystem: true, permissions: [] },
        permissions: ['*'], // all permissions
        status: 'ACTIVE',
        passwordHash: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any
    }

    return null
  } catch (err) {
// console.error('Failed to fetch admin user:', err) (removed for production)
    return null
  }
})

export const ADMIN_COOKIE_NAME = COOKIE_NAME
export const ADMIN_SESSION_TTL_MS = SESSION_TTL_MS
