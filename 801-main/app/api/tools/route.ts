import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const tools = await prisma.spiritualTool.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ ok: true, data: tools })
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Failed to fetch tools' }, { status: 500 })
  }
}
