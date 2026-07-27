import { prisma } from '@/lib/prisma'
import { PujaClientView } from '@/components/puja-client-view'
import { notFound } from 'next/navigation'
export const revalidate = 3600; // ISR: Revalidate every 3600s

import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const puja = await prisma.puja.findUnique({
    where: { slug },
    select: { name: true, shortDescription: true, seoTitle: true, seoDescription: true, seoKeywords: true, coverImage: true }
  });

  if (!puja) return { title: 'Not Found' };

  return {
    title: puja.seoTitle || puja.name,
    description: puja.seoDescription || puja.shortDescription || '',
    keywords: puja.seoKeywords || undefined,
    openGraph: {
      title: puja.seoTitle || puja.name,
      description: puja.seoDescription || puja.shortDescription || '',
      images: puja.coverImage ? [puja.coverImage] : [],
    }
  };
}
export default async function PujaDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const puja = await prisma.puja.findUnique({
    where: { slug },
    include: {
      category: true,
      temple: true,
      packages: true,
    }
  })

  if (!puja || puja.status !== 'PUBLISHED' || (puja.publishedAt && new Date(puja.publishedAt) > new Date())) {
    notFound()
  }

  return <PujaClientView puja={puja} />
}
