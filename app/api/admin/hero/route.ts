import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const placement = searchParams.get('placement') || 'HOME'

    if (id) {
      const slide = await prisma.heroSlider.findUnique({
        where: { id }
      })
      if (!slide) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
      return NextResponse.json({ ok: true, data: slide })
    }

    const slides = await prisma.heroSlider.findMany({
      where: { placement },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ ok: true, data: slides });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message || 'Database error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const data = await req.json()
    const { id, title, subtitle, image, ctaText, ctaUrl, order, isActive, placement } = data

    if (!title || !image) {
      return NextResponse.json({ ok: false, error: 'Title and image are required' }, { status: 400 });
    }

    const payload = {
      title,
      subtitle: subtitle || null,
      image,
      ctaText: ctaText || null,
      ctaUrl: ctaUrl || null,
      order: order ? Number(order) : 0,
      isActive: isActive !== undefined ? isActive : true,
      placement: placement || 'HOME'
    }

    if (id) {
      const slide = await prisma.heroSlider.update({
        where: { id },
        data: payload
      })
      return NextResponse.json({ ok: true, data: slide })
    } else {
      const slide = await prisma.heroSlider.create({
        data: payload
      })
      return NextResponse.json({ ok: true, data: slide })
    }
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to create slide' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ ok: false, error: 'ID is required' }, { status: 400 });

    const data = await req.json()

    // If order is passed as string, parse it
    if (data.order !== undefined) {
      data.order = parseInt(data.order) || 0
    }

    const slide = await prisma.heroSlider.update({
      where: { id },
      data
    })

    return NextResponse.json({ ok: true, data: slide });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to update slide' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ ok: false, error: 'ID is required' }, { status: 400 });

    await prisma.heroSlider.delete({
      where: { id }
    })

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to delete slide' }, { status: 500 });
  }
}
