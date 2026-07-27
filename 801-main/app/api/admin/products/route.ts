import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {


    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (id) {
      const product = await prisma.product.findUnique({
        where: { id },
        include: { category: true, inventory: true, images: { orderBy: { order: 'asc' } } },
      })
      if (!product) return NextResponse.json({ ok: false, error: 'Product not found' }, { status: 404 })
      return NextResponse.json({ ok: true, product })
    }

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'))
    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        include: { category: true, inventory: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count()
    ])

    const mapped = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku || 'N/A',
      category: p.category?.name || 'Uncategorized',
      price: `₹${Number(p.price)}`,
      stock: p.inventory?.quantity ?? 0,
      status: p.status,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      seoKeywords: p.seoKeywords,
    }))

    return NextResponse.json({ ok: true, data: mapped, total, page, limit });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
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

    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete product: This product is part of existing orders.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const data = await req.json()
    const {
      id,
      name,
      slug,
      sku,
      categoryId,
      shortDescription,
      description,
      price,
      salePrice,
      isAbhimantrit,
      isFeatured,
      coverImage,
      weight,
      status,
      stock,
      tags,
      seoTitle,
      seoDescription,
      seoKeywords,
      extraImages
    } = data

    if (!name || !price || !categoryId) {
      return NextResponse.json({ ok: false, error: 'Name, Price, and Category are required' }, { status: 400 });
    }

    let calculatedSlug = slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')

    const existing = await prisma.product.findUnique({ where: { slug: calculatedSlug } })
    if (existing && existing.id !== id) {
      calculatedSlug = `${calculatedSlug}-${Date.now().toString().slice(-4)}`
    }

    const payload: any = {
      name,
      slug: calculatedSlug,
      sku: sku || null,
      categoryId,
      shortDescription: shortDescription || '',
      description: description || '',
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : null,
      isAbhimantrit: !!isAbhimantrit,
      isFeatured: !!isFeatured,
      coverImage: coverImage || null,
      weight: weight ? Number(weight) : null,
      status: status || 'DRAFT',
      tags: tags || null,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      seoKeywords: seoKeywords || null
    }

    let product
    if (id) {
      product = await prisma.product.update({
        where: { id },
        data: payload
      })
      if (stock !== undefined) {
        await prisma.inventory.upsert({
          where: { productId: product.id },
          create: { productId: product.id, quantity: Number(stock) || 0 },
          update: { quantity: Number(stock) || 0 }
        })
      }
      
      // Update extra images
      if (Array.isArray(extraImages)) {
        await prisma.productImage.deleteMany({ where: { productId: product.id } })
        if (extraImages.length > 0) {
          await prisma.productImage.createMany({
            data: extraImages.map((url: string, index: number) => ({
              productId: product.id,
              url,
              order: index
            }))
          })
        }
      }
    } else {
      product = await prisma.product.create({
        data: payload
      })
      await prisma.inventory.create({
        data: { productId: product.id, quantity: Number(stock) || 0 }
      })
      
      // Add extra images
      if (Array.isArray(extraImages) && extraImages.length > 0) {
        await prisma.productImage.createMany({
          data: extraImages.map((url: string, index: number) => ({
            productId: product.id,
            url,
            order: index
          }))
        })
      }
    }

    return NextResponse.json({ ok: true, data: product });
  } catch (err: any) {
    if (err.code === 'P2002') return NextResponse.json({ ok: false, error: 'A product with this name/slug already exists' }, { status: 400 });
// console.error('[API Products POST Error]', err) (removed for production)
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to save product' }, { status: 500 });
  }
}
