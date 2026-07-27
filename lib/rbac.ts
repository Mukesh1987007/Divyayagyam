// Role-Based Access Control for Divyayagyam
// 9 roles matching Sanatan Seva Online spec.

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  TEMPLE_MANAGER: 'temple_manager',
  PANDIT_MANAGER: 'pandit_manager',
  STORE_MANAGER: 'store_manager',
  CONTENT_MANAGER: 'content_manager',
  SUPPORT_MANAGER: 'support_manager',
  FINANCE_MANAGER: 'finance_manager',
  MARKETING_MANAGER: 'marketing_manager',
  PANDIT: 'pandit',
  STAFF: 'staff',
  DEVOTEE: 'devotee',
} as const

export type RoleSlug = (typeof ROLES)[keyof typeof ROLES]

const ROLE_HIERARCHY: Record<RoleSlug, number> = {
  super_admin: 100,
  admin: 90,
  temple_manager: 70,
  pandit_manager: 70,
  store_manager: 70,
  content_manager: 70,
  support_manager: 70,
  finance_manager: 75,
  marketing_manager: 70,
  pandit: 60,
  staff: 40,
  devotee: 10,
}

export const ROLE_LABELS: Record<RoleSlug, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  temple_manager: 'Temple Manager',
  pandit_manager: 'Pandit Manager',
  store_manager: 'Store Manager',
  content_manager: 'Content Manager',
  support_manager: 'Support Manager',
  finance_manager: 'Finance Manager',
  marketing_manager: 'Marketing Manager',
  pandit: 'Pandit',
  staff: 'Staff',
  devotee: 'Devotee',
}

export function roleLevel(role?: string | null): number {
  if (!role) return 0
  return ROLE_HIERARCHY[role as RoleSlug] ?? 0
}

export function hasRole(userRole: string | null | undefined, required: RoleSlug): boolean {
  return roleLevel(userRole) >= roleLevel(required)
}

export function isAdmin(role?: string | null): boolean {
  // Any staff-level role >= 40 can access admin panel (with restricted views)
  return roleLevel(role) >= 40
}

export function isSuperAdmin(role?: string | null): boolean {
  return role === ROLES.SUPER_ADMIN
}

// Permission checks (resource.action)
export type Permission = string

export function can(permissions: string[] | undefined, permission: Permission): boolean {
  if (!permissions?.length) return false
  if (permissions.includes('*')) return true
  const [resource] = permission.split('.')
  return permissions.includes(permission) || permissions.includes(`${resource}.*`)
}

export const DEFAULT_PERMISSIONS: Record<RoleSlug, string[]> = {
  super_admin: ['*'],
  admin: [
    'user.*', 'temple.*', 'puja.*', 'booking.*', 'product.*', 'order.*',
    'donation.*', 'bhaktiSeva.*', 'astro.*', 'blog.*', 'gallery.*',
    'testimonial.*', 'event.*', 'media.*', 'support.*', 'notification.*',
    'marketing.*', 'report.*', 'analytics.*', 'cms.*', 'seo.*',
    'payment.*', 'storage.*', 'settings.*', 'security.read', 'tools.*',
  ],
  temple_manager: [
    'temple.*', 'puja.*', 'booking.read', 'booking.update',
    'schedule.*', 'gallery.*', 'event.*', 'pandit.read',
  ],
  pandit_manager: [
    'pandit.*', 'schedule.*', 'booking.read', 'booking.update',
    'certificate.*', 'puja.read',
  ],
  store_manager: [
    'product.*', 'order.*', 'inventory.*', 'coupon.*', 'offer.*',
    'shipping.*', 'refund.read', 'refund.update',
  ],
  content_manager: [
    'blog.*', 'gallery.*', 'testimonial.*', 'event.*', 'cms.*',
    'seo.*', 'media.*', 'faq.*',
  ],
  support_manager: [
    'support.*', 'ticket.*', 'notification.create', 'notification.read',
    'user.read', 'booking.read', 'order.read',
  ],
  finance_manager: [
    'payment.*', 'refund.*', 'invoice.*', 'donation.read', 'report.*',
    'analytics.read', 'order.read', 'booking.read',
  ],
  marketing_manager: [
    'marketing.*', 'coupon.*', 'campaign.*', 'newsletter.*',
    'notification.*', 'analytics.read', 'blog.read',
  ],
  pandit: [
    'booking.read', 'booking.update', 'puja.read',
    'schedule.*', 'certificate.create',
  ],
  staff: [
    'booking.read', 'order.read', 'order.update',
    'support.*', 'customer.read',
  ],
  devotee: [
    'booking.create', 'booking.read', 'order.create', 'order.read',
    'donation.create', 'profile.*',
  ],
}
