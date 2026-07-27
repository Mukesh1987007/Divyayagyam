import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const temples = await prisma.temple.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ ok: true, data: temples });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { id, name, slug, deity, description, address, city, state, pincode, country, latitude, longitude, isFeatured, isActive, isVideoEnabled, coverImage, categoryId } = await req.json()

    if (!name) {
      return NextResponse.json({ ok: false, error: 'Name is required' }, { status: 400 });
    }

    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const payload = {
      name,
      slug: finalSlug,
      deity: deity || 'Lord Shiva',
      description,
      address,
      city,
      state,
      pincode,
      country: country || 'India',
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      isFeatured: isFeatured !== undefined ? !!isFeatured : false,
      isActive: isActive !== undefined ? !!isActive : true,
      isVideoEnabled: isVideoEnabled !== undefined ? !!isVideoEnabled : true,
      coverImage,
      categoryId: categoryId || null,
    }

    let temple
    if (id) {
      temple = await prisma.temple.update({
        where: { id },
        data: payload
      })
    } else {
      temple = await prisma.temple.create({
        data: payload
      })
    }

    return NextResponse.json({ ok: true, data: temple });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  return POST(req)
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID is required' }, { status: 400 });
    }

    await prisma.temple.delete({
      where: { id },
    })

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete temple: Please remove all pujas scheduled at this temple first.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
