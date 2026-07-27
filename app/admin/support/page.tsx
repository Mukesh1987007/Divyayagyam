'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PageHeader } from '@/components/admin/page-header'
import { KpiCard } from '@/components/admin/kpi-card'
import { DataTableShell } from '@/components/admin/data-table-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MessageSquare, Clock, CheckCircle2, AlertTriangle, Loader2, Trash2, Send } from 'lucide-react'
import { toast } from 'sonner'

function SupportManager() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get('tab') || 'all'

  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function loadTickets() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/support')
      const data = await res.json()
      if (data.ok) {
        setTickets(data.data || [])
      }
    } catch {
      toast.error('Failed to load support tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [])

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      const res = await fetch('/api/admin/support', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Ticket status updated successfully')
        loadTickets()
      } else {
        toast.error(data.error || 'Failed to update status')
      }
    } catch {
      toast.error('Network error updating status')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this ticket?')) return
    try {
      const res = await fetch(`/api/admin/support?id=${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Ticket deleted successfully')
        loadTickets()
      } else {
        toast.error(data.error || 'Failed to delete ticket')
      }
    } catch {
      toast.error('Network error deleting ticket')
    }
  }

  function launchWhatsApp(row: any) {
    const formattedPhone = row.phone.replace(/[^0-9+]/g, '')
    const msg = `Hare Krishna ${row.customer} ji! We are contacting you regarding your Divya Yagyam query (Ticket: ${row.ticketNumber}) - "${row.subject}". How can we assist you further today?`
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

  // Filter based on active tab
  const filteredTickets = tickets.filter((t) => {
    if (activeTab === 'open') return t.status === 'OPEN'
    if (activeTab === 'in-progress') return t.status === 'IN_PROGRESS'
    if (activeTab === 'resolved') return t.status === 'RESOLVED'
    return true
  })

  const tabs = [
    { label: 'All Tickets', value: 'all' },
    { label: 'Open (खुला)', value: 'open' },
    { label: 'In Progress (प्रक्रिया में)', value: 'in-progress' },
    { label: 'Resolved (पूर्ण)', value: 'resolved' }
  ]

  const changeTab = (val: string) => {
    router.push(`/admin/support?tab=${val}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Center & Helpdesk"
        description="Fulfill devotee queries, update statuses and initiate instant WhatsApp chat messages."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Support' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Tickets" value={tickets.length.toString()} icon={MessageSquare} />
        <KpiCard title="Open" value={tickets.filter(t => t.status === 'OPEN').length.toString()} icon={AlertTriangle} iconClass="text-orange-500" />
        <KpiCard title="In Progress" value={tickets.filter(t => t.status === 'IN_PROGRESS').length.toString()} icon={Clock} iconClass="text-blue-500" />
        <KpiCard title="Resolved" value={tickets.filter(t => t.status === 'RESOLVED').length.toString()} icon={CheckCircle2} iconClass="text-green-600" />
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
            { key: 'ticketNumber', label: 'Ticket ID' },
            {
              key: 'customer',
              label: 'Customer / Devotee',
              render: (r) => (
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 text-xs">{r.customer}</span>
                  <span className="text-[10px] text-muted-foreground">{r.email}</span>
                  <span className="text-[10px] text-orange-600 font-mono">{r.phone}</span>
                </div>
              )
            },
            {
              key: 'subject',
              label: 'Query Details',
              render: (r) => (
                <div className="flex flex-col max-w-sm gap-0.5">
                  <span className="font-bold text-xs text-slate-800">{r.subject}</span>
                  <span className="text-[10px] text-slate-500 line-clamp-1">{r.description}</span>
                </div>
              )
            },
            {
              key: 'priority',
              label: 'Priority',
              render: (r) => (
                <Badge variant={r.priority === 'HIGH' || r.priority === 'URGENT' ? 'destructive' : 'secondary'}>
                  {r.priority}
                </Badge>
              )
            },
            {
              key: 'status',
              label: 'Update Status',
              render: (r) => (
                <Select value={r.status} onValueChange={(val) => handleStatusChange(r.id, val)}>
                  <SelectTrigger className="h-8 text-xs font-bold w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">OPEN (खुला)</SelectItem>
                    <SelectItem value="IN_PROGRESS">IN_PROGRESS (प्रक्रिया)</SelectItem>
                    <SelectItem value="RESOLVED">RESOLVED (पूर्ण)</SelectItem>
                    <SelectItem value="CLOSED">CLOSED (बंद)</SelectItem>
                  </SelectContent>
                </Select>
              )
            },
            { key: 'createdAt', label: 'Created On' },
            {
              key: 'actions',
              label: 'Communication / Action',
              render: (r) => (
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1 border-green-600 text-green-700 hover:bg-green-50 rounded-xl" onClick={() => launchWhatsApp(r)}>
                    <Send className="h-3.5 w-3.5" /> WhatsApp ji
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            }
          ]}
          rows={filteredTickets}
          searchPlaceholder="Search query by customer name..."
        />
      )}
    </div>
  )
}

export default function SupportPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
      </div>
    }>
      <SupportManager />
    </Suspense>
  )
}
