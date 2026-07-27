'use client'

import { useEffect, useState, Suspense } from 'react'
import Image from 'next/image';
import { PageHeader } from '@/components/admin/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Save, Upload, QrCode, CreditCard, Receipt } from 'lucide-react'

function PaymentsSettingsManager() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Razorpay states
  const [isRazorpayEnabled, setIsRazorpayEnabled] = useState(true)
  const [razorpayKeyId, setRazorpayKeyId] = useState('')
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('')
  const [razorpayWebhookSecret, setRazorpayWebhookSecret] = useState('')

  // UPI QR states
  const [isUpiQrEnabled, setIsUpiQrEnabled] = useState(false)
  const [upiQrCodeUrl, setUpiQrCodeUrl] = useState('')
  const [upiId, setUpiId] = useState('')

  // Tax/Misc states
  const [gstPercentage, setGstPercentage] = useState(18)
  const [currency, setCurrency] = useState('INR')
  const [refundWindowDays, setRefundWindowDays] = useState(7)

  async function loadSettings() {
    try {
      const res = await fetch('/api/admin/payments')
      const data = await res.json()
      if (data.ok) {
        setIsRazorpayEnabled(!!data.data.isRazorpayEnabled)
        setRazorpayKeyId(data.data.razorpayKeyId || '')
        setRazorpayKeySecret(data.data.razorpayKeySecret || '')
        setRazorpayWebhookSecret(data.data.razorpayWebhookSecret || '')
        
        setIsUpiQrEnabled(!!data.data.isUpiQrEnabled)
        setUpiQrCodeUrl(data.data.upiQrCodeUrl || '')
        setUpiId(data.data.upiId || '')

        setGstPercentage(data.data.gstPercentage || 18)
        setCurrency(data.data.currency || 'INR')
        setRefundWindowDays(data.data.refundWindowDays || 7)
      }
    } catch {
      toast.error('Failed to load payment settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  async function handleQrUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const { compressImage } = await import('@/lib/utils')
    const compressedFile = await compressImage(file)
    const formData = new FormData()
    formData.append('file', compressedFile)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.ok) {
        setUpiQrCodeUrl(data.url)
        toast.success('UPI QR Code uploaded successfully!')
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch {
      toast.error('Network error uploading QR code')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isRazorpayEnabled,
          razorpayKeyId,
          razorpayKeySecret,
          razorpayWebhookSecret,
          isUpiQrEnabled,
          upiQrCodeUrl,
          upiId,
          gstPercentage,
          currency,
          refundWindowDays
        })
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Payment Settings saved and applied successfully!')
        loadSettings()
      } else {
        toast.error(data.error || 'Failed to save settings')
      }
    } catch {
      toast.error('Network error saving payment settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Gateway Settings"
        description="Configure Razorpay details, upload customer payment QR codes, and customize tax rates live."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Payments' }]}
      />

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Razorpay Gateway Card */}
          <Card className="rounded-3xl border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="space-y-1">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-orange-600" /> Razorpay Integration
                </CardTitle>
                <CardDescription className="text-xs">Accept credit card, netbanking and wallet payments.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isRazorpayEnabled ? 'success' : 'secondary'}>
                  {isRazorpayEnabled ? 'ACTIVE' : 'DISABLED'}
                </Badge>
                <Switch checked={isRazorpayEnabled} onCheckedChange={setIsRazorpayEnabled} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rzpId">Razorpay Key ID</Label>
                <Input
                  id="rzpId"
                  placeholder="rzp_live_..."
                  value={razorpayKeyId}
                  onChange={(e) => setRazorpayKeyId(e.target.value)}
                  disabled={!isRazorpayEnabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rzpSec">Razorpay Key Secret</Label>
                <Input
                  id="rzpSec"
                  type="password"
                  placeholder="••••••••"
                  value={razorpayKeySecret}
                  onChange={(e) => setRazorpayKeySecret(e.target.value)}
                  disabled={!isRazorpayEnabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rzpWeb">Webhook Secret</Label>
                <Input
                  id="rzpWeb"
                  type="password"
                  value={razorpayWebhookSecret}
                  onChange={(e) => setRazorpayWebhookSecret(e.target.value)}
                  disabled={!isRazorpayEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* UPI QR Code Card */}
          <Card className="rounded-3xl border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="space-y-1">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-orange-600" /> Direct UPI QR Code
                </CardTitle>
                <CardDescription className="text-xs">Show a scan-to-pay QR code to customers during checkout.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isUpiQrEnabled ? 'success' : 'secondary'}>
                  {isUpiQrEnabled ? 'ACTIVE' : 'DISABLED'}
                </Badge>
                <Switch checked={isUpiQrEnabled} onCheckedChange={setIsUpiQrEnabled} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="upiAddress">Merchant UPI ID</Label>
                <Input
                  id="upiAddress"
                  placeholder="e.g. divyayagyam@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  disabled={!isUpiQrEnabled}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Upload Payment QR Code Image</Label>
                <div className="flex items-center gap-4 border p-3 rounded-2xl bg-slate-50">
                  <div className="h-20 w-20 border rounded-xl overflow-hidden flex items-center justify-center shrink-0 bg-white">
                    {upiQrCodeUrl ? (
                      <img src={upiQrCodeUrl} alt="UPI QR Code" className="h-full w-full object-contain p-1" />
                    ) : (
                      <QrCode className="h-8 w-8 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className={`cursor-pointer inline-flex items-center justify-center rounded-xl bg-orange-600 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-700 transition-all gap-1.5 h-9 ${!isUpiQrEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                      {uploading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Upload className="h-3.5 w-3.5" />
                      )}
                      {uploading ? 'Uploading…' : 'Upload QR Code'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleQrUpload}
                        disabled={uploading || !isUpiQrEnabled}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Taxes & Miscellaneous */}
        <Card className="rounded-3xl border shadow-sm max-w-xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-orange-600" /> Taxes, Currency & Refunds
            </CardTitle>
            <CardDescription className="text-xs">Configure billing constants for transactions.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="curr">Default Currency</Label>
              <Input id="curr" value={currency} onChange={(e) => setCurrency(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gst">GST Percentage (%)</Label>
              <Input id="gst" type="number" value={gstPercentage} onChange={(e) => setGstPercentage(Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refWindow">Refund Window (Days)</Label>
              <Input id="refWindow" type="number" value={refundWindowDays} onChange={(e) => setRefundWindowDays(Number(e.target.value) || 0)} />
            </div>
          </CardContent>
        </Card>

        <div className="pt-2">
          <Button type="submit" disabled={saving} className="bg-orange-600 hover:bg-orange-700 rounded-xl h-11 px-6 font-bold gap-2">
            {saving ? (
              <span className="flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </span>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Gateways & Live Publish
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
      </div>
    }>
      <PaymentsSettingsManager />
    </Suspense>
  )
}
