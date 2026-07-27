import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const setting = await prisma.websiteSetting.findUnique({
      where: { key: 'social.queue' }
    })

    const queue = setting ? (typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value) : []

    return NextResponse.json({ ok: true, data: queue });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Database error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { title, description, mediaUrl, platforms, scheduledAt, postNow } = await req.json()

    if (!title || !description) {
      return NextResponse.json({ ok: false, error: 'Title and description required' }, { status: 400 });
    }

    const setting = await prisma.websiteSetting.findUnique({
      where: { key: 'social.queue' }
    })

    const queue = setting ? (typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value) : []

    const newPost = {
      id: Date.now().toString(),
      title,
      description,
      mediaUrl,
      platforms,
      scheduledAt: postNow ? new Date().toISOString() : new Date(scheduledAt).toISOString(),
      status: postNow ? 'PUBLISHED' : 'SCHEDULED',
      createdAt: new Date().toISOString()
    }

    queue.unshift(newPost)

    await prisma.websiteSetting.upsert({
      where: { key: 'social.queue' },
      create: { key: 'social.queue', value: JSON.stringify(queue), group: 'social' },
      update: { value: JSON.stringify(queue) }
    })

    return NextResponse.json({ 
      ok: true, 
      message: postNow ? 'Post published to all platforms!' : 'Post scheduled successfully!' 
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to save post' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ ok: false, error: 'ID required' }, { status: 400 });

    const setting = await prisma.websiteSetting.findUnique({
      where: { key: 'social.queue' }
    })

    if (!setting) return NextResponse.json({ ok: true });

    const queue = setting ? (typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value) : []
    const newQueue = queue.filter((q: any) => q.id !== id)

    await prisma.websiteSetting.update({
      where: { key: 'social.queue' },
      data: { value: JSON.stringify(newQueue) }
    })

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to delete post' }, { status: 500 });
  }
}
