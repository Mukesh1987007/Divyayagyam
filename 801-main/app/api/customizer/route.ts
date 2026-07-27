import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {

    const settings = await prisma.websiteSetting.findMany({
      where: {
        OR: [
          { key: { startsWith: 'customizer.' } },
          { key: { startsWith: 'theme.' } },
          { key: { startsWith: 'site.' } }
        ]
      }
    })

    const data: Record<string, any> = { theme: {} }
    
    settings.forEach(s => {
      if (s.key === 'customizer.globalCss') data.globalCss = s.value
      else if (s.key === 'customizer.globalJs') data.globalJs = s.value
      else if (s.key === 'customizer.pageCustom') {
        try {
          data.pageCustom = typeof s.value === 'string' ? JSON.parse(s.value) : s.value
        } catch {
          data.pageCustom = s.value
        }
      }
      else if (s.key.startsWith('theme.') || s.key.startsWith('site.')) {
        data.theme[s.key] = typeof s.value === 'string' ? s.value.replace(/^"|"$/g, '') : s.value
      }
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

    const { globalCss, globalJs, pageCustom, theme } = await req.json()

    const upserts: any[] = []

    if (globalCss !== undefined) {
      upserts.push(prisma.websiteSetting.upsert({
        where: { key: 'customizer.globalCss' },
        create: { key: 'customizer.globalCss', value: globalCss, group: 'customizer' },
        update: { value: globalCss }
      }))
    }

    if (globalJs !== undefined) {
      upserts.push(prisma.websiteSetting.upsert({
        where: { key: 'customizer.globalJs' },
        create: { key: 'customizer.globalJs', value: globalJs, group: 'customizer' },
        update: { value: globalJs }
      }))
    }

    if (pageCustom !== undefined) {
      upserts.push(prisma.websiteSetting.upsert({
        where: { key: 'customizer.pageCustom' },
        create: { key: 'customizer.pageCustom', value: pageCustom, group: 'customizer' },
        update: { value: pageCustom }
      }))
    }

    if (theme && typeof theme === 'object') {
      for (const [k, v] of Object.entries(theme)) {
        upserts.push(prisma.websiteSetting.upsert({
          where: { key: k },
          create: { key: k, value: v as string, group: 'theme' },
          update: { value: v as string }
        }))
      }
    }

    await prisma.$transaction(upserts)

    return NextResponse.json({ ok: true, message: 'Settings saved successfully' });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to save settings' }, { status: 500 });
  }
}
