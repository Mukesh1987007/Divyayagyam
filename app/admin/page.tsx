import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { KpiCard } from '@/components/admin/kpi-card'
import { PageHeader } from '@/components/admin/page-header'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Wallet, Calendar, Package, Users, Flame, Clock, CheckCircle2, TrendingUp, HandCoins, Activity, Zap, BarChart3, ArrowUpRight, Receipt, ShoppingBag, Plus } from 'lucide-react'
import { prisma } from '@/lib/prisma'

const quickActions = [
  { label: 'Add Puja', href: '/admin/pujas/new', icon: Flame },
  { label: 'Add Product', href: '/admin/products/new', icon: ShoppingBag },
  { label: 'Add Blog', href: '/admin/blog/new', icon: Plus },
  { label: 'Send Notification', href: '/admin/notifications', icon: Zap },
]

export default async function AdminDashboardPage() {
  const [devoteesCount, bookingsCount, ordersCount] = await Promise.all([
    prisma.user.count({ where: { role: { name: 'USER' } } }),
    prisma.booking.count(),
    prisma.order.count(),
  ])

  const totalRev = 0
  const totalTax = 0
  const refunds = 0
  const successfulBookings = 0
  const completedOrders = 0
  const dailyRevenue = Array.from({ length: 30 }).map(() => 0)
  const maxDailyRev = 1
  const recentLogs: any[] = []

  return (
    <div className="space-y-6">
      <PageHeader
        title="🗺 Sanatan Seva Control Center"
        description="Real-time live overview of transactions, devotees, pujas and inventory logs."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Revenue" value={`₹ ${totalRev}`} icon={Wallet} iconClass="text-green-600" />
        <KpiCard title="Calculated GST" value={`₹ ${totalTax}`} icon={Receipt} iconClass="text-blue-500" />
        <KpiCard title="Refunds Issued" value={`₹ ${refunds}`} icon={Clock} iconClass="text-red-500" />
        <KpiCard title="Avg Order Value" value={`₹ 0`} icon={TrendingUp} iconClass="text-primary" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Bookings" value={`${bookingsCount}`} icon={Calendar} iconClass="text-primary" />
        <KpiCard title="Confirmed Bookings" value={`${successfulBookings}`} icon={CheckCircle2} iconClass="text-green-600" />
        <KpiCard title="Pending Pujas" value={`${bookingsCount - successfulBookings}`} icon={Clock} iconClass="text-orange-500" />
        <KpiCard title="Total Customers" value={`${devoteesCount}`} icon={Users} iconClass="text-blue-500" />
      </div>

      <Card className="rounded-3xl border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-orange-500 animate-pulse" /> Quick Settings Shortcuts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {quickActions.map((a) => {
              const Icon = a.icon
              return (
                <Button key={a.href} variant="outline" asChild className="h-auto py-4 flex flex-col gap-2 rounded-2xl">
                  <Link href={a.href}>
                    <Icon className="h-5 w-5 text-orange-600" />
                    <span className="text-xs font-bold text-slate-700">{a.label}</span>
                  </Link>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
