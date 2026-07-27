import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    // Load settings from database
    const dbSettingsList = await prisma.websiteSetting.findMany({
      where: {
        key: { startsWith: 'marketing.' }
      }
    })
    
    const data: Record<string, any> = {}
    dbSettingsList.forEach(s => {
      const fieldName = s.key.split('.')[1]
      data[fieldName] = s.value
    })

    const couponsCount = await prisma.coupon.count()
    const newsletterCount = await prisma.newsletter.count()

    return NextResponse.json({ 
      ok: true, 
      data,
      stats: { couponsCount, newsletterCount }
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Database error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json()
    
    for (const [key, value] of Object.entries(body)) {
      const fullKey = `marketing.${key}`
      await prisma.websiteSetting.upsert({
        where: { key: fullKey },
        create: {
          key: fullKey,
          value: value as any,
          group: 'marketing',
        },
        update: {
          value: value as any,
        }
      })
    }

    return NextResponse.json({ ok: true, message: 'Settings saved successfully' });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to save settings' }, { status: 500 });
  }
}
