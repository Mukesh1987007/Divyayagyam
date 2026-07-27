import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: {
          OR: [
            { isSystem: true },
            { slug: { in: ['admin', 'manager', 'editor', 'astrologer', 'support'] } },
            { slug: { startsWith: 'custom_' } }
          ]
        }
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // fetch system roles for the dropdown with their default permissions
    const roles = await prisma.role.findMany({
      where: {
        OR: [
          { isSystem: true },
          { slug: { in: ['admin', 'manager', 'editor', 'astrologer', 'support'] } }
        ]
      },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })

    // fetch all permissions for granular checkbox mapping
    const permissions = await prisma.permission.findMany()

    return NextResponse.json({ ok: true, admins, roles, permissions });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, roleId, customPermissions } = await req.json()
    if (!email || !password || !roleId) {
      return NextResponse.json({ ok: false, error: 'Email, password, and role are required' }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ ok: false, error: 'Email already exists' }, { status: 400 });
    }

    let finalRoleId = roleId

    if (customPermissions && Array.isArray(customPermissions)) {
      const roleSlug = `custom_${email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`
      const customRole = await prisma.role.upsert({
        where: { slug: roleSlug },
        create: {
          name: `${fullName || 'Admin'} (Custom)`,
          slug: roleSlug,
          description: `Custom permissions for ${email}`,
          isSystem: false
        },
        update: {
          name: `${fullName || 'Admin'} (Custom)`,
          description: `Custom permissions for ${email}`
        }
      })
      
      // Delete old permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId: customRole.id }
      })
      
      // Map new permissions
      if (customPermissions.length > 0) {
        const permsInDb = await prisma.permission.findMany({
          where: { slug: { in: customPermissions } }
        })
        
        await prisma.rolePermission.createMany({
          data: permsInDb.map(p => ({
            roleId: customRole.id,
            permissionId: p.id
          }))
        })
      }
      
      finalRoleId = customRole.id
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const admin = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        passwordHash,
        fullName,
        roleId: finalRoleId,
        status: 'ACTIVE'
      }
    })

    return NextResponse.json({ ok: true, message: 'Sub-Admin created successfully', admin });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const payload = await req.json()
    const { id, action, email, fullName, roleId, customPermissions } = payload
    if (!id) {
      return NextResponse.json({ ok: false, error: 'User ID required' }, { status: 400 });
    }

    // 1. Toggle status (suspend/activate)
    if (action === 'suspend' || action === 'activate') {
      const status = action === 'suspend' ? 'SUSPENDED' : 'ACTIVE'
      const updated = await prisma.user.update({
        where: { id },
        data: { status }
      })
      return NextResponse.json({ ok: true, message: `Admin ${status.toLowerCase()}`, user: updated });
    }

    // 2. Update profile and custom rights
    if (action === 'update') {
      if (!email || !roleId) {
        return NextResponse.json({ ok: false, error: 'Email and Role are required' }, { status: 400 });
      }

      let finalRoleId = roleId

      if (customPermissions && Array.isArray(customPermissions)) {
        const roleSlug = `custom_${email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`
        const customRole = await prisma.role.upsert({
          where: { slug: roleSlug },
          create: {
            name: `${fullName || 'Admin'} (Custom)`,
            slug: roleSlug,
            description: `Custom permissions for ${email}`,
            isSystem: false
          },
          update: {
            name: `${fullName || 'Admin'} (Custom)`,
            description: `Custom permissions for ${email}`
          }
        })
        
        // Delete old permissions
        await prisma.rolePermission.deleteMany({
          where: { roleId: customRole.id }
        })
        
        // Map new permissions
        if (customPermissions.length > 0) {
          const permsInDb = await prisma.permission.findMany({
            where: { slug: { in: customPermissions } }
          })
          
          await prisma.rolePermission.createMany({
            data: permsInDb.map(p => ({
              roleId: customRole.id,
              permissionId: p.id
            }))
          })
        }
        
        finalRoleId = customRole.id
      }

      const updated = await prisma.user.update({
        where: { id },
        data: {
          email: email.trim().toLowerCase(),
          fullName,
          roleId: finalRoleId
        }
      })

      return NextResponse.json({ ok: true, message: 'Admin updated successfully', user: updated });
    }

    return NextResponse.json({ ok: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
