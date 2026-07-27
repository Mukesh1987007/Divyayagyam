import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const offerings = await prisma.bhaktiSevaOffering.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ ok: true, data: offerings });
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
    const { name, description, price, image, videoUrl, isVideoEnabled, isActive } = data

    if (!name || !price) {
      return NextResponse.json({ ok: false, error: 'Name and Price are required' }, { status: 400 });
    }

    const offering = await prisma.bhaktiSevaOffering.create({
      data: {
        name,
        description: description || '',
        price: Number(price),
        image: image || null,
        videoUrl: videoUrl || null,
        isVideoEnabled: isVideoEnabled !== undefined ? !!isVideoEnabled : true,
        isActive: isActive !== undefined ? !!isActive : true
      }
    })

    return NextResponse.json({ ok: true, data: offering });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to create offering' }, { status: 500 });
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
    
    const offering = await prisma.bhaktiSevaOffering.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: Number(data.price) }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
        ...(data.isVideoEnabled !== undefined && { isVideoEnabled: !!data.isVideoEnabled }),
        ...(data.isActive !== undefined && { isActive: !!data.isActive }),
      }
    })

    return NextResponse.json({ ok: true, data: offering });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to update offering' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ ok: false, error: 'ID is required' }, { status: 400 });

    await prisma.bhaktiSevaOffering.delete({
      where: { id }
    })

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to delete offering' }, { status: 500 });
  }
}
