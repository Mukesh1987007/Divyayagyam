import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { toolId } = await req.json()
    if (!toolId) {
      return NextResponse.json({ ok: false, error: 'Missing tool ID' }, { status: 400 });
    }

    const tool = await prisma.spiritualTool.findUnique({ where: { id: toolId } })
    if (!tool) {
      return NextResponse.json({ ok: false, error: 'Tool not found' }, { status: 404 });
    }

    // Get IP
    const ip = req.headers.get('x-forwarded-for') || 'unknown'

    // Check if a trial log already exists for this IP and Tool
    const existingLog = await prisma.toolUsageLog.findFirst({
      where: {
        toolId: tool.id,
        ipAddress: ip
      }
    })

    if (!existingLog) {
      await prisma.toolUsageLog.create({
        data: {
          toolId: tool.id,
          ipAddress: ip
        }
      })
      return NextResponse.json({ ok: true, message: 'Trial activated!' });
    } else {
      // Trial already activated previously, maybe expired?
      const daysSinceTrial = Math.floor((Date.now() - existingLog.usedAt.getTime()) / (1000 * 60 * 60 * 24))
      if (daysSinceTrial >= tool.trialDays) {
        return NextResponse.json({ ok: false, error: 'Trial expired' }, { status: 403 });
      }
      return NextResponse.json({ ok: true, message: 'Trial is already active.' });
    }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Server Error' }, { status: 500 });
  }
}
