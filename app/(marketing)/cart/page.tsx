'use client'

import { useCart } from '@/lib/cart-context'
import Image from 'next/image';
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, cartTotal, totalItems } = useCart()

  if (items.length === 0) {
    return (
      <div className="container py-20 flex flex-col items-center justify-center space-y-5">
        <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center">
          <ShoppingCart className="h-10 w-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-700">Your Cart is Empty</h2>
        <p className="text-slate-500">Explore our sacred store and add divine items to your cart.</p>
        <Button asChild className="bg-[var(--primary-color)] hover:bg-orange-700 font-bold rounded-xl h-12 px-8">
          <Link href="/products">Browse Store</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-14 max-w-5xl">
      <h1 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-3">
        <ShoppingCart className="h-8 w-8 text-[var(--primary-color)]" /> Your Cart
      </h1>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden shadow-sm">
              <CardContent className="p-4 flex gap-4 items-center">
                <div className="h-20 w-20 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-[var(--secondary-color)]/10 text-orange-300">
                      <ShoppingCart className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-bold text-slate-800 line-clamp-2">{item.name}</h3>
                  <p className="text-[var(--primary-color)] font-bold">₹{item.price}</p>
                </div>
                
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2 text-xs"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-4">
          <Card className="shadow-sm border-orange-100 bg-[var(--secondary-color)]/10/30 sticky top-6">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-bold text-lg text-slate-800">Order Summary</h3>
              
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Items ({totalItems})</span>
                  <span>₹{cartTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-slate-400">Calculated at checkout</span>
                </div>
                <div className="pt-3 border-t flex justify-between font-black text-lg text-slate-800">
                  <span>Subtotal</span>
                  <span className="text-[var(--primary-color)]">₹{cartTotal}</span>
                </div>
              </div>

              <Button asChild className="w-full h-12 bg-[var(--primary-color)] hover:bg-orange-700 text-white font-bold rounded-xl shadow-md">
                <Link href="/checkout">
                  Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

