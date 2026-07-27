'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image';
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowRight, CheckCircle2, Calendar, MapPin, User, Plus, Edit2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import Script from 'next/script'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, cartTotal, totalItems, clearCart, addToCart, removeFromCart, updateQuantity, appliedCoupon, applyCoupon, removeCoupon, finalTotal, discountAmount } = useCart()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [bhaktiSevaOfferings, setBhaktiSevaOfferings] = useState<any[]>([])
  const [couponCode, setCouponCode] = useState('')
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [step, setStep] = useState<'addons' | 'details'>('addons')

  const [address, setAddress] = useState({
    name: '',
    phone: '',
    pincode: '',
    street: '',
    city: '',
    state: ''
  })

  const [sankalp, setSankalp] = useState({
    gotra: '',
    purpose: ''
  })
  const [showSankalpModal, setShowSankalpModal] = useState(false)
  const [acceptedTnC, setAcceptedTnC] = useState(false)
  const [customDakshinaInput, setCustomDakshinaInput] = useState('2100')

  const isItemInCart = (id: string) => items.some(i => i.id === id)
  const dakshinaItem = items.find(i => i.id === 'addon-dakshina')

  const handleDakshinaSelect = (amt: number) => {
    if (dakshinaItem && dakshinaItem.price === amt) {
       removeFromCart('addon-dakshina')
       toast.info(`Dakshina removed`)
    } else {
       if (dakshinaItem) removeFromCart('addon-dakshina')
       addToCart({ id: 'addon-dakshina', name: 'Pandit Dakshina', price: amt, image: '' })
       toast.success(`Dakshina ₹${amt} added!`)
    }
  }

  const toggleAddonToCart = (id: string, price: number, name: string, image?: string) => {
    const fullId = `addon-${id}`
    if (isItemInCart(fullId)) {
      removeFromCart(fullId)
      toast.info(`${name} removed`)
    } else {
      addToCart({ id: fullId, name, price, image: image || '' })
      toast.success(`${name} added!`)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/profile')
        if (res.status === 401) {
          toast.error('Please login to complete your order')
          router.push('/login?callbackUrl=/checkout')
          return
        }
        const data = await res.json()
        if (data.ok && data.user) {
          setUser(data.user)
          setAddress(prev => ({
            ...prev,
            name: data.user.fullName || '',
            phone: data.user.phone || ''
          }))
          if (data.user.customerProfile?.gotra) {
             setSankalp(prev => ({ ...prev, gotra: data.user.customerProfile.gotra }))
          }
        }
      } catch (err) {
        console.error('Checkout auth error:', err)
        toast.error('Authentication check failed')
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  // Fetch BhaktiSeva Offerings
  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        const res = await fetch('/api/bhaktiseva')
        const data = await res.json()
        if (data.offerings) {
          setBhaktiSevaOfferings(data.offerings)
        }
      } catch (err) {
        console.error('Failed to fetch offerings:', err)
      }
    }
    fetchOfferings()
  }, [])

  useEffect(() => {
    if (!loading && items.length === 0) {
      router.push('/cart')
    }
  }, [loading, items.length, router])

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code')
      return
    }
    setValidatingCoupon(true)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, cartTotal })
      })
      const data = await res.json()
      if (data.ok && data.coupon) {
        applyCoupon(data.coupon)
        toast.success(`Coupon applied! You saved ₹${data.coupon.discountAmount}`)
        setCouponCode('')
      } else {
        toast.error(data.error || 'Invalid coupon')
      }
    } catch (err) {
      toast.error('Failed to validate coupon')
    } finally {
      setValidatingCoupon(false)
    }
  }



  const initiatePayment = () => {
    if (!address.name || !address.phone || !address.pincode || !address.street || !address.city || !address.state) {
      toast.error('Please fill all address fields completely')
      return
    }
    // Only show Sankalp modal if a Puja is in the cart
    if (items.some(i => i.id.startsWith('puja-'))) {
      setShowSankalpModal(true)
    } else {
      handlePayment()
    }
  }

  const handlePayment = async () => {

    setProcessing(true)
    try {
      const sankalpNotes = sankalp.gotra || sankalp.purpose ? `[Sankalp] Gotra: ${sankalp.gotra} | Purpose: ${sankalp.purpose}` : '';
      
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ id: i.id, quantity: i.quantity })),
          shippingAddress: address,
          notes: sankalpNotes,
          couponCode: appliedCoupon?.code
        })
      })
      const data = await res.json()

      if (!data.ok) {
        toast.error(data.error || 'Order creation failed')
        setProcessing(false)
        return
      }

      if (data.mode === 'manual') {
        clearCart()
        toast.success(`ðŸŽ‰ ${data.message || 'Order placed successfully!'}`)
        toast.info(`Order No: ${data.orderNumber}`, { duration: 8000 })
        router.push('/dashboard/orders')
        return
      }

      const { orderId, amount, currency, receipt, razorpayKeyId } = data.paymentData

      const options = {
        key: razorpayKeyId,
        amount,
        currency,
        name: 'Divya Yagyam',
        description: 'Store Purchase',
        order_id: orderId,
        handler: function (response: any) {
          clearCart()
          toast.success('Payment Successful! Order placed.')
          router.push('/dashboard/orders')
        },
        prefill: {
          name: address.name,
          email: user?.email || '',
          contact: address.phone
        },
        theme: { color: '#ea580c' }
      }

      if (!(window as any).Razorpay) {
        toast.error('Payment system is still loading. Please try again in a moment.')
        setProcessing(false)
        return
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
        toast.error(response.error.description || 'Payment Failed')
      })
      rzp.open()

    } catch (err) {
      toast.error('Error processing order')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <div className="p-20 text-center flex justify-center"><Loader2 className="animate-spin text-orange-600" /></div>
  if (items.length === 0) return null 

  const primaryItem = items[0] || { name: 'Puja Booking', price: 0 }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="min-h-screen bg-slate-50 text-gray-800 font-sans pb-24">
        
        {step === 'addons' && (
          <div className="container max-w-6xl mx-auto px-4 pt-6 pb-24">
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Puja Details & Add-ons */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Puja Header Card */}
                <Card className="border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <button onClick={() => router.back()} className="mt-1 text-gray-800 hover:text-orange-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                      </button>
                      <div className="space-y-3 flex-1">
                        <h1 className="text-lg md:text-xl font-bold text-gray-900 leading-snug pr-4">
                          {primaryItem.name}
                        </h1>
                        <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-orange-100">
                          âœ¦ Selected Puja
                        </span>
                        
                        {/* Metadata Details */}
                        <div className="space-y-2 text-sm text-gray-600 pt-2">
                          <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                            <span>Sacred Temple / Online Booking</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                            <span>As per selected slot</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="text-gray-800 font-medium">{primaryItem.name} - {totalItems} Item(s) ( ₹ {cartTotal} )</span>
                            <button onClick={() => router.back()} className="text-orange-600 text-xs font-semibold flex items-center gap-1 ml-2 hover:underline">
                              <Edit2 className="w-3 h-3" /> Change Package
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Add-on Cards Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'courier', title: 'Prasad Courier Fee', price: 99 },
                  ].map((addon) => {
                    const inCart = isItemInCart(`addon-${addon.id}`)
                    return (
                    <div key={addon.id} onClick={() => toggleAddonToCart(addon.id, addon.price, addon.title)} className={`cursor-pointer border rounded-xl p-4 flex items-start justify-between shadow-sm transition-all ${inCart ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                      <div>
                        <div className="mb-2">
                           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        </div>
                        <p className="text-sm text-gray-800 font-semibold mb-1">{addon.title}</p>
                        <p className="text-sm text-gray-500">₹ {addon.price}</p>
                      </div>
                      <button className={`w-6 h-6 rounded-full flex items-center justify-center border ${inCart ? 'bg-green-600 border-green-600 text-white' : 'border-gray-400 text-gray-600'}`}>
                        {inCart ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </button>
                    </div>
                  )})}
                </div>

                {/* Pandit Dakshina Custom Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                     <h3 className="font-bold text-gray-900 text-base">Pandit Dakshina (Optional)</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">Support the pandits performing your sacred puja.</p>
                  
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {[251, 551, 1100].map(amt => {
                      const isSelected = dakshinaItem?.price === amt
                      return (
                        <button 
                          key={amt} 
                          onClick={() => handleDakshinaSelect(amt)}
                          className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${isSelected ? 'bg-orange-600 text-white border-orange-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-orange-300 hover:bg-orange-50'}`}
                        >
                          ₹ {amt}
                        </button>
                      )
                    })}
                    
                    {/* Custom Input */}
                    <div className={`flex items-center border rounded-lg overflow-hidden transition-all ${(![251,551,1100].includes(dakshinaItem?.price || 0) && dakshinaItem) ? 'border-orange-600 ring-1 ring-orange-600 shadow-md' : 'border-slate-200 focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-400'}`}>
                      <span className="px-3 text-slate-500 font-bold bg-slate-50 h-full flex items-center">₹</span>
                      <input 
                        type="number" 
                        value={customDakshinaInput} 
                        onChange={(e) => setCustomDakshinaInput(e.target.value)}
                        placeholder="2100"
                        className="w-20 px-2 py-2 text-sm font-bold outline-none text-slate-700 bg-white"
                      />
                      <button 
                        onClick={() => handleDakshinaSelect(Number(customDakshinaInput) || 2100)}
                        className={`px-4 py-2 text-sm font-bold transition-all border-l ${(![251,551,1100].includes(dakshinaItem?.price || 0) && dakshinaItem) ? 'bg-orange-600 text-white border-orange-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'}`}
                      >
                        {(![251,551,1100].includes(dakshinaItem?.price || 0) && dakshinaItem) ? 'Added' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sacred Offerings Section */}
                {bhaktiSevaOfferings.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900">Sacred offerings</h2>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {bhaktiSevaOfferings.map((offering) => (
                        <div key={offering.id} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 shadow-sm relative">
                          <div className="space-y-2 flex-1">
                            <span className="text-[10px] font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md">
                              Sacred BhaktiSeva
                            </span>
                            <h3 className="font-bold text-sm text-gray-900 mt-1">{offering.name}</h3>
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {offering.description || `Offer ${offering.name} for divine blessings.`}
                            </p>
                            <p className="font-bold text-sm text-gray-900 pt-1">₹ {offering.price}</p>
                          </div>
                          <div className="relative flex flex-col items-center justify-center w-24">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                              {offering.image ? (
                                <img src={offering.image} alt={offering.name} className="w-full h-full object-cover fallback-bg-orange-100" />
                              ) : (
                                <span className="text-xs text-gray-400">No Img</span>
                              )}
                            </div>
                            <button 
                              onClick={() => toggleAddonToCart(`bhaktiSeva-${offering.id}`, Number(offering.price), offering.name, offering.image)} 
                              className={`absolute -bottom-2 text-white text-xs font-bold px-4 py-1 rounded-md shadow-md ${isItemInCart(`addon-bhaktiSeva-${offering.id}`) ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                              {isItemInCart(`addon-bhaktiSeva-${offering.id}`) ? 'Remove' : 'Add'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Bill Details (Sticky) */}
              <div className="lg:col-span-4 relative">
                <div className="sticky top-24">
                  <Card className="border-gray-200 shadow-sm rounded-xl">
                    <CardContent className="p-5">
                      <h3 className="font-bold text-gray-900 text-sm mb-4">Your Offerings & Items</h3>
                      
                      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 mb-4 border-b border-dashed border-gray-200 pb-4">
                        {items.map(item => (
                          <div key={item.id} className="flex justify-between items-start text-sm border-b pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
                            <div className="flex-1 min-w-0 pr-3">
                              <p className="font-semibold text-slate-800 line-clamp-2">{item.name}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center border rounded-md h-7 overflow-hidden">
                                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 h-full bg-slate-50 hover:bg-slate-100 text-slate-600 border-r">-</button>
                                  <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 h-full bg-slate-50 hover:bg-slate-100 text-slate-600 border-l">+</button>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center gap-1"><Trash2 className="w-3 h-3"/> Remove</button>
                              </div>
                            </div>
                            <span className="font-bold text-orange-600 whitespace-nowrap mt-1">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center mb-6">
                        <span className="font-bold text-lg text-gray-900">Total</span>
                        <span className="font-black text-xl text-green-600">₹ {cartTotal}</span>
                      </div>

                      <Button 
                        onClick={() => setStep('details')} 
                        className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-lg shadow-lg shadow-orange-200"
                      >
                        Proceed to Checkout
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                      <p className="text-center text-xs text-slate-400 mt-3">100% Secure & Encrypted Payments</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

            </div>

            {/* Sticky Bottom Action for Mobile (Hidden on lg) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
              <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
                <div className="font-bold text-gray-900">
                  <p className="text-xs text-gray-500 font-medium">To Pay</p>
                  <p className="text-lg text-green-600">₹ {cartTotal}</p>
                </div>
                <button 
                  onClick={() => setStep('details')} 
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition shadow-sm flex items-center justify-center gap-2"
                >
                  Proceed
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="container py-14 max-w-6xl">
             <div className="flex items-center gap-4 mb-8">
               <button onClick={() => setStep('addons')} className="text-orange-600 font-bold hover:underline flex items-center gap-1">
                 <ArrowRight className="h-4 w-4 rotate-180" /> Back to Add-ons
               </button>
               <h1 className="text-3xl font-black text-slate-800">
                 {items.some(i => i.id.startsWith('puja-')) ? 'Sankalp & Billing' : 'Secure Checkout'}
               </h1>
             </div>
             
             <div className="grid lg:grid-cols-12 gap-10">
               <div className="lg:col-span-7 space-y-6">
                 
                 {/* Sankalp form moved to popup */}

                 <Card className="border-orange-100 shadow-sm">
                   <CardContent className="p-6 space-y-4">
                     <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                       <CheckCircle2 className="h-5 w-5 text-green-600" /> Shipping Details
                     </h2>
                     <div className="grid md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <Label>Full Name</Label>
                         <Input value={address.name} onChange={e => setAddress({...address, name: e.target.value})} placeholder="John Doe" />
                       </div>
                       <div className="space-y-2">
                         <Label>Phone Number</Label>
                         <Input value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} placeholder="+91 9587171984" />
                       </div>
                       <div className="space-y-2 md:col-span-2">
                         <Label>Street Address (House No, Building, Area)</Label>
                         <Input value={address.street} onChange={e => setAddress({...address, street: e.target.value})} placeholder="123 Spiritual Lane..." />
                       </div>
                       <div className="space-y-2">
                         <Label>City</Label>
                         <Input value={address.city} onChange={e => setAddress({...address, city: e.target.value})} placeholder="Varanasi" />
                       </div>
                       <div className="space-y-2">
                         <Label>State</Label>
                         <Input value={address.state} onChange={e => setAddress({...address, state: e.target.value})} placeholder="Uttar Pradesh" />
                       </div>
                       <div className="space-y-2">
                         <Label>Pincode</Label>
                         <Input value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} placeholder="221001" />
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               </div>
     
               <div className="lg:col-span-5 order-first lg:order-last">
                 <Card className="bg-slate-50 border-none shadow-md">
                   <CardContent className="p-6 space-y-6">
                     <h3 className="font-bold text-lg">Order Items</h3>
                     <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                       {items.map(item => (
                         <div key={item.id} className="flex justify-between items-center text-sm border-b pb-3 mb-3 last:border-0">
                           <div className="flex items-center gap-3">
                             <div className="bg-white border rounded p-1">
                               {item.image ? <img src={item.image} className="h-10 w-10 object-cover" /> : <div className="h-10 w-10 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">No Img</div>}
                             </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-800 line-clamp-1">{item.name}</p>
                                <div className="flex items-center gap-3 mt-1.5">
                                  <div className="flex items-center border rounded-md h-7 overflow-hidden">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 h-full bg-slate-50 hover:bg-slate-100 text-slate-600 border-r">-</button>
                                    <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 h-full bg-slate-50 hover:bg-slate-100 text-slate-600 border-l">+</button>
                                  </div>
                                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center gap-1"><Trash2 className="w-3 h-3"/> Remove</button>
                                </div>
                              </div>
                            </div>
                            <span className="font-bold text-orange-600 whitespace-nowrap ml-4">₹{item.price * item.quantity}</span>
                         </div>
                       ))}
                     </div>
     
                     <div className="pt-4 border-t space-y-3 text-sm text-slate-600">
                       <div className="flex justify-between">
                         <span>Total Items</span>
                         <span>{totalItems}</span>
                       </div>
                       <div className="flex justify-between">
                         <span>Shipping</span>
                         <span className="text-green-600 font-semibold">FREE</span>
                       </div>
                       <div className="pt-4 border-t flex justify-between font-black text-xl text-slate-900">
                         <span>To Pay</span>
                         <span className="text-orange-600">₹{cartTotal}</span>
                       </div>
                     </div>
     
                     <Button 
                       onClick={initiatePayment} 
                       disabled={processing}
                       className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-lg shadow-lg shadow-orange-200"
                     >
                       {processing ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
                       {processing ? 'Processing Securely...' : `Pay ₹${cartTotal} Securely`}
                       {!processing && <ArrowRight className="ml-2 h-5 w-5" />}
                     </Button>
                     <p className="text-center text-xs text-slate-400">100% Secure & Encrypted Payments</p>
                   </CardContent>
                 </Card>
               </div>
             </div>
          </div>
        )}
      </div>

      <Dialog open={showSankalpModal} onOpenChange={setShowSankalpModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <span className="text-orange-600 font-black text-2xl">à¥</span> à¤¸à¤‚à¤•à¤²à¥à¤ª à¤µà¤¿à¤µà¤°à¤£
            </DialogTitle>
            <DialogDescription>
              à¤•à¥ƒà¤ªà¤¯à¤¾ à¤ªà¥‚à¤œà¤¾ à¤®à¥‡à¤‚ à¤¸à¤‚à¤•à¤²à¥à¤ª à¤•à¥‡ à¤²à¤¿à¤ à¤…à¤ªà¤¨à¤¾ à¤—à¥‹à¤¤à¥à¤° à¤”à¤° à¤‰à¤¦à¥à¤¦à¥‡à¤¶à¥à¤¯ à¤­à¤°à¥‡à¤‚à¥¤
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Gotra (à¤—à¥‹à¤¤à¥à¤°)</Label>
              <Input 
                value={sankalp.gotra} 
                onChange={e => setSankalp({...sankalp, gotra: e.target.value})} 
                placeholder="e.g. Kashyap (à¤•à¤¶à¥à¤¯à¤ª)" 
              />
            </div>
            <div className="space-y-2">
              <Label>Puja Purpose (à¤ªà¥‚à¤œà¤¾ à¤•à¤¾ à¤‰à¤¦à¥à¤¦à¥‡à¤¶à¥à¤¯ / à¤®à¤¨à¥à¤¨à¤¤)</Label>
              <textarea 
                value={sankalp.purpose} 
                onChange={e => setSankalp({...sankalp, purpose: e.target.value})} 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="e.g. For good health and prosperity in family" 
              />
            </div>
            
            <div className="flex items-start space-x-2 mt-4 p-3 bg-orange-50 rounded-md border border-orange-100">
              <Checkbox 
                id="terms" 
                checked={acceptedTnC}
                onCheckedChange={(checked) => setAcceptedTnC(checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700"
                >
                  Accept Terms and Conditions
                </label>
                <p className="text-[11px] text-muted-foreground">
                  I agree that the details provided for Sankalp are correct.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              disabled={!acceptedTnC || processing} 
              onClick={() => {
                setShowSankalpModal(false);
                handlePayment();
              }}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              Confirm & Pay Securely
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

