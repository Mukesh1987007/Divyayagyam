'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PageHeader } from '@/components/admin/page-header'
import { KpiCard } from '@/components/admin/kpi-card'
import { DataTableShell } from '@/components/admin/data-table-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Flame, Star, CalendarClock, Video, Edit2, Trash2, Loader2, Plus, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Puja {
  id: string
  name: string
  category?: { name: string }
  temple?: { name: string }
  price: number
  vipPrice?: number | null
  status: string
  isVip: boolean
  isOnline: boolean
  isFeatured: boolean
}

function PujasManager() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get('tab') || 'all'

  const [pujas, setPujas] = useState<Puja[]>([])
  const [loading, setLoading] = useState(true)

  const loadPujas = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/pujas')
      const data = await res.json()
      if (data.ok) {
        setPujas(data.pujas || [])
      } else {
        toast.error(data.error || 'Failed to load pujas')
      }
    } catch {
      toast.error('Network error loading pujas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPujas()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this puja?')) return

    try {
      const res = await fetch(`/api/admin/pujas?id=${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Puja deleted successfully')
        loadPujas()
      } else {
        toast.error(data.error || 'Failed to delete puja')
      }
    } catch {
      toast.error('Network error deleting puja')
    }
  }

  // Filter pujas based on active tab
  const filteredPujas = pujas.filter((p) => {
    if (activeTab === 'featured') return p.isFeatured
    if (activeTab === 'vip') return p.isVip
    if (activeTab === 'live') return p.isOnline
    if (activeTab === 'upcoming') return p.status === 'PUBLISHED' && !p.isOnline
    return true
  })

    const tabs = [
    { label: 'All Pujas', value: 'all' },
    { label: 'VIP Pujas', value: 'vip' },
    { label: 'Live Pujas', value: 'live' },
    { label: 'Upcoming', value: 'upcoming' }
  ]

  const changeTab = (val: string) => {
    router.push(`/admin/pujas?tab=${val}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Puja Management"
        description="Manage all pujas, categories, slots, media & pricing."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Pujas' }]}
        action={{ label: 'Add Puja', href: '/admin/pujas/new', icon: Plus }}
        secondaryAction={{ label: 'Manage Categories', href: '/admin/pujas/categories' }}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard title="Total Pujas" value={pujas.length.toString()} icon={Flame} />
        <KpiCard title="VIP Pujas" value={pujas.filter(p => p.isVip).length.toString()} icon={Star} iconClass="text-yellow-500" />
        <KpiCard title="Live Pujas" value={pujas.filter(p => p.isOnline).length.toString()} icon={CalendarClock} iconClass="text-blue-500" />
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
            { key: 'name', label: 'Puja Name' },
            {
              key: 'category',
              label: 'Category',
              render: (r) => <span>{r.category?.name || '—'}</span>
            },
            {
              key: 'temple',
              label: 'Temple',
              render: (r) => <span>{r.temple?.name || '—'}</span>
            },
            {
              key: 'price',
              label: 'Base Price',
              render: (r) => <span className="font-bold">₹{r.price}</span>
            },
            {
              key: 'vipPrice',
              label: 'VIP Price',
              render: (r) => <span>{r.vipPrice ? `₹${r.vipPrice}` : '—'}</span>
            },
            {
              key: 'status',
              label: 'Status',
              render: (r) => (
                <Badge variant={r.status === 'PUBLISHED' ? 'success' : 'secondary'}>
                  {r.status}
                </Badge>
              )
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (r) => (
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" asChild>
                    <Link href={`/admin/pujas/new?id=${r.id}`}>
                      <Edit2 className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ),
              className: "text-right"
            }
          ]}
          rows={filteredPujas}
          searchPlaceholder="Search pujas by name..."
        />
      )}
    </div>
  )
}

export default function PujasPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
      </div>
    }>
      <PujasManager />
    </Suspense>
  )
}
