import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminUser } from '@/lib/admin-session'
import { can } from '@/lib/rbac'

// GET: Fetch all temple categories
export async function GET() {
  try {
    const categories = await prisma.templeCategory.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { temples: true } } }
    })
    return NextResponse.json({ ok: true, data: categories });
  } catch (error: any) {
// console.error('Failed to fetch temple categories:', error) (removed for production)
    return NextResponse.json({ ok: false, error: 'Database error' }, { status: 500 });
  }
}

// POST: Create a new category
export async function POST(req: NextRequest) {
  try {
    const user = await getAdminUser()
    if (!user || !can(user.permissions, 'temples:create')) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { name } = await req.json()
    if (!name?.trim()) {
      return NextResponse.json({ ok: false, error: 'Name is required' }, { status: 400 });
    }

    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4)

    const category = await prisma.templeCategory.create({
      data: {
        name: name.trim(),
        slug
      }
    })

    return NextResponse.json({ ok: true, data: category });
  } catch (error: any) {
// console.error('Failed to create temple category:', error) (removed for production)
    return NextResponse.json({ ok: false, error: 'Database error' }, { status: 500 });
  }
}

// PUT: Update an existing category
export async function PUT(req: NextRequest) {
  try {
    const user = await getAdminUser()
    if (!user || !can(user.permissions, 'temples:edit')) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id, name } = await req.json()
    if (!id || !name?.trim()) {
      return NextResponse.json({ ok: false, error: 'ID and Name are required' }, { status: 400 });
    }

    const category = await prisma.templeCategory.update({
      where: { id },
      data: { name: name.trim() }
    })

    return NextResponse.json({ ok: true, data: category });
  } catch (error: any) {
// console.error('Failed to update temple category:', error) (removed for production)
    return NextResponse.json({ ok: false, error: 'Database error' }, { status: 500 });
  }
}

// DELETE: Remove a category
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAdminUser()
    if (!user || !can(user.permissions, 'temples:delete')) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Category ID required' }, { status: 400 });
    }

    await prisma.templeCategory.delete({
      where: { id }
    })

    return NextResponse.json({ ok: true });
  } catch (error: any) {
// console.error('Failed to delete temple category:', error) (removed for production)
    return NextResponse.json({ ok: false, error: 'Failed to delete category (it might be in use)' }, { status: 500 });
  }
}
