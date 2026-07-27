import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    let logs = await prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    })



    const rows = logs.map(l => ({
      id: l.id,
      user: l.user?.fullName || l.user?.email || 'System / Guest',
      action: l.action,
      ip: l.ipAddress || '127.0.0.1',
      ua: l.userAgent || 'Chrome / Windows',
      time: l.createdAt.toLocaleString('en-IN')
    }))

    return NextResponse.json({ ok: true, data: rows });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Database error fetching logs' }, { status: 500 });
  }
}
