import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-session'

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const adminUser = await prisma.user.findUnique({ where: { email: session.email } })
    const userId = adminUser?.id || (await prisma.user.findFirst())?.id
    if (!userId) return NextResponse.json({ ok: false, error: 'No user available to author review' }, { status: 500 });

    const data = await req.json()
    const { productId, reviewerName, rating, title, comment } = data

    if (!productId || !reviewerName || !rating || !comment) {
      return NextResponse.json({ ok: false, error: 'Product ID, Reviewer Name, Rating, and Comment are required' }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        reviewerName,
        rating: Number(rating),
        title,
        comment,
        isVerified: true,
        isApproved: true
      }
    })

    return NextResponse.json({ ok: true, review });
  } catch (err: any) {
    console.error('[API Reviews POST Error]', err)
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to save review' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID is required' }, { status: 400 });
    }

    await prisma.review.delete({
      where: { id }
    })

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to delete review' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ ok: false, error: 'Product ID is required' }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true } } }
    })

    return NextResponse.json({ ok: true, reviews });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to fetch reviews' }, { status: 500 });
  }
}
