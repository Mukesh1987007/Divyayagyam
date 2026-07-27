import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureDefaultCategoriesAndTemples } from '@/lib/data-defaults'
import { DEFAULT_PLACEHOLDER_IMAGE } from '@/lib/utils'
import { getAdminSession } from '@/lib/admin-session'
import { revalidateTag, revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    
    await ensureDefaultCategoriesAndTemples()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (id) {
      const puja = await prisma.puja.findUnique({
        where: { id },
        include: {
          category: true,
          temple: true,
          packages: true,
          images: {
            orderBy: { order: 'asc' }
          }
        }
      })
      if (!puja) {
        return NextResponse.json({ ok: false, error: 'Puja not found' }, { status: 404 });
      }
      return NextResponse.json({ ok: true, puja });
    }

    const pujas = await prisma.puja.findMany({
      include: {
        category: true,
        temple: true,
        packages: true,
        images: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ ok: true, pujas });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to fetch pujas' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    
    await ensureDefaultCategoriesAndTemples()
    const { id, name, slug, categoryId, location, shortDescription, description, benefits, price, vipPrice, duration, maxMembers, isVip, isOnline, isFeatured, status, coverImage, packages, images, publishedAt, seoTitle, seoDescription, seoKeywords } = await req.json()

    if (!name) {
      return NextResponse.json({ ok: false, error: 'Puja Name is required' }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json({ ok: false, error: 'Category is required' }, { status: 400 });
    }

    let calculatedSlug = slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')

    // Auto-resolve slug conflicts
    const existing = await prisma.puja.findUnique({ where: { slug: calculatedSlug } })
    if (existing && existing.id !== id) {
      calculatedSlug = `${calculatedSlug}-${Date.now().toString().slice(-4)}`
    }

    const finalPrice = Number(price) || 0
    const finalVipPrice = vipPrice ? Number(vipPrice) : null

    const payload: any = {
      name,
      slug: calculatedSlug,
      location: location || null,
      shortDescription: shortDescription || '',
      description: description || '',
      benefits: benefits || '',
      price: finalPrice,
      vipPrice: finalVipPrice,
      duration: Number(duration) || 60,
      maxMembers: Number(maxMembers) || 1,
      isVip: isVip !== undefined ? !!isVip : false,
      isOnline: isOnline !== undefined ? !!isOnline : false,
      isFeatured: isFeatured !== undefined ? !!isFeatured : false,
      status: status || 'DRAFT',
      publishedAt: publishedAt ? new Date(publishedAt) : (status === 'PUBLISHED' ? new Date() : null),
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      seoKeywords: seoKeywords || null,
      coverImage: coverImage || DEFAULT_PLACEHOLDER_IMAGE,
      category: { connect: { id: categoryId } }
    }

    let puja
    if (id) {
      // Edit mode: update puja, and recreate packages
      // Ensure templeId is nullified since we archived it from UI
      payload.temple = { disconnect: true }
      
      puja = await prisma.puja.update({
        where: { id },
        data: {
          ...payload,
          packages: {
            deleteMany: {},
            create: Array.isArray(packages) ? packages.map((pkg: any) => ({
              name: pkg.name,
              price: Number(pkg.price) || 0,
              description: pkg.description || ''
            })) : []
          }
        }
      })
    } else {
      // Create mode
      puja = await prisma.puja.create({
        data: {
          ...payload,
          packages: {
            create: Array.isArray(packages) ? packages.map((pkg: any) => ({
              name: pkg.name,
              price: Number(pkg.price) || 0,
              description: pkg.description || ''
            })) : []
          }
        }
      })
    }

    // Sync gallery images
    if (images && Array.isArray(images)) {
      await prisma.pujaImage.deleteMany({
        where: { pujaId: puja.id }
      })
      if (images.length > 0) {
        await prisma.pujaImage.createMany({
          data: images.map((url: string, index: number) => ({
            pujaId: puja.id,
            url: url || '',
            order: index
          }))
        })
      }
    }

    revalidateTag('pujas')
    revalidatePath('/pujas')

    return NextResponse.json({ ok: true, puja });
  } catch (err: any) {
    if (err.code === 'P2002') return NextResponse.json({ ok: false, error: 'A puja with this name/slug already exists' }, { status: 400 });
// console.error('[DEBUG Admin Pujas POST Error]', err) (removed for production)
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to save puja' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Puja ID is required' }, { status: 400 });
    }

    await prisma.puja.delete({
      where: { id }
    })

    revalidateTag('pujas')
    revalidatePath('/pujas')

    return NextResponse.json({ ok: true, message: 'Puja deleted successfully' });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete puja: This puja has existing bookings or time slots.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to delete puja' }, { status: 500 });
  }
}
