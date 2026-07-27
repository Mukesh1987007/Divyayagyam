'use client'

import { useState } from 'react'
import Image from 'next/image';
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, ChevronRight, ShieldCheck, ShoppingBag, MapPin, Star, UserCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { FadeIn } from '@/components/ui/fade-in'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function ProductClientView({ product }: { product: any }) {
  const router = useRouter()
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  
  if (!product) return <div className="py-20 text-center">Product Not Found</div>

  const fallbackImage = process.env.NEXT_PUBLIC_URL_4681 || ''
  
  const allImages = [
    ...(product.coverImage ? [{ url: product.coverImage, alt: product.name }] : []),
    ...(product.images || []).map((img: any) => ({ url: img.url, alt: img.alt || product.name }))
  ]
  const [selectedMedia, setSelectedMedia] = useState(allImages[0]?.url || fallbackImage)
  
  const hasStock = product.inventory ? product.inventory.quantity > 0 : true
  const tagsList = product.tags ? product.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []
  const reviews = product.reviews || []
  
  // Calculate average rating
  const avgRating = reviews.length > 0 
    ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length 
    : 5 // default to 5 if no reviews

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.coverImage || fallbackImage
    }, quantity)
    setTimeout(() => router.push('/cart'), 50)
  }
  
  const isVideo = (url: string) => {
    return url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('video');
  }

  return (
    <div className="container py-6 lg:py-8 max-w-7xl">
      {/* Breadcrumbs */}
      <nav className="flex text-xs text-slate-500 mb-4 overflow-x-auto whitespace-nowrap pb-2">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3 mx-1 mt-0.5" />
        <Link href="/products" className="hover:text-primary transition-colors">Store</Link>
        <ChevronRight className="h-3 w-3 mx-1 mt-0.5" />
        <span className="text-slate-800 truncate">{product.name}</span>
      </nav>

      {/* Main Product Layout (3 Columns on Desktop) */}
      <div className="grid lg:grid-cols-12 gap-8 relative">
        
        {/* LEFT COL - MEDIA (Gallery) */}
        <div className="lg:col-span-5 flex flex-col md:flex-row gap-4 h-max">
          {/* Vertical Thumbnails (Desktop) */}
          <div className="hidden md:flex flex-col gap-3 w-20 shrink-0">
            {allImages.map((img, idx) => (
              <button 
                key={idx} 
                onMouseEnter={() => setSelectedMedia(img.url)}
                onClick={() => setSelectedMedia(img.url)}
                className={cn(
                  "aspect-square rounded-md overflow-hidden bg-white border-2 transition-all p-1",
                  selectedMedia === img.url ? "border-orange-500 shadow-sm" : "border-slate-200 hover:border-orange-300"
                )}
              >
                {isVideo(img.url) ? (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-700 text-[10px] font-bold">VIDEO</div>
                ) : (
                  <img src={img.url} alt={img.alt} className="w-full h-full object-contain mix-blend-multiply" />
                )}
              </button>
            ))}
          </div>

          {/* Main Viewer */}
          <div className="flex-1 aspect-square md:aspect-auto md:h-[500px] rounded-xl overflow-hidden bg-white border border-slate-200 relative p-4 flex items-center justify-center">
             {isVideo(selectedMedia) ? (
               <video src={selectedMedia} controls autoPlay muted loop className="w-full h-full object-contain" />
             ) : (
               <img 
                 src={selectedMedia} 
                 alt={product.name} 
                 className="w-full h-full object-contain mix-blend-multiply" 
               />
             )}
             {!hasStock && (
               <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                 <Badge className="bg-slate-900 text-white border-none shadow-lg text-lg px-6 py-2">Out of Stock</Badge>
               </div>
             )}
          </div>
          
          {/* Horizontal Thumbnails (Mobile) */}
          <div className="flex md:hidden gap-3 overflow-x-auto pb-2 w-full">
            {allImages.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setSelectedMedia(img.url)}
                className={cn(
                  "aspect-square h-16 shrink-0 rounded-md overflow-hidden bg-white border-2 transition-all p-1",
                  selectedMedia === img.url ? "border-orange-500 shadow-sm" : "border-slate-200"
                )}
              >
                {isVideo(img.url) ? (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white text-[8px] font-bold">VIDEO</div>
                ) : (
                  <img src={img.url} alt={img.alt} className="w-full h-full object-contain mix-blend-multiply" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* MIDDLE COL - DETAILS */}
        <div className="lg:col-span-4 space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">{product.name}</h1>
          
          {/* Ratings Snippet */}
          <div className="flex items-center gap-2">
            <div className="flex text-[#F4B400]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn("h-4 w-4", i < Math.round(avgRating) ? "fill-current" : "fill-slate-200 text-slate-200")} />
              ))}
            </div>
            <a href="#reviews" className="text-sm text-blue-600 hover:underline hover:text-orange-600">
              {reviews.length} ratings
            </a>
          </div>

          <hr className="border-slate-200" />

          {/* Price */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-normal text-slate-900">
                <span className="text-xl align-top mr-1">₹</span>
                {Number(product.price).toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-sm text-slate-500">Inclusive of all taxes</p>
          </div>

          <hr className="border-slate-200" />

          {/* Short Description / Features */}
          <div className="space-y-3">
             <h3 className="font-bold text-slate-900">About this item</h3>
             {tagsList.length > 0 && (
               <div className="flex flex-wrap gap-2 mb-3">
                 {tagsList.map((tag: string, idx: number) => (
                   <Badge key={idx} variant="outline" className="text-xs text-slate-600 bg-slate-50">
                     {tag}
                   </Badge>
                 ))}
               </div>
             )}
             <div className="prose prose-slate prose-sm text-slate-700 leading-relaxed" 
                  dangerouslySetInnerHTML={{ __html: product.shortDescription || product.description || 'Sacred and energized item directly from the holy shrines.' }} />
          </div>
        </div>

        {/* RIGHT COL - BUY BOX */}
        <div className="lg:col-span-3">
          <Card className="border-slate-200 shadow-sm sticky top-24">
            <CardContent className="p-5 space-y-5">
              <div className="text-2xl font-normal text-slate-900">
                <span className="text-lg align-top mr-1">₹</span>
                {Number(product.price).toLocaleString('en-IN')}
              </div>

              {/* Delivery Info */}
              <div className="flex gap-3 text-sm text-slate-700">
                <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
                <span><span className="font-semibold text-slate-900">Free Delivery</span> available on orders above ₹999.</span>
              </div>

              <div className="space-y-1">
                {hasStock ? (
                  <h4 className="text-lg font-medium text-green-700">In Stock</h4>
                ) : (
                  <h4 className="text-lg font-medium text-red-600">Out of Stock</h4>
                )}
                <p className="text-xs text-slate-500">Sold by DivyaYagyam</p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-slate-700">Quantity:</label>
                  <Select value={String(quantity)} onValueChange={(v) => setQuantity(Number(v))} disabled={!hasStock}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: Math.min(10, product.inventory?.quantity || 10) }).map((_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleAddToCart}
                  className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-black border border-[#FCD200] shadow-sm rounded-full h-10 text-sm font-normal"
                  disabled={!hasStock}
                >
                  Add to Cart
                </Button>
                <Button 
                  onClick={handleAddToCart}
                  className="w-full bg-[#FFA41C] hover:bg-[#FA8900] text-black border border-[#FF8F00] shadow-sm rounded-full h-10 text-sm font-normal"
                  disabled={!hasStock}
                >
                  Buy Now
                </Button>
              </div>

              <div className="flex items-center gap-2 pt-2 text-xs text-blue-600">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                <span className="hover:underline cursor-pointer">Secure transaction</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <hr className="my-10 border-slate-200" />

      {/* BOTTOM - PRODUCT DESCRIPTION */}
      {product.description && (
        <div className="mb-10 max-w-4xl">
           <h2 className="text-xl font-bold text-slate-900 mb-4">Product Description</h2>
           <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed" 
                dangerouslySetInnerHTML={{ __html: product.description }} />
        </div>
      )}

      <hr className="my-10 border-slate-200" />

      {/* BOTTOM - CUSTOMER REVIEWS */}
      <div id="reviews" className="grid md:grid-cols-12 gap-8 max-w-5xl">
        <div className="md:col-span-4 space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Customer reviews</h2>
          <div className="flex items-center gap-3">
            <div className="flex text-[#F4B400]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn("h-5 w-5", i < Math.round(avgRating) ? "fill-current" : "fill-slate-200 text-slate-200")} />
              ))}
            </div>
            <span className="text-lg font-medium text-slate-900">{avgRating.toFixed(1)} out of 5</span>
          </div>
          <p className="text-sm text-slate-500">{reviews.length} global ratings</p>
          
          {/* Fake Rating Bars for Visual effect */}
          <div className="space-y-2 mt-4">
            {[5, 4, 3, 2, 1].map(star => {
              const count = reviews.filter((r: any) => r.rating === star).length
              const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : (star === 5 ? 100 : 0)
              return (
                <div key={star} className="flex items-center gap-3 text-sm text-blue-600">
                  <span className="w-10 hover:underline cursor-pointer whitespace-nowrap">{star} star</span>
                  <div className="flex-1 h-4 bg-slate-100 rounded-sm overflow-hidden border border-slate-200">
                    <div className="h-full bg-[#FFA41C]" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-10 text-right hover:underline cursor-pointer">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="md:col-span-8 space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Top reviews</h3>
          {reviews.length === 0 ? (
            <p className="text-slate-500 italic">No reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="space-y-8">
              {reviews.map((r: any) => (
                <div key={r.id} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <UserCircle2 className="h-6 w-6 text-slate-300" />
                    {r.reviewerName || r.user?.firstName || 'Amazon Customer'}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex text-[#F4B400]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn("h-3.5 w-3.5", i < r.rating ? "fill-current" : "fill-slate-200 text-slate-200")} />
                      ))}
                    </div>
                    {r.title && <span className="text-sm font-bold text-slate-900">{r.title}</span>}
                  </div>
                  <p className="text-xs text-slate-500">Reviewed in India on {new Date(r.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="text-xs text-orange-600 font-bold">Verified Purchase</p>
                  <p className="text-sm text-slate-800 leading-relaxed mt-2">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

