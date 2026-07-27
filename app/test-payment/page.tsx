'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RazorpayCheckoutButton } from '@/components/razorpay-checkout-button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Flame, HandCoins, ShoppingBag, Sparkles } from 'lucide-react'
import type { PaymentIntentType } from '@/lib/razorpay'

type Intent = { key: PaymentIntentType; label: string; icon: any; description: string; suggested: number[] }

const intents: Intent[] = [
  { key: 'puja', label: 'Puja Booking', icon: Flame, description: 'Book a sacred puja — test flow', suggested: [851, 1100, 2100, 5100] },
  { key: 'product', label: 'Product Order', icon: ShoppingBag, description: 'Prasad, rudraksha, samagri', suggested: [251, 501, 799, 1899] },
  { key: 'bhaktiSeva', label: 'BhaktiSeva', icon: Sparkles, description: 'Flowers, prasad, bhog, deep daan', suggested: [51, 108, 251, 501] },
]

export default function TestPaymentPage() {
  const [selectedIntent, setSelectedIntent] = useState<Intent>(intents[0])
  const [amount, setAmount] = useState<number>(101)
  const [name, setName] = useState('Test Devotee')
  const [email, setEmail] = useState('test@divyayagyam.com')
  const [contact, setContact] = useState('9587171984')
  const [result, setResult] = useState<null | { success: boolean; paymentId?: string; orderId?: string; error?: string }>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 px-4">
      <div className="container max-w-4xl">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-2">🧪 Test Mode</Badge>
          <h1 className="text-3xl font-bold">Razorpay Payment Test</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Use Razorpay test cards to complete payment.
            Try <code className="bg-muted px-1.5 py-0.5 rounded text-xs">4111 1111 1111 1111</code> • any future date • any CVV
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold mb-3">1. Choose payment type</p>
            <div className="grid grid-cols-2 gap-2">
              {intents.map((i) => {
                const Icon = i.icon
                const active = selectedIntent.key === i.key
                return (
                  <button
                    key={i.key}
                    onClick={() => setSelectedIntent(i)}
                    className={`text-left p-3 rounded-lg border transition-all ${active ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:bg-muted/50'}`}
                  >
                    <Icon className={`h-4 w-4 mb-1 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="text-sm font-medium">{i.label}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{i.description}</p>
                  </button>
                )
              })}
            </div>

            <p className="text-sm font-semibold mt-6 mb-3">2. Amount (₹)</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedIntent.suggested.map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(v)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border ${amount === v ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}
                >
                  ₹{v.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
            <Input type="number" value={amount} onChange={(e) => setAmount(parseInt(e.target.value) || 0)} min={1} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">3. Devotee details</CardTitle>
              <CardDescription>Prefilled in Razorpay checkout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1"><Label className="text-xs">Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-xs">Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-xs">Phone</Label><Input value={contact} onChange={(e) => setContact(e.target.value)} /></div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-center">
          <RazorpayCheckoutButton
            amountInRupees={amount}
            paymentType={selectedIntent.key}
            description={`${selectedIntent.label} test payment`}
            customer={{ name, email, contact }}
            size="lg"
            className="min-w-[240px]"
            onSuccess={(d) => setResult({ success: true, paymentId: d.paymentId, orderId: d.orderId })}
            onFailure={(e) => setResult({ success: false, error: e })}
          />
        </div>

        {result && (
          <Card className={`mt-6 border-2 ${result.success ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'}`}>
            <CardContent className="p-5 flex items-start gap-3">
              {result.success ? (
                <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600 shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-semibold">
                  {result.success ? 'हरि ओम्! Payment successful' : 'Payment failed'}
                </p>
                {result.success ? (
                  <div className="mt-2 text-xs text-muted-foreground space-y-1 font-mono">
                    <div>Payment ID: <code className="bg-background px-1 rounded">{result.paymentId}</code></div>
                    <div>Order ID: <code className="bg-background px-1 rounded">{result.orderId}</code></div>
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-red-600">{result.error}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 grid gap-2 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">💡 Test card details</p>
          <p>• Card: <code className="bg-muted px-1 rounded">4111 1111 1111 1111</code> (Visa) or <code className="bg-muted px-1 rounded">5267 3181 8797 5449</code> (Mastercard)</p>
          <p>• CVV: any 3 digits (e.g. 123) • Expiry: any future date (e.g. 12/26)</p>
          <p>• UPI: <code className="bg-muted px-1 rounded">success@razorpay</code> (success) or <code className="bg-muted px-1 rounded">failure@razorpay</code></p>
          <p>• Netbanking: any bank → mock page allows Success / Failure</p>
        </div>
      </div>
    </div>
  )
}
