'use client'

import React from 'react'
import { Lock, ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { toast } from 'sonner'

export function PaywallOverlay({ tool }: { tool: any }) {
  const router = useRouter()
  const { addToCart } = useCart()

  const handleUnlock = () => {
    // Add the tool to cart and go to checkout
    addToCart({
      id: `tool-${tool.id}`,
      name: `Premium Tool: ${tool.name}`,
      price: Number(tool.price),
    })
    toast.success(`${tool.name} added to cart!`)
    router.push('/checkout')
  }

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
      
      <div className="relative z-20 bg-white border border-orange-100 shadow-2xl rounded-2xl p-8 max-w-md mx-auto transform translate-y-10">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 text-orange-600 rounded-full flex items-center justify-center mb-6 shadow-inner border border-orange-200">
          <Lock className="h-8 w-8" />
        </div>
        
        <h2 className="text-2xl font-black text-slate-900 mb-2">Premium Tool</h2>
        <p className="text-slate-600 mb-6 font-medium">
          Unlock full access to <strong className="text-slate-800">{tool.name}</strong> to continue exploring.
        </p>

        <div className="space-y-3 mb-8 text-sm text-slate-600 text-left bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="flex items-center gap-3">
            <Zap className="h-4 w-4 text-amber-500" />
            <span>Instant full access upon payment</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            <span>Lifetime updates and support</span>
          </div>
        </div>
        
        <Button 
          onClick={handleUnlock}
          size="lg" 
          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-xl shadow-orange-200/50 transition-all hover:scale-[1.02]"
        >
          Unlock for Rs. {Number(tool.price)}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
