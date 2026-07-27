'use client'

import { useEffect, useState, Suspense } from 'react'
import { PageHeader } from '@/components/admin/page-header'
import { KpiCard } from '@/components/admin/kpi-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, TrendingUp, ShoppingBag, Users, Receipt, Download, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

function ReportsManager() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  async function loadReports() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/reports')
      const data = await res.json()
      if (data.ok) {
        setStats(data.stats)
      } else {
        toast.error('Failed to load real-time report aggregates')
      }
    } catch {
      toast.error('Network error loading reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  function exportReport(type: string) {
    if (!stats) return
    let csvContent = 'data:text/csv;charset=utf-8,'
    let filename = `divyayagyam_${type}_report.csv`

    if (type === 'revenue') {
      csvContent += 'Metric,Value\n'
      csvContent += `Total Revenue,INR ${stats.totalRevenue}\n`
      csvContent += `Tax Estimated (18% GST),INR ${stats.totalTax}\n`
      csvContent += `Refunds Issued,INR ${stats.totalRefunds}\n`
    } else if (type === 'bookings') {
      csvContent += 'Metric,Count\n'
      csvContent += `Total Bookings,${stats.bookingsCount}\n`
      csvContent += `Confirmed Bookings,${stats.successfulBookings}\n`
    } else if (type === 'products') {
      csvContent += 'Metric,Count\n'
      csvContent += `Total Order Placed,${stats.ordersCount}\n`
      csvContent += `Delivered Orders,${stats.completedOrders}\n`
    } else if (type === 'customers') {
      csvContent += 'Metric,Count\n'
      csvContent += `Registered Devotee Customers,${stats.devoteesCount}\n`
    } else {
      csvContent += 'Metric,Value\n'
      csvContent += `Calculated GST (18%),INR ${stats.totalTax}\n`
    }

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`${type.toUpperCase()} Report downloaded successfully!`)
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
        title="Business Intelligence Reports"
        description="Real-time live database financial aggregates, customer growth logs and sales audits. (Strictly Non-Manipulated Data)"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Reports' }]}
        action={{ label: 'Export All', icon: Download, onClick: () => exportReport('revenue') }}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard title="Total Revenue" value={`₹ ${stats?.totalRevenue || 0}`} icon={TrendingUp} iconClass="text-green-600" />
        <KpiCard title="Calculated GST / Tax" value={`₹ ${stats?.totalTax || 0}`} icon={Receipt} iconClass="text-blue-500" />
        <KpiCard title="Refunds Issued" value={`₹ ${stats?.totalRefunds || 0}`} icon={FileText} iconClass="text-red-500" />
      </div>

      {/* Reports Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          { key: 'revenue', title: 'Revenue Report', desc: `Total sales income (₹ ${stats?.totalRevenue || 0})`, icon: TrendingUp },
          { key: 'bookings', title: 'Booking Report', desc: `${stats?.successfulBookings} Confirmed / ${stats?.bookingsCount} Total Pujas`, icon: FileText },
          { key: 'products', title: 'Product Sales', desc: `${stats?.completedOrders} Shipped / ${stats?.ordersCount} Total Orders`, icon: ShoppingBag },
          { key: 'customers', title: 'Customer Insights', desc: `${stats?.devoteesCount} Registered Devotee Accounts`, icon: Users },
          { key: 'tax', title: 'GST / Tax Report', desc: `Estimated GST (₹ ${stats?.totalTax || 0})`, icon: Receipt },
        ].map((r) => {
          const Icon = r.icon
          return (
            <Card key={r.key} className="rounded-3xl border shadow-sm flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Icon className="h-5 w-5 text-orange-600" />
                  {r.title}
                </CardTitle>
                <CardDescription className="text-xs">{r.desc}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between border-t pt-3">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-orange-500" /> Real-time live data
                </span>
                <Button size="sm" variant="outline" className="rounded-xl h-8 text-xs gap-1" onClick={() => exportReport(r.key)}>
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default function ReportsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
      </div>
    }>
      <ReportsManager />
    </Suspense>
  )
}
