'use client'

import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useRouter } from 'next/navigation'

export function AddToCartButton({ 
  product, 
  hasStock 
}: { 
  product: { id: string, name: string, price: number, coverImage?: string | null }, 
  hasStock: boolean 
}) {
  const { addToCart } = useCart()
  const router = useRouter()

  return (
    <Button 
      size="sm" 
      variant={hasStock ? 'default' : 'secondary'} 
      disabled={!hasStock} 
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        addToCart({
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.coverImage || undefined
        })
        setTimeout(() => router.push('/cart'), 50)
      }}
      className="bg-[var(--primary-color)] hover:bg-orange-700 text-white font-bold h-8 px-3 text-xs gap-1"
    >
      <ShoppingCart className="h-3.5 w-3.5" /> खरीदे (Buy)
    </Button>
  )
}

