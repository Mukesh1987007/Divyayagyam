export type { RoleSlug } from '@/lib/rbac'
export type { AuthUser } from '@/lib/auth'

export type ApiSuccess<T> = { ok: true; data: T }
export type ApiError = { ok: false; error: string; code?: string }
export type ApiResponse<T> = ApiSuccess<T> | ApiError

export type NavItem = {
  title: string
  href: string
  icon?: string
  description?: string
  disabled?: boolean
  external?: boolean
  children?: NavItem[]
}
