import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (id) {
      const post = await prisma.blog.findUnique({
        where: { id }
      })
      if (!post) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
      
      const faqs = await prisma.fAQ.findMany({
        where: { category: `blog-${post.id}` },
        orderBy: { order: 'asc' }
      });
      
      return NextResponse.json({ ok: true, data: { ...post, faqs } });
    }

    const posts = await prisma.blog.findMany({
      include: {
        category: { select: { name: true } },
        author: { select: { fullName: true, email: true } },
        _count: {
          select: { comments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const mapped = posts.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      author: p.author?.fullName || p.author?.email || 'Unknown',
      category: p.category?.name || 'Uncategorized',
      views: p.views,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      seoKeywords: p.seoKeywords,
      comments: p._count?.comments || 0,
      status: p.status,
      date: p.createdAt.toLocaleDateString('en-IN')
    }))

    return NextResponse.json({ ok: true, data: mapped });
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
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const data = await req.json()
    const { title, slug, excerpt, content, categoryId, coverImage, status, publishedAt, seoTitle, seoDescription, seoKeywords, videoUrl, isVideoEnabled, faqs } = data

    if (!title || !categoryId) {
      return NextResponse.json({ ok: false, error: 'Title and Category are required' }, { status: 400 });
    }

    let calculatedSlug = slug || title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
    
    // Ensure uniqueness
    const existing = await prisma.blog.findUnique({ where: { slug: calculatedSlug } })
    if (existing) {
      calculatedSlug = `${calculatedSlug}-${Date.now().toString().slice(-4)}`
    }

    const post = await prisma.blog.create({
      data: {
        title,
        slug: calculatedSlug,
        excerpt: excerpt || '',
        content: content || '',
        categoryId,
        authorId: data.authorId || (await prisma.user.findUnique({ where: { email: session.email } }))?.id || null,
        coverImage: coverImage || null,
        status: status || 'DRAFT',
        publishedAt: publishedAt ? new Date(publishedAt) : (status === 'PUBLISHED' ? new Date() : null),
        seoTitle,
        seoDescription,
        seoKeywords,
        videoUrl,
        isVideoEnabled: isVideoEnabled !== undefined ? !!isVideoEnabled : true
      }
    })

    if (faqs && Array.isArray(faqs) && faqs.length > 0) {
      await prisma.fAQ.createMany({
        data: faqs.map((faq: any, i: number) => ({
          question: faq.question,
          answer: faq.answer,
          category: `blog-${post.id}`,
          order: i,
        }))
      })
    }

    return NextResponse.json({ ok: true, data: post });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    if (err.code === 'P2002') {
      return NextResponse.json({ ok: false, error: 'A post with this title/slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to create post' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ ok: false, error: 'ID is required' }, { status: 400 });

    const data = await req.json()
    
    // Auto generate slug if missing
    if (data.title && !data.slug) {
      data.slug = data.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
    }
    
    if (data.status === 'PUBLISHED') {
      data.publishedAt = data.publishedAt ? new Date(data.publishedAt) : new Date()
    } else {
      data.publishedAt = null
    }
    
    if (data.categoryId === 'none' || data.categoryId === '') {
      delete data.categoryId;
    }

    const { faqs, ...restData } = data;

    const post = await prisma.blog.update({
      where: { id },
      data: restData
    })

    if (faqs && Array.isArray(faqs)) {
      // Delete existing
      await prisma.fAQ.deleteMany({ where: { category: `blog-${post.id}` } })
      // Create new
      if (faqs.length > 0) {
        await prisma.fAQ.createMany({
          data: faqs.map((faq: any, i: number) => ({
            question: faq.question,
            answer: faq.answer,
            category: `blog-${post.id}`,
            order: i,
          }))
        })
      }
    }

    return NextResponse.json({ ok: true, data: post });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    if (err.code === 'P2002') {
      return NextResponse.json({ ok: false, error: 'A post with this title/slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ ok: false, error: 'ID is required' }, { status: 400 });

    await prisma.blog.delete({
      where: { id }
    })

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to delete post' }, { status: 500 });
  }
}
