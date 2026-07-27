import { prisma } from '@/lib/prisma'
import { ProductClientView } from '@/components/product-client-view'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

export const revalidate = 3600; // ISR: Revalidate every 3600s

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug }
  })
  
  if (!product) return { title: 'Product Not Found' }
  
  return {
    title: product.seoTitle || `${product.name} | DivyaYagyam`,
    description: product.seoDescription || product.shortDescription || `Buy ${product.name} at DivyaYagyam.`,
    keywords: product.seoKeywords || undefined,
    openGraph: {
      title: product.seoTitle || `${product.name} | DivyaYagyam`,
      description: product.seoDescription || product.shortDescription || `Buy ${product.name} at DivyaYagyam.`,
      images: product.coverImage ? [product.coverImage] : []
    }
  }
}

export default async function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      inventory: true,
      images: {
        orderBy: { order: 'asc' }
      },
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true } } }
      }
    }
  })

  if (!product) {
    notFound()
  }

  return <ProductClientView product={product} />
}
