'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/admin/page-header'
import { DataTableShell } from '@/components/admin/data-table-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2, Ticket } from 'lucide-react'

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  // Form state
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [discountType, setDiscountType] = useState('PERCENTAGE')
  const [discountValue, setDiscountValue] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxDiscount, setMaxDiscount] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  async function loadCoupons() {
    try {
      const res = await fetch('/api/admin/coupons')
      const data = await res.json()
      if (data.ok) {
        setCoupons(data.data || [])
      }
    } catch {
      toast.error('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCoupons()
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!code || !discountValue) return

    setSaving(true)
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          description,
          discountType,
          discountValue: Number(discountValue),
          minAmount: minAmount ? Number(minAmount) : null,
          maxDiscount: maxDiscount ? Number(maxDiscount) : null,
          maxUses: maxUses ? Number(maxUses) : null,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        }),
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Coupon created successfully!')
        setShowAddForm(false)
        setCode('')
        setDescription('')
        setDiscountValue('')
        setMinAmount('')
        setMaxDiscount('')
        setMaxUses('')
        setExpiresAt('')
        loadCoupons()
      } else {
        toast.error(data.error || 'Failed to create coupon')
      }
    } catch {
      toast.error('Network error creating coupon')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this coupon?')) return
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Coupon deleted successfully')
        loadCoupons()
      } else {
        toast.error(data.error || 'Failed to delete coupon')
      }
    } catch {
      toast.error('Network error deleting coupon')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coupon Codes & Discounts"
        description="Configure promotional codes, percentages or flat rate discounts for pujas and products."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Coupons' }]}
        action={{
          label: showAddForm ? 'Cancel' : 'New Coupon',
          icon: Plus,
          onClick: () => setShowAddForm(!showAddForm),
        }}
      />

      {showAddForm && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" /> Create New Coupon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code (Uppercase)</Label>
                <Input
                  id="code"
                  placeholder="e.g. DIWALI50"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="e.g. Get 50% off on all Pujas"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select value={discountType} onValueChange={setDiscountType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FLAT">Flat Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountValue">Discount Value</Label>
                <Input
                  id="discountValue"
                  type="number"
                  placeholder={discountType === 'PERCENTAGE' ? 'e.g. 50' : 'e.g. 500'}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minAmount">Minimum Order Amount (₹)</Label>
                <Input
                  id="minAmount"
                  type="number"
                  placeholder="e.g. 1000"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxDiscount">Maximum Discount Value (₹)</Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  placeholder="e.g. 500"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxUses">Usage Limit (Max Uses)</Label>
                <Input
                  id="maxUses"
                  type="number"
                  placeholder="e.g. 100"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiry Date</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Coupon
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTableShell
          columns={[
            {
              key: 'code',
              label: 'Code',
              render: (r) => (
                <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded border">
                  {r.code}
                </code>
              ),
            },
            {
              key: 'discountType',
              label: 'Type',
              render: (r) => (
                <Badge variant="outline">
                  {r.discountType === 'PERCENTAGE' ? 'Percentage' : 'Flat Discount'}
                </Badge>
              ),
            },
            {
              key: 'discountValue',
              label: 'Value',
              render: (r) => (
                <span>
                  {r.discountType === 'PERCENTAGE'
                    ? `${Number(r.discountValue)}%`
                    : `₹${Number(r.discountValue)}`}
                </span>
              ),
            },
            {
              key: 'usedCount',
              label: 'Usage Stats',
              render: (r) => (
                <span className="text-xs">
                  {r.usedCount} used {r.maxUses ? `/ ${r.maxUses} max` : '(Unlimited)'}
                </span>
              ),
            },
            {
              key: 'isActive',
              label: 'Status',
              render: (r) => (
                <Badge
                  variant={r.isActive ? 'success' : 'secondary'}
                  className={r.isActive ? 'bg-green-100 text-green-800' : ''}
                >
                  {r.isActive ? 'Active' : 'Disabled'}
                </Badge>
              ),
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (r) => (
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8"
                  onClick={() => handleDelete(r.id)}
                  title="Delete Coupon"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              ),
            },
          ]}
          rows={coupons}
        />
      )}
    </div>
  )
}
