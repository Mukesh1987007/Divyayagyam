import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

const MODEL_MAPPING: Record<string, string> = {
  bookings: 'booking',
  orders: 'order',
  users: 'user',
  customers: 'customerProfile',
  testimonials: 'testimonial',
  events: 'event',
  gallery: 'gallery',
  bhaktiSeva: 'bhaktiSeva',
  astrology: 'astroReport',
  support: 'supportTicket',
  notifications: 'notification',
  blogs: 'blog',
  'blog-categories': 'blogCategory',
  'blog-comments': 'blogComment',
  media: 'mediaLibrary',
  coupons: 'coupon',
  newsletters: 'newsletter',
  settings: 'websiteSetting',
  payments: 'payment',
  temples: 'temple',
  pujas: 'puja',
  products: 'product',
  'puja-categories': 'pujaCategory',
  'product-categories': 'productCategory',
  'bhaktiSeva-offerings': 'bhaktiSevaOffering',
  'spiritual-tools': 'spiritualTool',
}

const RELATION_MAPPING: Record<string, any> = {
  booking: { user: { select: { fullName: true, email: true } }, puja: { select: { name: true } }, temple: { select: { name: true } } },
  order: { user: { select: { fullName: true, email: true } }, items: true },
  user: { role: true },
  bhaktiSeva: { user: { select: { fullName: true } }, temple: { select: { name: true } } },
  blog: { category: true, author: { select: { fullName: true, email: true } } },
  blogComment: { blog: true, user: true },
  supportTicket: { user: true },
  astroReport: { user: true },
  payment: { user: { select: { fullName: true } } },
  donation: { user: true, campaign: true, category: true },
  puja: { category: { select: { name: true } }, temple: { select: { name: true } } },
  product: { category: { select: { name: true } } },
}

function getPrismaModel(modelSlug: string) {
  const modelName = MODEL_MAPPING[modelSlug] || modelSlug
  if (!modelName) return null
  const client = prisma as any
  return client[modelName] ? { model: client[modelName], name: modelName } : null
}

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ model: string }> }
) {
  const params = await props.params;
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { model: modelSlug } = params
    const meta = getPrismaModel(modelSlug)
    if (!meta) {
      return NextResponse.json({ ok: false, error: `Model '${modelSlug}' not found` }, { status: 404 });
    }

    const include = RELATION_MAPPING[meta.name] || undefined

    let orderBy: any = undefined
    if (['blogCategory', 'productCategory'].includes(meta.name)) {
      orderBy = { order: 'asc' }
    } else if (meta.name === 'websiteSetting') {
      orderBy = undefined
    } else {
      orderBy = { createdAt: 'desc' }
    }

    const records = await meta.model.findMany({
      orderBy,
      include,
    })

    return NextResponse.json({ ok: true, data: records });
  } catch (err: any) {
// console.error('API GET Error:', err) (removed for production)
    return NextResponse.json({ ok: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ model: string }> }
) {
  const params = await props.params;
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { model: modelSlug } = params
    const meta = getPrismaModel(modelSlug)
    if (!meta) {
      return NextResponse.json({ ok: false, error: `Model '${modelSlug}' not found` }, { status: 404 });
    }

    const body = await req.json()
    const { id, ...data } = body

    // Simple schema cleanups for specific models
    if (meta.name === 'product' || meta.name === 'puja') {
      if (data.price) data.price = Number(data.price)
      if (data.salePrice) data.salePrice = Number(data.salePrice)
      if (data.vipPrice) data.vipPrice = Number(data.vipPrice)
    }

    let record
    if (id) {
      record = await meta.model.update({
        where: { id },
        data,
      })
    } else {
      record = await meta.model.create({
        data,
      })
    }

    return NextResponse.json({ ok: true, data: record });
  } catch (err: any) {
// console.error('API POST Error:', err) (removed for production)
    return NextResponse.json({ ok: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ model: string }> }
) {
  const params = await props.params;
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { model: modelSlug } = params
    const meta = getPrismaModel(modelSlug)
    if (!meta) {
      return NextResponse.json({ ok: false, error: `Model '${modelSlug}' not found` }, { status: 404 });
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID is required' }, { status: 400 });
    }

    await meta.model.delete({
      where: { id },
    })

    return NextResponse.json({ ok: true, message: 'Deleted successfully' });
  } catch (err: any) {
// console.error('API DELETE Error:', err) (removed for production)
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records that must be removed first.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ model: string }> }
) {
  const params = await props.params;
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { model: modelSlug } = params
    const meta = getPrismaModel(modelSlug)
    if (!meta) {
      return NextResponse.json({ ok: false, error: `Model '${modelSlug}' not found` }, { status: 404 });
    }

    const body = await req.json()
    const { action, ids, status, data } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ ok: false, error: 'Valid IDs array required' }, { status: 400 });
    }

    if (action === 'delete') {
      await meta.model.deleteMany({
        where: { id: { in: ids } },
      })
      return NextResponse.json({ ok: true, message: `Successfully deleted ${ids.length} records` });
    }

    if (action === 'status') {
      await meta.model.updateMany({
        where: { id: { in: ids } },
        data: { status },
      })
      return NextResponse.json({ ok: true, message: `Successfully updated status of ${ids.length} records` });
    }

    if (action === 'update' && data) {
      await meta.model.updateMany({
        where: { id: { in: ids } },
        data,
      })
      return NextResponse.json({ ok: true, message: `Successfully updated ${ids.length} records` });
    }

    return NextResponse.json({ ok: false, error: 'Invalid action specified' }, { status: 400 });
  } catch (err: any) {
// console.error('API PATCH Error:', err) (removed for production)
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: One or more selected items have linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ model: string }> }
) {
  return POST(req, props)
}
