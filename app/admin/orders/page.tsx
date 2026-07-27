'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PageHeader } from '@/components/admin/page-header'
import { KpiCard } from '@/components/admin/kpi-card'
import { DataTableShell } from '@/components/admin/data-table-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, Clock, Truck, CheckCircle2, XCircle, Loader2, Trash2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

function OrdersManager() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get('tab') || 'all'

  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function loadOrders() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/orders')
      const data = await res.json()
      if (data.ok) {
        setOrders(data.data || [])
      }
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()

    const interval = setInterval(loadOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this order?')) return
    try {
      const res = await fetch(`/api/admin/orders?id=${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Order deleted successfully')
        loadOrders()
      } else {
        toast.error(data.error || 'Failed to delete order')
      }
    } catch {
      toast.error('Network error deleting order')
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/admin/orders?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      const data = await res.json()
      if (data.ok) {
        toast.success(`Order status updated to ${status}`)
        loadOrders()
      } else {
        toast.error(data.error || 'Failed to update status')
      }
    } catch {
      toast.error('Network error updating order')
    }
  }

  // Filter orders based on active tab query
  const filteredOrders = orders.filter((o) => {
    const status = (o.status || '').toUpperCase()
    if (activeTab === 'pending') return status === 'PENDING'
    if (activeTab === 'processing') return status === 'PROCESSING'
    if (activeTab === 'shipped') return status === 'SHIPPED'
    if (activeTab === 'delivered') return status === 'DELIVERED'
    if (activeTab === 'cancelled') return status === 'CANCELLED'
    if (activeTab === 'returned') return status === 'RETURNED'
    if (activeTab === 'refunds') return o.paymentStatus === 'REFUNDED'
    return true
  })

  const tabs = [
    { label: 'All Orders', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'Returned', value: 'returned' },
    { label: 'Refunds', value: 'refunds' }
  ]

  const changeTab = (val: string) => {
    router.push(`/admin/orders?tab=${val}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders (ऑर्डर्स)"
        description="Track and manage all customer purchases of sacred prasad and products."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Orders' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard title="Total Orders" value={orders.length.toString()} icon={Package} />
        <KpiCard title="Pending" value={orders.filter(o => o.status?.toUpperCase() === 'PENDING').length.toString()} icon={Clock} iconClass="text-orange-500" />
        <KpiCard title="Processing" value={orders.filter(o => o.status?.toUpperCase() === 'PROCESSING').length.toString()} icon={Truck} iconClass="text-blue-500" />
        <KpiCard title="Delivered" value={orders.filter(o => o.status?.toUpperCase() === 'DELIVERED').length.toString()} icon={CheckCircle2} iconClass="text-green-600" />
        <KpiCard title="Cancelled" value={orders.filter(o => o.status?.toUpperCase() === 'CANCELLED').length.toString()} icon={XCircle} iconClass="text-red-500" />
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b pb-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => changeTab(t.value)}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all shrink-0 ${activeTab === t.value ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
        </div>
      ) : (
        <DataTableShell
          columns={[
            { key: 'orderNumber', label: 'Order #' },
            {
              key: 'customer',
              label: 'Devotee / Customer',
              render: (r) => (
                <div className="flex flex-col text-xs">
                  <span className="font-bold">{r.user?.fullName || r.user?.name || 'Guest Devotee'}</span>
                  <span className="text-[10px] text-muted-foreground">{r.user?.email || 'No email'}</span>
                </div>
              )
            },
            {
              key: 'items',
              label: 'Purchased Items',
              render: (r) => {
                const count = r.items?.length || 0
                return <span>{count} {count === 1 ? 'item' : 'items'}</span>
              }
            },
            {
              key: 'total',
              label: 'Total Amount',
              render: (r) => <span className="font-bold text-orange-600">₹{Number(r.total)}</span>
            },
            {
              key: 'status',
              label: 'Status',
              render: (r) => (
                <Badge variant={r.status === 'DELIVERED' ? 'success' : r.status === 'PENDING' ? 'secondary' : 'default'}>
                  {r.status}
                </Badge>
              )
            },
            {
              key: 'date',
              label: 'Date',
              render: (r) => <span>{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (r) => (
                <div className="flex items-center gap-1 justify-end">
                  {r.status === 'PENDING' && (
                    <Button size="sm" variant="outline" className="text-blue-600 h-7 text-[10px]" onClick={() => updateStatus(r.id, 'PROCESSING')}>
                      Process
                    </Button>
                  )}
                  {r.status === 'PROCESSING' && (
                    <Button size="sm" variant="outline" className="text-orange-600 h-7 text-[10px]" onClick={() => updateStatus(r.id, 'SHIPPED')}>
                      Ship
                    </Button>
                  )}
                  {r.status === 'SHIPPED' && (
                    <Button size="sm" variant="outline" className="text-green-600 h-7 text-[10px]" onClick={() => updateStatus(r.id, 'DELIVERED')}>
                      Deliver
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )
            }
          ]}
          rows={filteredOrders}
          searchPlaceholder="Search orders..."
        />
      )}
    </div>
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
      </div>
    }>
      <OrdersManager />
    </Suspense>
  )
}
