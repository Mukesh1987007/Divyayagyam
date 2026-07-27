import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result.map(v => v.replace(/^"|"$/g, '').trim()); // Strip wrapping quotes
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ ok: false, error: 'No CSV file uploaded' }, { status: 400 });
    }

    let csvContent = await file.text()
    // Strip UTF-8 Byte Order Mark (BOM) if present
    if (csvContent.startsWith('\uFEFF')) {
      csvContent = csvContent.slice(1)
    }

    const lines = csvContent.split(/\r?\n/)
    if (lines.length <= 1) {
      return NextResponse.json({ ok: false, error: 'CSV file is empty' }, { status: 400 });
    }

    // Extract headers using robust CSV parser
    const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase())
    const records: any[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      const values = parseCSVLine(line)
      const record: Record<string, string> = {}
      headers.forEach((header, index) => {
        record[header] = values[index] || ''
      })
      records.push(record)
    }

    let createdCount = 0
    let updatedCount = 0

    for (const record of records) {
      const name = record.name || record.productname || record.title
      if (!name) continue

      const categoryName = record.category || 'General'
      const categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')

      // 1. Find or create category
      let category = await prisma.productCategory.findUnique({
        where: { slug: categorySlug },
      })

      if (!category) {
        category = await prisma.productCategory.create({
          data: {
            name: categoryName,
            slug: categorySlug,
          },
        })
      }

      // 2. Prepare product fields
      const slug = (record.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).trim()
      const sku = (record.sku || `PROD-${slug.slice(0, 8).toUpperCase()}`).trim()
      const price = Number(record.price || record.baseprice || 0)
      const salePrice = record.saleprice ? Number(record.saleprice) : null
      const shortDescription = record.shortdescription || record.summary || null
      const description = record.description || record.fulldescription || null
      const weight = record.weight ? parseFloat(record.weight) : null
      const stock = record.stock || record.quantity ? parseInt(record.stock || record.quantity) : 100

      // Check if product exists to determine if it is new
      const existingProduct = await prisma.product.findUnique({
        where: { slug },
        select: { id: true }
      })
      const isNew = !existingProduct

      // 3. Upsert product
      const product = await prisma.product.upsert({
        where: { slug },
        create: {
          categoryId: category.id,
          name,
          slug,
          sku,
          shortDescription,
          description,
          price,
          salePrice,
          weight,
          status: 'ACTIVE',
        },
        update: {
          categoryId: category.id,
          name,
          sku,
          shortDescription,
          description,
          price,
          salePrice,
          weight,
          status: 'ACTIVE',
        },
      })

      // 4. Upsert inventory
      await prisma.inventory.upsert({
        where: { productId: product.id },
        create: {
          productId: product.id,
          quantity: stock,
        },
        update: {
          quantity: stock,
        },
      })

      if (isNew) {
        createdCount++
      } else {
        updatedCount++
      }
    }

    if (createdCount === 0 && updatedCount === 0) {
      return NextResponse.json({
        ok: false,
        error: 'No valid products found in CSV. Please verify that your CSV matches headers exactly: name, slug, category, sku, shortDescription, description, price, salePrice, weight, stock'
      }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: `Successfully processed CSV! Created ${createdCount} new products, updated ${updatedCount} existing products.`,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to process CSV' }, { status: 500 });
  }
}
