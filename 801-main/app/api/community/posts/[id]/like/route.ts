import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params
    const user = await getCurrentUser().catch(() => null)
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!postId) return NextResponse.json({ ok: false, error: 'Post ID required' }, { status: 400 });

    const existingLike = await prisma.communityLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.id
        }
      }
    })

    if (existingLike) {
      // Unlike
      await prisma.communityLike.delete({
        where: { id: existingLike.id }
      })
      return NextResponse.json({ ok: true, liked: false });
    } else {
      // Like
      await prisma.communityLike.create({
        data: {
          postId,
          userId: user.id
        }
      })
      return NextResponse.json({ ok: true, liked: true });
    }
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: 'Failed to toggle like' }, { status: 500 });
  }
}
