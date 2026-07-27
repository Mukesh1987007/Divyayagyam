'use client'

import { useCallback, useState } from 'react'
import Script from 'next/script'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import type { PaymentIntentType } from '@/lib/razorpay'

declare global {
  interface Window {
    Razorpay: any
  }
}

export type RazorpayCheckoutButtonProps = {
  amountInRupees: number
  paymentType: PaymentIntentType
  referenceId?: string
  description?: string
  label?: string
  className?: string
  variant?: React.ComponentProps<typeof Button>['variant']
  size?: React.ComponentProps<typeof Button>['size']
  customer?: { name?: string; email?: string; contact?: string }
  onSuccess?: (data: { paymentId: string; orderId: string }) => void
  onFailure?: (error: string) => void
  disabled?: boolean
}

export function RazorpayCheckoutButton({
  amountInRupees, paymentType, referenceId, description,
  label, className, variant, size, customer, onSuccess, onFailure, disabled,
}: RazorpayCheckoutButtonProps) {
  const [loading, setLoading] = useState(false)

  const handlePay = useCallback(async () => {
    if (loading) return
    setLoading(true)
    try {
      // 1) Create order on server
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountInRupees, paymentType, referenceId, description, customer }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || 'Failed to create order')
      }

      // 2) Ensure checkout.js is loaded
      if (typeof window === 'undefined' || !window.Razorpay) {
        throw new Error('Razorpay checkout script not loaded. Please retry in a moment.')
      }

      // 3) Open checkout
      const rzp = new window.Razorpay({
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Divyayagyam',
        description: description || `Payment for ${paymentType}`,
        order_id: data.orderId,
        prefill: {
          name: data.customer?.name || '',
          email: data.customer?.email || '',
          contact: data.customer?.contact || '',
        },
        notes: {
          paymentId: data.paymentId || 'guest',
          paymentType,
          referenceId: referenceId || '',
        },
        theme: { color: '#FF8C21' },
        modal: {
          ondismiss: () => {
            setLoading(false)
            toast.info('Payment cancelled')
          },
        },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId: data.paymentId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })
            const verifyData = await verifyRes.json()
            if (verifyRes.ok && verifyData.ok && verifyData.verified) {
              toast.success('🙏 Payment successful! Blessings received.')
              onSuccess?.({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
              })
            } else {
              throw new Error(verifyData?.error || 'Signature verification failed')
            }
          } catch (err: any) {
            toast.error(err?.message || 'Verification failed')
            onFailure?.(err?.message || 'Verification failed')
          } finally {
            setLoading(false)
          }
        },
      })

      rzp.on('payment.failed', (resp: any) => {
        toast.error(resp?.error?.description || 'Payment failed')
        onFailure?.(resp?.error?.description || 'Payment failed')
        setLoading(false)
      })

      rzp.open()
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong')
      onFailure?.(err?.message || 'Something went wrong')
      setLoading(false)
    }
  }, [loading, amountInRupees, paymentType, referenceId, description, customer, onSuccess, onFailure])

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Button
        type="button"
        onClick={handlePay}
        disabled={disabled || loading}
        className={className}
        variant={variant}
        size={size}
      >
        {loading ? <span className="flex items-center justify-center"><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing…</span> : label ? label : "Pay ₹" + amountInRupees.toLocaleString('en-IN')}
      </Button>
    </>
  )
}
