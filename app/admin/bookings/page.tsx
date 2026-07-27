'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PageHeader } from '@/components/admin/page-header'
import { KpiCard } from '@/components/admin/kpi-card'
import { DataTableShell } from '@/components/admin/data-table-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Ticket, Clock, CheckCircle2, XCircle, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

function BookingsManager() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get('tab') || 'all'

  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function loadBookings() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/bookings')
      const data = await res.json()
      if (data.ok) {
        setBookings(data.data || [])
      }
    } catch {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()

    // Real-time polling every 5 seconds for instant updates
    const interval = setInterval(loadBookings, 5000)
    return () => clearInterval(interval)
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this booking?')) return
    try {
      const res = await fetch(`/api/admin/bookings?id=${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Booking deleted successfully')
        loadBookings()
      } else {
        toast.error(data.error || 'Failed to delete booking')
      }
    } catch {
      toast.error('Network error deleting booking')
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/admin/bookings?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      const data = await res.json()
      if (data.ok) {
        toast.success(`Booking status updated to ${status}`)
        loadBookings()
      } else {
        toast.error(data.error || 'Failed to update status')
      }
    } catch {
      toast.error('Network error updating booking')
    }
  }

  // Filter bookings based on active tab query
  const filteredBookings = bookings.filter((b) => {
    const status = (b.status || '').toUpperCase()
    if (activeTab === 'pending') return status === 'PENDING'
    if (activeTab === 'confirmed') return status === 'CONFIRMED' || status === 'CONFIRM'
    if (activeTab === 'completed') return status === 'COMPLETED'
    if (activeTab === 'cancelled') return status === 'CANCELLED'
    if (activeTab === 'refunds') return b.paymentStatus === 'REFUNDED'
    return true
  })

  const tabs = [
    { label: 'All Bookings', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'Refund Requests', value: 'refunds' }
  ]

  const changeTab = (val: string) => {
    router.push(`/admin/bookings?tab=${val}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings (पूजा बुकिंग्स)"
        description="View and manage all devotee puja bookings, gotra details, and status updates."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Bookings' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard title="Total" value={bookings.length.toString()} icon={Ticket} />
        <KpiCard title="Pending" value={bookings.filter(b => b.status?.toUpperCase() === 'PENDING').length.toString()} icon={Clock} iconClass="text-orange-500" />
        <KpiCard title="Confirmed" value={bookings.filter(b => b.status?.toUpperCase() === 'CONFIRMED').length.toString()} icon={CheckCircle2} iconClass="text-blue-500" />
        <KpiCard title="Completed" value={bookings.filter(b => b.status?.toUpperCase() === 'COMPLETED').length.toString()} icon={CheckCircle2} iconClass="text-green-600" />
        <KpiCard title="Cancelled" value={bookings.filter(b => b.status?.toUpperCase() === 'CANCELLED').length.toString()} icon={XCircle} iconClass="text-red-500" />
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
            { key: 'bookingNumber', label: 'Booking #' },
            {
              key: 'customer',
              label: 'Devotee / Customer',
              render: (r) => (
                <div className="flex flex-col text-xs">
                  <span className="font-bold">{r.user?.fullName || r.user?.name || 'Guest User'}</span>
                  <span className="text-[10px] text-muted-foreground">{r.user?.email || 'No email'}</span>
                  {r.gotra && <span className="text-[10px] text-orange-600 font-semibold">Gotra: {r.gotra}</span>}
                </div>
              )
            },
            {
              key: 'puja',
              label: 'Puja Details',
              render: (r) => (
                <div className="flex flex-col text-xs">
                  <span className="font-bold">{r.puja?.name || 'Unknown Puja'}</span>
                  <span className="text-[10px] text-muted-foreground">{r.temple?.name || 'Any Temple'}</span>
                </div>
              )
            },
            {
              key: 'date',
              label: 'Scheduled',
              render: (r) => <span>{r.scheduledAt ? new Date(r.scheduledAt).toLocaleDateString('en-IN') : 'Not Scheduled'}</span>
            },
            {
              key: 'total',
              label: 'Amount',
              render: (r) => <span className="font-bold">₹{Number(r.total)}</span>
            },
            {
              key: 'status',
              label: 'Status',
              render: (r) => (
                <Badge variant={r.status === 'COMPLETED' ? 'success' : r.status === 'PENDING' ? 'secondary' : 'default'}>
                  {r.status}
                </Badge>
              )
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (r) => (
                <div className="flex items-center gap-1 justify-end">
                  {r.status === 'PENDING' && (
                    <Button size="sm" variant="outline" className="text-blue-600 h-7 text-[10px]" onClick={() => updateStatus(r.id, 'CONFIRMED')}>
                      Confirm
                    </Button>
                  )}
                  {r.status === 'CONFIRMED' && (
                    <Button size="sm" variant="outline" className="text-green-600 h-7 text-[10px]" onClick={() => updateStatus(r.id, 'COMPLETED')}>
                      Complete
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )
            }
          ]}
          rows={filteredBookings}
          searchPlaceholder="Search bookings..."
        />
      )}
    </div>
  )
}

export default function BookingsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
      </div>
    }>
      <BookingsManager />
    </Suspense>
  )
}
