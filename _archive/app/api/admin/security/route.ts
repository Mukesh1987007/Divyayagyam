import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    // Fetch Security Settings
    const settings = await prisma.websiteSetting.findMany({
      where: { key: { startsWith: 'security.' } }
    })
    
    const config: Record<string, any> = {}
    settings.forEach(s => {
      if (s.value === 'true') config[s.key] = true
      else if (s.value === 'false') config[s.key] = false
      else if (!isNaN(Number(s.value)) && s.value !== '') config[s.key] = Number(s.value)
      else config[s.key] = s.value
    })

    // Fetch Logs
    const logs = await prisma.auditLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, fullName: true } } }
    })

    return NextResponse.json({ ok: true, data: { config, logs } });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json()
    const { config } = body

    const upserts = []
    for (const [key, value] of Object.entries(config)) {
      let stringValue = ''
      if (typeof value === 'boolean') stringValue = value ? 'true' : 'false'
      else if (typeof value === 'number') stringValue = value.toString()
      else stringValue = value as string

      upserts.push(prisma.websiteSetting.upsert({
        where: { key },
        create: { key, value: stringValue, group: 'security' },
        update: { value: stringValue }
      }))
    }

    await Promise.all(upserts)
    return NextResponse.json({ ok: true, message: 'Security config updated' });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
