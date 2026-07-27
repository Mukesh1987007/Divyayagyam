import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const historySetting = await prisma.websiteSetting.findUnique({ where: { key: 'backup.history' } })
    const autoBackupSetting = await prisma.websiteSetting.findUnique({ where: { key: 'backup.autoBackup' } })

    const history = historySetting ? (typeof historySetting.value === 'string' ? JSON.parse(historySetting.value) : historySetting.value) : []
    const autoBackup = autoBackupSetting ? (typeof autoBackupSetting.value === 'string' ? autoBackupSetting.value === 'true' : !!autoBackupSetting.value) : false

    return NextResponse.json({ ok: true, backups: history, settings: { autoBackup } });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Database error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    // Simulate Backup Creation
    const historySetting = await prisma.websiteSetting.findUnique({ where: { key: 'backup.history' } })
    const history = historySetting ? (typeof historySetting.value === 'string' ? JSON.parse(historySetting.value) : historySetting.value) : []

    const newBackup = {
      filename: `divyayagyam_backup_${new Date().toISOString().split('T')[0]}.json`,
      size: Math.floor(Math.random() * (1024 * 1024 * 5)) + (1024 * 1024), // Random size 1-5MB
      createdAt: new Date().toISOString()
    }

    history.unshift(newBackup)

    await prisma.websiteSetting.upsert({
      where: { key: 'backup.history' },
      create: { key: 'backup.history', value: JSON.stringify(history), group: 'backup' },
      update: { value: JSON.stringify(history) }
    })

    return NextResponse.json({ ok: true, filename: newBackup.filename });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to generate backup' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { autoBackup } = await req.json()

    await prisma.websiteSetting.upsert({
      where: { key: 'backup.autoBackup' },
      create: { key: 'backup.autoBackup', value: autoBackup ? 'true' : 'false', group: 'backup' },
      update: { value: autoBackup ? 'true' : 'false' }
    })

    return NextResponse.json({ ok: true, message: 'Settings saved' });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to save settings' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url)
    const filename = searchParams.get('filename')
    if (!filename) return NextResponse.json({ ok: false, error: 'Filename missing' }, { status: 400 });

    const historySetting = await prisma.websiteSetting.findUnique({ where: { key: 'backup.history' } })
    if (!historySetting) return NextResponse.json({ ok: true });

    const history = typeof historySetting.value === 'string' ? JSON.parse(historySetting.value) : historySetting.value
    const newHistory = history.filter((h: any) => h.filename !== filename)

    await prisma.websiteSetting.update({
      where: { key: 'backup.history' },
      data: { value: JSON.stringify(newHistory) }
    })

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to delete backup' }, { status: 500 });
  }
}
