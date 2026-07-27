import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const posts = await prisma.communityPost.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        author: {
          select: { id: true, fullName: true, avatar: true }
        },
        _count: {
          select: { likes: true, comments: true }
        },
        likes: {
          select: { userId: true } // Need this to know if current user liked it
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { id: true, fullName: true, avatar: true } }
          }
        }
      }
    })

    return NextResponse.json({ ok: true, data: posts });
  } catch (err: any) {
// console.error('Fetch posts error', err) (removed for production)
    return NextResponse.json({ ok: false, error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser().catch(() => null)
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { content, images = [] } = await req.json()
    if (!content) {
      return NextResponse.json({ ok: false, error: 'Content is required' }, { status: 400 });
    }

    const post = await prisma.communityPost.create({
      data: {
        content,
        images,
        authorId: user.id
      },
      include: {
        author: { select: { id: true, fullName: true, avatar: true } },
        _count: { select: { likes: true, comments: true } },
        likes: true,
        comments: true
      }
    })

    return NextResponse.json({ ok: true, data: post });
  } catch (err: any) {
// console.error('Create post error', err) (removed for production)
    return NextResponse.json({ ok: false, error: 'Failed to create post' }, { status: 500 });
  }
}
