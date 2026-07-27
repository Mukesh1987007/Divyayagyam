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

    const { content } = await req.json()
    if (!content) return NextResponse.json({ ok: false, error: 'Comment cannot be empty' }, { status: 400 });

    const comment = await prisma.communityComment.create({
      data: {
        postId,
        authorId: user.id,
        content
      },
      include: {
        author: { select: { id: true, fullName: true, avatar: true } }
      }
    })

    return NextResponse.json({ ok: true, data: comment });
  } catch (err: any) {
// console.error('Comment error', err) (removed for production)
    return NextResponse.json({ ok: false, error: 'Failed to post comment' }, { status: 500 });
  }
}
