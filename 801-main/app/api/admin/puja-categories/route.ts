import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-session'
import { revalidateTag, revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const categories = await prisma.pujaCategory.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ ok: true, data: categories });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Database error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { name, slug, description } = await req.json()
    if (!name) return NextResponse.json({ ok: false, error: 'Name is required' }, { status: 400 });

    let calculatedSlug = slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')

    const existing = await prisma.pujaCategory.findUnique({ where: { slug: calculatedSlug } })
    if (existing) {
      calculatedSlug = `${calculatedSlug}-${Date.now().toString().slice(-4)}`
    }

    const category = await prisma.pujaCategory.create({
      data: {
        name,
        slug: calculatedSlug,
        description: description || ''
      }
    })

    revalidateTag('pujas')
    return NextResponse.json({ ok: true, data: category });
  } catch (err: any) {
    if (err.code === 'P2002') return NextResponse.json({ ok: false, error: 'A category with this name/slug already exists' }, { status: 400 });
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    const { name, slug, description } = await req.json()
    
    if (!id || !name) {
      return NextResponse.json({ ok: false, error: 'ID and Name are required' }, { status: 400 });
    }

    let calculatedSlug = slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')

    const existing = await prisma.pujaCategory.findUnique({ where: { slug: calculatedSlug } })
    if (existing && existing.id !== id) {
      calculatedSlug = `${calculatedSlug}-${Date.now().toString().slice(-4)}`
    }

    const category = await prisma.pujaCategory.update({
      where: { id },
      data: {
        name,
        slug: calculatedSlug,
        description: description || ''
      }
    })

    revalidateTag('pujas')
    return NextResponse.json({ ok: true, data: category });
  } catch (err: any) {
    if (err.code === 'P2002') return NextResponse.json({ ok: false, error: 'A category with this name/slug already exists' }, { status: 400 });
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ ok: false, error: 'ID is required' }, { status: 400 });

    await prisma.pujaCategory.delete({
      where: { id }
    })

    revalidateTag('pujas')
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete category: Please remove or reassign all attached pujas first.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message || 'Delete failed.' }, { status: 500 });
  }
}
