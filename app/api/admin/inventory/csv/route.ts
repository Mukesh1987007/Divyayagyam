import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ ok: false, error: 'No CSV file uploaded' }, { status: 400 });
    }

    const csvContent = await file.text()
    const lines = csvContent.split(/\r?\n/)
    if (lines.length <= 1) {
      return NextResponse.json({ ok: false, error: 'CSV file is empty' }, { status: 400 });
    }

    // Extract headers
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
    const records: any[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      const values = line.split(',').map((v) => v.trim())
      const record: Record<string, string> = {}
      headers.forEach((header, index) => {
        record[header] = values[index] || ''
      })
      records.push(record)
    }

    let updatedCount = 0
    let skippedCount = 0

    for (const record of records) {
      const sku = (record.sku || '').trim()
      if (!sku) continue

      const quantity = parseInt(record.quantity || record.stock || record.qty || '0')
      const warehouse = record.warehouse || 'Main Warehouse'

      // Find product by SKU
      const product = await prisma.product.findFirst({
        where: { sku: { equals: sku, mode: 'insensitive' } },
      })

      if (!product) {
        skippedCount++
        continue
      }

      // Find existing to calculate change
      const existing = await prisma.inventory.findUnique({ where: { productId: product.id } })
      const previousQty = existing?.quantity || 0
      const change = quantity - previousQty
      const type = change >= 0 ? (change > 0 ? 'IN' : 'SET') : 'OUT'

      // Upsert inventory
      const updated = await prisma.inventory.upsert({
        where: { productId: product.id },
        create: {
          productId: product.id,
          quantity,
          warehouse,
        },
        update: {
          quantity,
          warehouse,
        },
      })
      
      if (change !== 0 || !existing) {
        await prisma.inventoryLog.create({
          data: {
            inventoryId: updated.id,
            type,
            change,
            previousQty,
            newQty: quantity,
            reason: 'CSV Bulk Upload'
          }
        })
      }
      
      updatedCount++
    }

    return NextResponse.json({
      ok: true,
      message: `Successfully processed CSV! Updated inventory for ${updatedCount} products. Skipped ${skippedCount} unknown SKUs.`,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to process CSV' }, { status: 500 });
  }
}
