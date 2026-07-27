'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'sonner'

// Safe localStorage access
const safeLocalStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    try { return window.localStorage.getItem(key); } catch { return null; }
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try { window.localStorage.setItem(key, value); } catch { /* ignore */ }
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    try { window.localStorage.removeItem(key); } catch { /* ignore */ }
  }
};


export type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

type CartContextType = {
  items: CartItem[]
  addToCart: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  cartTotal: number
  appliedCoupon: { id: string, code: string, discountAmount: number } | null
  applyCoupon: (coupon: { id: string, code: string, discountAmount: number }) => void
  removeCoupon: () => void
  discountAmount: number
  finalTotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: string, code: string, discountAmount: number } | null>(null)
  const [mounted, setMounted] = useState(false)

  // Safe localStorage access - ONLY on client
  useEffect(() => {
    try {
      const stored = safeLocalStorage.getItem('dy_cart')
      if (stored) setItems(JSON.parse(stored))
      
      const storedCoupon = safeLocalStorage.getItem('dy_coupon')
      if (storedCoupon) setAppliedCoupon(JSON.parse(storedCoupon))
    } catch (error) {
      console.warn('Failed to load cart from localStorage:', error)
    } finally {
      setMounted(true)
    }
  }, [])

  // Save to localStorage - ONLY when mounted
  useEffect(() => {
    if (mounted) {
      try {
        safeLocalStorage.setItem('dy_cart', JSON.stringify(items))
        if (appliedCoupon) {
          safeLocalStorage.setItem('dy_coupon', JSON.stringify(appliedCoupon))
        } else {
          safeLocalStorage.removeItem('dy_coupon')
        }
      } catch (error) {
        console.warn('Failed to save cart to localStorage:', error)
      }
    }
  }, [items, appliedCoupon, mounted])

  const addToCart = (product: Omit<CartItem, 'quantity'>, quantityToAdd = 1) => {
    setItems((current) => {
      const existing = current.find(item => item.id === product.id)
      if (existing) {
        return current.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantityToAdd } : item
        )
      }
      return [...current, { ...product, quantity: quantityToAdd }]
    })
  }

  const removeFromCart = (id: string) => {
    setItems(current => current.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id)
      return
    }
    setItems(current => 
      current.map(item => item.id === id ? { ...item, quantity } : item)
    )
  }

  const clearCart = () => {
    setItems([])
    setAppliedCoupon(null)
    safeLocalStorage.removeItem('dy_cart')
    safeLocalStorage.removeItem('dy_coupon')
  }

  const applyCoupon = (coupon: { id: string, code: string, discountAmount: number }) => {
    setAppliedCoupon(coupon)
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0
  const finalTotal = Math.max(0, cartTotal - discountAmount)

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQuantity, clearCart, 
      totalItems, cartTotal, appliedCoupon, applyCoupon, removeCoupon, discountAmount, finalTotal
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
