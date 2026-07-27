import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const settings = await prisma.websiteSetting.findMany({
      where: { key: { startsWith: 'payments.' } }
    })

    const data: Record<string, any> = {}
    settings.forEach(s => {
      const field = s.key.replace('payments.', '')
      // Parse booleans and numbers correctly if possible
      if (s.value === 'true') data[field] = true
      else if (s.value === 'false') data[field] = false
      else if (!isNaN(Number(s.value)) && s.value !== '') data[field] = Number(s.value)
      else data[field] = s.value
    })

    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Database error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json()
    const upserts: Promise<any>[] = []

    for (const [key, value] of Object.entries(body)) {
      let stringValue = ''
      if (typeof value === 'boolean') {
        stringValue = value ? 'true' : 'false'
      } else if (typeof value === 'number') {
        stringValue = value.toString()
      } else {
        stringValue = value as string
      }

      upserts.push(prisma.websiteSetting.upsert({
        where: { key: `payments.${key}` },
        create: { key: `payments.${key}`, value: stringValue, group: 'payments' },
        update: { value: stringValue }
      }))
    }

    await Promise.all(upserts)

    return NextResponse.json({ ok: true, message: 'Payment settings saved successfully' });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to save settings' }, { status: 500 });
  }
}
