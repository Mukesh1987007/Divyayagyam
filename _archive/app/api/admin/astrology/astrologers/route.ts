import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const astrologers = await prisma.astrologer.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ ok: true, data: astrologers });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Database error' }, { status: 500 });
  }
}
