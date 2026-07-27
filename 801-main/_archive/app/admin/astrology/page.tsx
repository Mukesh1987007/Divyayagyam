'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PageHeader } from '@/components/admin/page-header'
import { KpiCard } from '@/components/admin/kpi-card'
import { DataTableShell } from '@/components/admin/data-table-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Sparkle, FileText, Users, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

function AstrologyManager() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get('tab') || 'all'

  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [astrologers, setAstrologers] = useState<any[]>([])

  async function loadReports() {
    try {
      setLoading(true)
      const [reportsRes, astroRes] = await Promise.all([
        fetch('/api/admin/astrology'),
        fetch('/api/admin/astrology/astrologers')
      ])
      
      const reportsData = await reportsRes.json()
      if (reportsData.ok) setReports(reportsData.data || [])

      const astroData = await astroRes.json()
      if (astroData.ok) setAstrologers(astroData.data || [])

    } catch {
      toast.error('Failed to load astrology data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this report?')) return
    try {
      const res = await fetch(`/api/admin/astrology?id=${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Report deleted successfully')
        loadReports()
      } else {
        toast.error(data.error || 'Failed to delete report')
      }
    } catch {
      toast.error('Network error deleting report')
    }
  }

  // Filter based on active tab
  const filteredReports = reports.filter((r) => {
    if (activeTab === 'kundali') return r.type === 'KUNDALI'
    if (activeTab === 'milan') return r.type === 'MILAN'
    if (activeTab === 'numerology') return r.type === 'NUMEROLOGY'
    if (activeTab === 'ratna') return r.type === 'RATNA'
    return true
  })

  const tabs = [
    { label: 'All Reports', value: 'all' },
    { label: 'Kundali', value: 'kundali' },
    { label: 'Milan', value: 'milan' },
    { label: 'Numerology', value: 'numerology' },
    { label: 'Ratna', value: 'ratna' },
    { label: 'Astrologers', value: 'astrologers' }
  ]

  const changeTab = (val: string) => {
    router.push(`/admin/astrology?tab=${val}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Astrology Services"
        description="Kundali, Milan, Numerology & Ratna suggestions."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Astrology' }]}
        secondaryAction={{ label: 'Manage Astro Tools', href: '/admin/tools' }}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard title="Total Requests" value={reports.length.toString()} icon={FileText} />
        <KpiCard title="Completed Reports" value={reports.filter(r => r.status === 'COMPLETED').length.toString()} icon={Sparkle} iconClass="text-yellow-500" />
        <KpiCard title="Astrologers" value={astrologers.length.toString()} icon={Users} iconClass="text-green-600" />
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
      ) : activeTab === 'astrologers' ? (
        <DataTableShell
          columns={[
            { key: 'name', label: 'Astrologer Name', render: (r) => <span className="font-bold text-slate-800">{r.name}</span> },
            { key: 'experience', label: 'Experience', render: (r) => <span>{r.experience} Years</span> },
            { key: 'specialties', label: 'Specialty / Expert Areas' }
          ]}
          rows={astrologers}
        />
      ) : (
        <DataTableShell
          columns={[
            { key: 'id', label: 'Report ID' },
            { key: 'user', label: 'Customer / Devotee' },
            {
              key: 'type',
              label: 'Service Type',
              render: (r) => (
                <Badge variant="outline" className="font-mono text-xs">
                  {r.type}
                </Badge>
              )
            },
            {
              key: 'status',
              label: 'Status',
              render: (r) => (
                <Badge variant={r.status === 'COMPLETED' ? 'success' : 'secondary'}>
                  {r.status}
                </Badge>
              )
            },
            { key: 'date', label: 'Date' },
            {
              key: 'actions',
              label: 'Actions',
              render: (r) => (
                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => handleDelete(r.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )
            }
          ]}
          rows={filteredReports}
          searchPlaceholder="Search reports by customer..."
        />
      )}
    </div>
  )
}

export default function AstrologyPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
      </div>
    }>
      <AstrologyManager />
    </Suspense>
  )
}
