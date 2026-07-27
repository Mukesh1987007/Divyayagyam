import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-session'
import { isSuperAdmin } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { withSafeApi } from '@/lib/safe-api'

export const POST = withSafeApi(async (req: NextRequest) => {
  const admin = await getAdminUser()

  // 1. Strict Security Guard: Only authenticated Super Admin can access
  if (!admin) {
    return NextResponse.json({ ok: false, error: 'Unauthorized session' }, { status: 401 })
  }

  const roleSlug = admin.role?.slug || admin.role?.name || ''
  if (!isSuperAdmin(roleSlug) && admin.email.toLowerCase() !== (process.env.ADMIN_EMAIL || '').toLowerCase()) {
    return NextResponse.json(
      { ok: false, error: 'Access Denied: Only Super Admin can change Super Admin credentials.' },
      { status: 403 }
    )
  }

  const { currentPassword, newPassword, confirmPassword } = await req.json()

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ ok: false, error: 'Current password and new password are required' }, { status: 400 })
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ ok: false, error: 'New password and confirmation password do not match' }, { status: 400 })
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ ok: false, error: 'New password must be at least 8 characters long' }, { status: 400 })
  }

  // 2. Verify current password
  let isValidPassword = false

  if (admin.passwordHash) {
    isValidPassword = await bcrypt.compare(currentPassword, admin.passwordHash)
  }

  // Fallback check against process.env.ADMIN_PASSWORD
  if (!isValidPassword && process.env.ADMIN_PASSWORD && currentPassword === process.env.ADMIN_PASSWORD) {
    isValidPassword = true
  }

  if (!isValidPassword) {
    return NextResponse.json({ ok: false, error: 'Incorrect current password' }, { status: 400 })
  }

  // 3. Hash new password and update in Database
  const newHash = await bcrypt.hash(newPassword, 10)

  // Update in Database if user exists
  await prisma.user.updateMany({
    where: { email: { equals: admin.email, mode: 'insensitive' } },
    data: { passwordHash: newHash }
  })

  return NextResponse.json({
    ok: true,
    message: 'Super Admin password updated successfully! Please save your new password securely.'
  })
})
