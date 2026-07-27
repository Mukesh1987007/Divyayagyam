import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        inventory: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const mapped = products.map((prod) => ({
      id: prod.id, // using productId as the id for frontend matching
      sku: prod.sku || 'N/A',
      product: prod.name,
      quantity: prod.inventory?.quantity || 0,
      reserved: prod.inventory?.reserved || 0,
      warehouse: prod.inventory?.warehouse || 'Main Warehouse',
    }))

    return NextResponse.json({ ok: true, data: mapped });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id, quantity, warehouse } = await req.json()

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Product ID is required' }, { status: 400 });
    }

    const existing = await prisma.inventory.findUnique({ where: { productId: id } })
    const previousQty = existing?.quantity || 0
    const newQty = Number(quantity)
    const change = newQty - previousQty
    const type = change >= 0 ? (change > 0 ? 'IN' : 'SET') : 'OUT'

    const updated = await prisma.inventory.upsert({
      where: { productId: id },
      create: {
        productId: id,
        quantity: newQty,
        warehouse: warehouse || null,
      },
      update: {
        quantity: newQty,
        warehouse: warehouse || null,
      },
    })

    if (change !== 0 || !existing) {
      await prisma.inventoryLog.create({
        data: {
          inventoryId: updated.id,
          type,
          change,
          previousQty,
          newQty,
          reason: 'Manual Admin Edit'
        }
      })
    }

    return NextResponse.json({ ok: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
