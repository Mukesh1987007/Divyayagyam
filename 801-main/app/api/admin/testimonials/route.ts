import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const mode = searchParams.get('mode')

    // If fetching devotees for dropdown selection
    if (mode === 'devotees') {
      const devotees = await prisma.user.findMany({
        where: {
          role: { slug: 'devotee' },
        },
        select: {
          id: true,
          fullName: true,
          avatar: true,
          email: true,
        },
      })
      return NextResponse.json({ ok: true, data: devotees });
    }

    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ ok: true, data: testimonials });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, avatar, location, rating, message, isFeatured, isActive } = await req.json()

    if (!name || !message) {
      return NextResponse.json({ ok: false, error: 'Name and Message are required' }, { status: 400 });
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        avatar,
        location,
        rating: rating ? Number(rating) : 5,
        message,
        isFeatured: isFeatured !== undefined ? !!isFeatured : false,
        isActive: isActive !== undefined ? !!isActive : true,
      },
    })

    return NextResponse.json({ ok: true, data: testimonial });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, name, avatar, location, rating, message, isFeatured, isActive } = await req.json()

    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID is required for editing' }, { status: 400 });
    }

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        name,
        avatar,
        location,
        rating: rating ? Number(rating) : 5,
        message,
        isFeatured: isFeatured !== undefined ? !!isFeatured : undefined,
        isActive: isActive !== undefined ? !!isActive : undefined,
      },
    })

    return NextResponse.json({ ok: true, data: testimonial });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID is required' }, { status: 400 });
    }

    await prisma.testimonial.delete({
      where: { id },
    })

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
