import { Card } from '@/components/ui/card'
import { Heart } from 'lucide-react'
import Link from 'next/link'
export const revalidate = 60; // ISR: Revalidate every 60s

export default function WishlistPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Wishlist</h1>
        <p className="text-muted-foreground text-sm">Sacred items and samagri you saved for later.</p>
      </div>

      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <Heart className="h-12 w-12 text-pink-500 mb-4 opacity-50" />
        <h3 className="font-semibold text-lg">Wishlist is Empty</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
          You haven't saved any products to your wishlist yet.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Browse Products
        </Link>
      </Card>
    </div>
  )
}
