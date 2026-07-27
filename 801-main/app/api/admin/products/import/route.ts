import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

function parseCSV(text: string): Record<string, string>[] {
  const lines: string[] = []
  let currentLine = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (currentLine.trim()) {
        lines.push(currentLine)
      }
      currentLine = ''
      if (char === '\r' && text[i + 1] === '\n') {
        i++ // Skip \n after \r
      }
    } else {
      currentLine += char
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine)
  }

  if (lines.length < 2) return []

  // Clean and map headers
  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ''))
  const result: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const obj: Record<string, string> = {}
    headers.forEach((header, index) => {
      if (header) {
        const rawValue = values[index] || ''
        const cleanValue = rawValue.trim().replace(/^["']|["']$/g, '')
        obj[header] = cleanValue
      }
    })
    result.push(obj)
  }

  return result
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let currentValue = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(currentValue)
      currentValue = ''
    } else {
      currentValue += char
    }
  }
  result.push(currentValue)
  return result
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { csvText } = await req.json()
    if (!csvText || !csvText.trim()) {
      return NextResponse.json({ ok: false, error: 'CSV data is empty' }, { status: 400 });
    }

    const rows = parseCSV(csvText)
    if (rows.length === 0) {
      return NextResponse.json({ ok: false, error: 'No valid rows found in CSV' }, { status: 400 });
    }

    let createdCount = 0
    let updatedCount = 0
    let categoryCreatedCount = 0

    for (const row of rows) {
      const name = row.name || row.title || row.productname
      const categoryName = row.category || row.categoryname || 'Spiritual'
      const priceVal = Number(row.price || row.rate) || 0
      const salePriceVal = row.saleprice ? Number(row.saleprice) : null
      const skuVal = row.sku || null
      const shortDesc = row.shortdescription || row.shortdesc || ''
      const desc = row.description || row.desc || ''
      const isAbhimantritVal = row.isabhimantrit === 'true' || row.isabhimantrit === '1' || row.abhimantrit === 'true'
      const isFeaturedVal = row.isfeatured === 'true' || row.isfeatured === '1' || row.featured === 'true'
      const coverImageVal = row.coverimage || row.image || null
      const weightVal = row.weight ? Number(row.weight) : null
      
      let statusVal: 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED' = 'ACTIVE'
      const rawStatus = (row.status || '').toUpperCase()
      if (rawStatus === 'DRAFT') statusVal = 'DRAFT'
      else if (rawStatus === 'OUT_OF_STOCK' || rawStatus === 'OUTOFSTOCK') statusVal = 'OUT_OF_STOCK'
      else if (rawStatus === 'ARCHIVED') statusVal = 'ARCHIVED'

      if (!name) continue

      // Find or create category
      const categorySlug = slugify(categoryName)
      let category = await prisma.productCategory.findFirst({
        where: {
          OR: [
            { name: { equals: categoryName, mode: 'insensitive' } },
            { slug: categorySlug }
          ]
        }
      })

      if (!category) {
        category = await prisma.productCategory.create({
          data: {
            name: categoryName,
            slug: categorySlug,
            isActive: true,
            order: 0
          }
        })
        categoryCreatedCount++
      }

      // Find existing product by SKU or name or slug
      let existingProduct: { id: string; slug: string } | null = null
      if (skuVal) {
        existingProduct = await prisma.product.findUnique({
          where: { sku: skuVal }
        })
      }

      const calculatedSlug = row.slug || slugify(name)

      if (!existingProduct) {
        existingProduct = await prisma.product.findFirst({
          where: {
            OR: [
              { slug: calculatedSlug },
              { name: { equals: name, mode: 'insensitive' } }
            ]
          }
        })
      }

      const payload = {
        name,
        categoryId: category.id,
        sku: skuVal,
        shortDescription: shortDesc,
        description: desc,
        price: priceVal,
        salePrice: salePriceVal,
        isAbhimantrit: isAbhimantritVal,
        isFeatured: isFeaturedVal,
        coverImage: coverImageVal,
        weight: weightVal,
        status: statusVal
      }

      if (existingProduct) {
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            ...payload,
            slug: existingProduct.slug // Keep original slug
          }
        })
        updatedCount++
      } else {
        // Ensure slug uniqueness
        let finalSlug = calculatedSlug
        let count = 1
        while (true) {
          const dup = await prisma.product.findUnique({
            where: { slug: finalSlug }
          })
          if (!dup) break
          finalSlug = `${calculatedSlug}-${count}`
          count++
        }

        await prisma.product.create({
          data: {
            ...payload,
            slug: finalSlug
          }
        })
        createdCount++
      }
    }

    return NextResponse.json({
      ok: true,
      message: `CSV Import completed successfully!`,
      createdCount,
      updatedCount,
      categoryCreatedCount
    });
  } catch (err: any) {
// console.error('CSV Import Error:', err) (removed for production)
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to import CSV' }, { status: 500 });
  }
}
