import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import type { RoleSlug } from '@/lib/rbac'

export type AuthUser = {
  id: string
  email: string
  fullName: string | null
  avatar: string | null
  role: RoleSlug | null
  supabaseId: string
}

export async function getSession() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  return data.user
}

import { getAdminSession } from '@/lib/admin-session'

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    // 1. Check for local Admin JWT session (used by admin dashboard)
    const adminSession = await getAdminSession().catch((err) => {
// console.error('[getCurrentUser] getAdminSession error:', err) (removed for production)
      return null
    })
    if (adminSession) {
      // Find real admin in DB or return dummy if DB fails
      let dbAdmin = await prisma.user.findFirst({
        where: { 
          email: adminSession.email,
          role: {
            OR: [
              { isSystem: true },
              { slug: { in: ['admin', 'manager', 'editor', 'astrologer', 'support'] } }
            ]
          }
        },
        include: { role: true }
      }).catch((err) => {
// console.error('[getCurrentUser] prisma findFirst admin error:', err) (removed for production)
        return null
      })
      
      if (dbAdmin) {
        if (dbAdmin.status === 'SUSPENDED') {
          return null // Force session invalidation
        }
        
        return {
          id: dbAdmin.id,
          email: dbAdmin.email,
          fullName: dbAdmin.fullName,
          avatar: dbAdmin.avatar,
          role: (dbAdmin.role?.slug as RoleSlug) ?? 'admin',
          supabaseId: dbAdmin.supabaseId || 'admin-system-id',
        }
      }
      
      return {
        id: 'admin-system-id',
        email: adminSession.email,
        fullName: 'System Administrator',
        avatar: null,
        role: 'admin',
        supabaseId: 'admin-system-id',
      }
    }

    const supaUser = await getSession()
    if (!supaUser) return null

    // Try to find local user record; if not found, create one on the fly.
    let dbUser = await prisma.user.findUnique({
      where: { supabaseId: supaUser.id },
      include: { role: true },
    })

    if (!dbUser && supaUser.email) {
      const defaultRole = await prisma.role.findUnique({ where: { slug: 'devotee' } })
      dbUser = await prisma.user.create({
        data: {
          supabaseId: supaUser.id,
          email: supaUser.email,
          emailVerified: !!supaUser.email_confirmed_at,
          fullName: (supaUser.user_metadata?.full_name as string) || null,
          phone: (supaUser.user_metadata?.phone as string) || null,
          avatar: (supaUser.user_metadata?.avatar_url as string) || null,
          roleId: defaultRole?.id ?? null,
        },
        include: { role: true },
      })
    }

    if (!dbUser) return null

    return {
      id: dbUser.id,
      email: dbUser.email,
      fullName: dbUser.fullName,
      avatar: dbUser.avatar,
      role: (dbUser.role?.slug as RoleSlug) ?? 'devotee',
      supabaseId: dbUser.supabaseId!,
    }
  } catch (err) {
// console.error('[getCurrentUser] outer catch error:', err) (removed for production)
    // If DB is unreachable (e.g. dev env), fall back to Supabase user only.
    const supaUser = await getSession().catch((e) => {
// console.error('[getCurrentUser] getSession error in outer catch:', e) (removed for production)
      return null
    })
    if (!supaUser) return null
    return {
      id: supaUser.id,
      email: supaUser.email ?? '',
      fullName: (supaUser.user_metadata?.full_name as string) ?? null,
      avatar: (supaUser.user_metadata?.avatar_url as string) ?? null,
      role: 'devotee',
      supabaseId: supaUser.id,
    }
  }
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) throw new Error('UNAUTHORIZED')
  return user
}
