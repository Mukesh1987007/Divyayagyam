
import Link from 'next/link'
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { AddToCartButton } from '@/components/add-to-cart-button'

import { HeroPujaSlider } from '@/components/hero-puja-slider'

export const revalidate = 30

export default async function ProductsPage() {
  const [products, heroSlides] = await Promise.all([
    prisma.product.findMany({
      where: {
        OR: [
          { status: 'ACTIVE' },
          { status: 'OUT_OF_STOCK' }
        ]
      },
      include: { category: true, inventory: true },
      orderBy: { createdAt: 'desc' }
    }).catch(() => []),
    prisma.heroSlider.findMany({
      where: { isActive: true, placement: 'PRODUCT' },
      orderBy: { order: 'asc' }
    }).catch(() => [])
  ])

  return (
    <div className="space-y-10">
      <HeroPujaSlider slides={heroSlides} />
      <div className="container py-4 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="secondary" className="mb-3">🛍️ Store</Badge>
        <h1 className="text-4xl md:text-5xl font-black text-om-gradient">Abhimantrit Prasad & Store</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          गंगाजल से अभिमंत्रित सिद्ध रुद्राक्ष माला, धूप-दीप, पूजन सामग्री और सिद्ध यंत्र।
        </p>
      </div>

      {products.length === 0 ? (
        <Card className="border-dashed max-w-md mx-auto">
          <CardContent className="p-8 text-center space-y-4">
            <Sparkles className="h-12 w-12 text-muted-foreground/60 mx-auto" />
            <h3 className="text-lg font-semibold">Store Coming Soon</h3>
            <p className="text-sm text-muted-foreground">We are preparing our sacred inventory. Please check back shortly or ask AI Pandit.</p>
            
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => {
            const hasStock = p.inventory ? p.inventory.quantity > 0 : true
            return (
              <Card key={p.id} className="overflow-hidden group hover:shadow-xl transition-all border border-primary/10 flex flex-col justify-between relative">
                <Link href={`/products/${p.slug}`} className="absolute inset-0 z-0" aria-label={`View ${p.name}`} />
                <div className="relative aspect-square bg-slate-100 overflow-hidden pointer-events-none">
                  {p.coverImage ? (
                    <Image src={p.coverImage}
                      alt={p.name}
                      fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-primary bg-[var(--secondary-color)]/10">
                      <Sparkles className="h-12 w-12 opacity-40" />
                    </div>
                  )}
                  {p.isAbhimantrit && (
                    <Badge className="absolute top-3 left-3 bg-[var(--primary-color)] text-white font-bold border-none text-[10px]">
                      🔥 अभिमंत्रित
                    </Badge>
                  )}
                  {!hasStock && (
                    <Badge className="absolute top-3 right-3 bg-slate-600 text-white font-bold border-none text-[10px]">
                      OUT OF STOCK
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3 relative z-10 pointer-events-none">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      {p.category?.name || 'Spiritual'}
                    </span>
                    <h3 className="font-bold text-base text-slate-800 line-clamp-2 leading-tight group-hover:text-[var(--primary-color)] transition-colors pointer-events-auto">
                      <Link href={`/products/${p.slug}`}>{p.name}</Link>
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-snug">
                      {p.shortDescription || 'Blessed spiritual item prepared with Vedic rituals.'}
                    </p>
                  </div>
                  <div className="pt-2 border-t flex items-center justify-between pointer-events-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground">मूल्य</span>
                      <span className="text-base font-black text-[var(--primary-color)]">₹{Number(p.price)}</span>
                    </div>
                    <AddToCartButton product={{ id: p.id, name: p.name, price: Number(p.price), coverImage: p.coverImage }} hasStock={hasStock} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
    </div>
  )
}


