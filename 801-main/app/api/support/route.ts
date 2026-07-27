import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { subject, description, category } = await req.json()

    if (!subject || !description) {
      return NextResponse.json({ ok: false, error: 'Subject and description are required' }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user.id,
        subject,
        description,
        category: category || 'General',
        ticketNumber: `TKT-${Math.floor(100000 + Math.random() * 900000)}`
      }
    })

    return NextResponse.json({ ok: true, data: ticket });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to submit ticket' }, { status: 500 });
  }
}
