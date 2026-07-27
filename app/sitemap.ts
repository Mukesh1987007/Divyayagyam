import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { getDynamicSiteConfig } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let baseUrl = 'https://divyayagyam.com'

  try {
    const config = await getDynamicSiteConfig()
    if (config?.url) {
      baseUrl = config.url
    }
  } catch (e) {
    // Fallback to default domain on DB error
  }

  const sitemapEntries: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/pujas`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/tools`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  try {
    // 1. Pujas
    const pujas = await prisma.puja.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true }
    }).catch(() => [])

    pujas.forEach(p => {
      sitemapEntries.push({
        url: `${baseUrl}/pujas/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    })

    // 2. Products
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: { slug: true, updatedAt: true }
    }).catch(() => [])

    products.forEach(p => {
      sitemapEntries.push({
        url: `${baseUrl}/products/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    })

    // 3. Blog Posts
    const posts = await prisma.blog.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true }
    }).catch(() => [])

    posts.forEach(p => {
      sitemapEntries.push({
        url: `${baseUrl}/blog/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    })

    // 4. Spiritual Tools
    const tools = await prisma.spiritualTool.findMany({
      where: { isActive: true },
      select: { slug: true, createdAt: true }
    }).catch(() => [])

    tools.forEach(t => {
      sitemapEntries.push({
        url: `${baseUrl}/tools/${t.slug}`,
        lastModified: t.createdAt,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    })
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error)
  }

  return sitemapEntries
}
