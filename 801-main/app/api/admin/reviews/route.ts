import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {


    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'))
    const skip = (page - 1) * limit

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        skip,
        take: limit,
        include: {
          user: { select: { fullName: true, email: true } },
          product: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count()
    ])

    const rows = reviews.map(r => ({
      id: r.id,
      product: r.product?.name || 'Spiritual Item',
      user: r.user?.fullName || r.user?.email || 'Anonymous Devotee',
      rating: `${'⭐'.repeat(r.rating)} (${r.rating}/5)`,
      comment: r.comment || 'No comment text',
      date: r.createdAt.toLocaleDateString('en-IN')
    }))

    return NextResponse.json({ ok: true, data: rows, total, page, limit });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message || 'Database error fetching reviews' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ ok: false, error: 'Missing ID' }, { status: 400 });

    await prisma.review.delete({ where: { id } })
    return NextResponse.json({ ok: true, message: 'Review removed successfully' });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message || 'Delete failed' }, { status: 500 });
  }
}
