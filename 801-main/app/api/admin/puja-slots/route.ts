import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url)
    const pujaId = searchParams.get('pujaId')

    const where = pujaId && pujaId !== 'all' ? { pujaId } : {}

    const slots = await prisma.pujaTimeSlot.findMany({
      where,
      include: {
        puja: { select: { name: true } }
      },
      orderBy: [
        { date: 'desc' },
        { startTime: 'asc' }
      ]
    })

    return NextResponse.json({ ok: true, data: slots });
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

    const { pujaId, date, startTime, endTime, capacity, isActive } = await req.json()
    if (!pujaId || !date || !startTime || !endTime) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
    }

    const slot = await prisma.pujaTimeSlot.create({
      data: {
        pujaId,
        date: new Date(date),
        startTime,
        endTime,
        capacity: Number(capacity) || 1,
        isActive: isActive !== undefined ? !!isActive : true
      },
      include: { puja: { select: { name: true } } }
    })

    return NextResponse.json({ ok: true, data: slot });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to create slot' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) return NextResponse.json({ ok: false, error: 'ID is required' }, { status: 400 });

    const { pujaId, date, startTime, endTime, capacity, isActive } = await req.json()

    const slot = await prisma.pujaTimeSlot.update({
      where: { id },
      data: {
        pujaId,
        date: date ? new Date(date) : undefined,
        startTime,
        endTime,
        capacity: capacity ? Number(capacity) : undefined,
        isActive: isActive !== undefined ? !!isActive : undefined
      },
      include: { puja: { select: { name: true } } }
    })

    return NextResponse.json({ ok: true, data: slot });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to update slot' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ ok: false, error: 'ID is required' }, { status: 400 });

    await prisma.pujaTimeSlot.delete({
      where: { id }
    })

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message || 'Delete failed. Slot might have bookings.' }, { status: 500 });
  }
}
