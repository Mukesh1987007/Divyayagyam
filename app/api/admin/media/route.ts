import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url)
    const folder = searchParams.get('folder')

    const where: any = {}
    if (folder && folder !== 'all') {
      where.folder = folder
    }

    let media = await prisma.mediaLibrary.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })



    return NextResponse.json({ ok: true, data: media });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message || 'Database error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { url, filename, size, mimeType, folder, type } = await req.json()

    if (!url) {
      return NextResponse.json({ ok: false, error: 'URL is required' }, { status: 400 });
    }

    const media = await prisma.mediaLibrary.create({
      data: {
        url,
        filename: filename || 'Uploaded Media',
        size: size ? Number(size) : 0,
        mimeType: mimeType || 'image/jpeg',
        folder: folder || 'General',
        type: type || 'IMAGE',
        uploadedBy: (await prisma.user.findUnique({ where: { email: session.email } }))?.id || null
      }
    })

    return NextResponse.json({ ok: true, data: media });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message || 'Upload save failed' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id, filename, folder } = await req.json()

    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID is required' }, { status: 400 });
    }

    const media = await prisma.mediaLibrary.update({
      where: { id },
      data: {
        filename,
        folder
      }
    })

    return NextResponse.json({ ok: true, data: media });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID is required' }, { status: 400 });
    }

    await prisma.mediaLibrary.delete({ where: { id } })
    return NextResponse.json({ ok: true, message: 'Media removed successfully' });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message || 'Delete failed' }, { status: 500 });
  }
}
