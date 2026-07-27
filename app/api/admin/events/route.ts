import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const events = await prisma.event.findMany({
      include: {
        temple: { select: { name: true } }
      },
      orderBy: { startsAt: 'asc' }
    })

    return NextResponse.json({ ok: true, data: events });
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
    const { title, description, coverImage, location, startsAt, endsAt, isLive, isFeatured, streamUrl, isVideoEnabled, templeId } = data

    if (!title || !startsAt || !endsAt) {
      return NextResponse.json({ ok: false, error: 'Title, start time, and end time are required' }, { status: 400 });
    }

    let calculatedSlug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
    const existing = await prisma.event.findUnique({ where: { slug: calculatedSlug } })
    if (existing) {
      calculatedSlug = `${calculatedSlug}-${Date.now().toString().slice(-4)}`
    }

    const event = await prisma.event.create({
      data: {
        title,
        description: description || null,
        coverImage: coverImage || null,
        location: location || null,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        isLive: !!isLive,
        isFeatured: !!isFeatured,
        streamUrl: streamUrl || null,
        isVideoEnabled: isVideoEnabled !== undefined ? !!isVideoEnabled : true,
        templeId: templeId === 'none' ? null : templeId,
        slug: calculatedSlug
      }
    })

    return NextResponse.json({ ok: true, data: event });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    if (err.code === 'P2002') return NextResponse.json({ ok: false, error: 'An event with this title/slug already exists' }, { status: 400 });
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to create event' }, { status: 500 });
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
    
    if (data.startsAt) data.startsAt = new Date(data.startsAt)
    if (data.endsAt) data.endsAt = new Date(data.endsAt)
    if (data.templeId === 'none') data.templeId = null

    if (data.title && !data.slug) {
      let calculatedSlug = data.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
      const existing = await prisma.event.findUnique({ where: { slug: calculatedSlug } })
      if (existing && existing.id !== id) {
        calculatedSlug = `${calculatedSlug}-${Date.now().toString().slice(-4)}`
      }
      data.slug = calculatedSlug
    }
    
    const event = await prisma.event.update({
      where: { id },
      data
    })

    return NextResponse.json({ ok: true, data: event });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    if (err.code === 'P2002') return NextResponse.json({ ok: false, error: 'An event with this title/slug already exists' }, { status: 400 });
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ ok: false, error: 'ID is required' }, { status: 400 });

    await prisma.event.delete({
      where: { id }
    })

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to delete event' }, { status: 500 });
  }
}
