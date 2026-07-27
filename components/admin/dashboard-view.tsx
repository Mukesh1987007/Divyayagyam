'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  TrendingUp, Users, Flame, Ticket, ShoppingBag, Sparkles, Heart,
  ArrowUpRight, Plus, RefreshCw, ShieldCheck, Database, Zap,
  CheckCircle2, Clock, AlertCircle, ArrowRight, Calendar, MapPin
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface DashboardViewProps {
  stats: {
    totalCollections: number
    bookingsCount: number
    ordersCount: number
    usersCount: number
    supportTicketsCount: number
    activePujasCount: number
    templesCount: number
    productsCount: number
    blogsCount: number
    eventsCount: number
    galleryCount: number
    testimonialsCount: number
    bhaktiSevaCount: number
    donationsCount: number
  }
  recentBookings: any[]
  recentOrders: any[]
  recentBhaktiSeva: any[]
  recentDonations: any[]
  recentUsers: any[]
  recentPayments: any[]
  recentSupportTickets: any[]
  weeklyTrend: any[]
  monthlyMetrics: any[]
}

export function DashboardView({
  stats,
  recentBookings = [],
  recentOrders = [],
  recentBhaktiSeva = [],
  recentDonations = [],
  recentUsers = [],
  recentPayments = [],
  recentSupportTickets = [],
  weeklyTrend = [],
  monthlyMetrics = []
}: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState<'bookings' | 'orders' | 'bhaktiSeva' | 'donations' | 'users' | 'payments' | 'tickets'>('bookings')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      window.location.reload()
    }, 1000)
  }

  // Helper for safe chart height calculation
  const maxWeeklyValue = Math.max(...weeklyTrend.map(item => Math.max(item.bookings, item.orders)), 10)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Upper Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              दिव्ययज्ञम् Control Center
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              LIVE PRODUCTION DB
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Overview and real-time operations of Sanatan Seva दिव्ययज्ञम्.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="h-9 gap-1.5"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/admin/pujas">
            <Button size="sm" className="h-9 gap-1.5 om-gradient text-white border-0 shadow">
              <Plus className="h-4 w-4" /> Add Puja
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue / Collections */}
        <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              Total Collections
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold tracking-tight pt-1">
              ₹{stats.totalCollections.toLocaleString('en-IN')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Sum of successful payments
            </p>
            <div className="absolute right-3 bottom-3 opacity-10">
              <TrendingUp className="h-16 w-16 text-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Bookings */}
        <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              Puja Bookings
              <Ticket className="h-4 w-4 text-[var(--primary-color)]" />
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold tracking-tight pt-1">
              {stats.bookingsCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Total scheduled pujas
            </p>
            <div className="absolute right-3 bottom-3 opacity-10">
              <Flame className="h-16 w-16 text-[var(--primary-color)]" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Store Orders */}
        <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              Store Orders
              <ShoppingBag className="h-4 w-4 text-blue-500" />
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold tracking-tight pt-1">
              {stats.ordersCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Total prasad & product orders
            </p>
            <div className="absolute right-3 bottom-3 opacity-10">
              <ShoppingBag className="h-16 w-16 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Devotees */}
        <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              Total Devotees
              <Users className="h-4 w-4 text-purple-500" />
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold tracking-tight pt-1">
              {stats.usersCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Total registered users
            </p>
            <div className="absolute right-3 bottom-3 opacity-10">
              <Users className="h-16 w-16 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Side: Recent Activity Tab-Panel */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex flex-col gap-3 border-b pb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Recent Platform Activity</h3>
              <Link
                href={
                  activeTab === 'bookings'
                    ? '/admin/bookings'
                    : activeTab === 'orders'
                    ? '/admin/orders'
                    : activeTab === 'bhaktiSeva'
                    ? '/admin/bhaktiseva'
                    : activeTab === 'users'
                    ? '/admin/users'
                    : activeTab === 'payments'
                    ? '/admin/payments'
                    : '/admin/support'
                }
                className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
              >
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            
            <div className="flex flex-wrap gap-1 bg-muted p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeTab === 'bookings'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Bookings ({recentBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeTab === 'orders'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Orders ({recentOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('bhaktiSeva')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeTab === 'bhaktiSeva'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                BhaktiSeva ({recentBhaktiSeva.length})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeTab === 'users'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Users ({recentUsers.length})
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeTab === 'payments'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Payments ({recentPayments.length})
              </button>
              <button
                onClick={() => setActiveTab('tickets')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeTab === 'tickets'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Tickets ({recentSupportTickets.length})
              </button>
            </div>
          </div>

          {/* Bookings Table */}
          {activeTab === 'bookings' && (
            <Card className="border shadow-none overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted/40 border-b text-muted-foreground font-medium text-xs">
                      <th className="p-3 pl-4">Booking ID</th>
                      <th className="p-3">Devotee</th>
                      <th className="p-3">Puja Service</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right pr-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentBookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center p-8 text-muted-foreground">
                          No recent bookings found.
                        </td>
                      </tr>
                    ) : (
                      recentBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-3 pl-4 font-mono font-bold text-xs">{b.bookingNumber}</td>
                          <td className="p-3">
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground">{b.user?.fullName || 'Guest Devotee'}</span>
                              <span className="text-[10px] text-muted-foreground">{b.user?.email}</span>
                            </div>
                          </td>
                          <td className="p-3 truncate max-w-[180px]" title={b.puja?.name}>
                            {b.puja?.name}
                          </td>
                          <td className="p-3 font-semibold">₹{parseFloat(b.total || '0').toLocaleString('en-IN')}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              b.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : b.status === 'CONFIRMED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-amber-800'
                            }`}>
                              {b.status === 'COMPLETED' && <CheckCircle2 className="h-3 w-3" />}
                              {b.status === 'CONFIRMED' && <Clock className="h-3 w-3" />}
                              {b.status === 'PENDING' && <AlertCircle className="h-3 w-3" />}
                              {b.status}
                            </span>
                          </td>
                          <td className="p-3 text-right pr-4">
                            <Link href={`/admin/bookings?id=${b.id}`}>
                              <Button variant="ghost" size="sm" className="h-8">Details</Button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Orders Table */}
          {activeTab === 'orders' && (
            <Card className="border shadow-none overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted/40 border-b text-muted-foreground font-medium text-xs">
                      <th className="p-3 pl-4">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right pr-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center p-8 text-muted-foreground">
                          No recent orders found.
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-3 pl-4 font-mono font-bold text-xs">{o.orderNumber}</td>
                          <td className="p-3">
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground">{o.user?.fullName || 'Store Customer'}</span>
                              <span className="text-[10px] text-muted-foreground">{o.user?.email}</span>
                            </div>
                          </td>
                          <td className="p-3 font-semibold">₹{parseFloat(o.total || '0').toLocaleString('en-IN')}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              o.status === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : o.status === 'PROCESSING'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-amber-800'
                            }`}>
                              {o.status === 'DELIVERED' && <CheckCircle2 className="h-3 w-3" />}
                              {o.status === 'PROCESSING' && <Clock className="h-3 w-3" />}
                              {o.status === 'PENDING' && <AlertCircle className="h-3 w-3" />}
                              {o.status}
                            </span>
                          </td>
                          <td className="p-3 text-right pr-4">
                            <Link href={`/admin/orders?id=${o.id}`}>
                              <Button variant="ghost" size="sm" className="h-8">Manage</Button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* BhaktiSeva Table */}
          {activeTab === 'bhaktiSeva' && (
            <Card className="border shadow-none overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted/40 border-b text-muted-foreground font-medium text-xs">
                      <th className="p-3 pl-4">Devotee</th>
                      <th className="p-3">Offering Item</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Sankalp Amount</th>
                      <th className="p-3 text-right pr-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentBhaktiSeva.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center p-8 text-muted-foreground">
                          No recent offerings found.
                        </td>
                      </tr>
                    ) : (
                      recentBhaktiSeva.map((c) => (
                        <tr key={c.id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-3 pl-4">
                            <span className="font-semibold text-foreground">{c.user?.fullName || 'Anonymous Devotee'}</span>
                          </td>
                          <td className="p-3 font-medium text-foreground">{c.itemName}</td>
                          <td className="p-3">
                            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                              {c.itemType}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-emerald-600">₹{parseFloat(c.amount || '0').toLocaleString('en-IN')}</td>
                          <td className="p-3 text-right pr-4 text-xs text-muted-foreground">
                            {new Date(c.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}



          {/* Users Table */}
          {activeTab === 'users' && (
            <Card className="border shadow-none overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted/40 border-b text-muted-foreground font-medium text-xs">
                      <th className="p-3 pl-4">Full Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right pr-4">Joined At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center p-8 text-muted-foreground">
                          No recent users found.
                        </td>
                      </tr>
                    ) : (
                      recentUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-3 pl-4 font-semibold text-foreground">{u.fullName || 'Guest'}</td>
                          <td className="p-3 text-muted-foreground">{u.email}</td>
                          <td className="p-3 text-xs font-mono">{u.phone || '-'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="p-3 text-right pr-4 text-xs text-muted-foreground">
                            {new Date(u.createdAt).toLocaleDateString('en-IN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Payments Table */}
          {activeTab === 'payments' && (
            <Card className="border shadow-none overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted/40 border-b text-muted-foreground font-medium text-xs">
                      <th className="p-3 pl-4">Payment ID</th>
                      <th className="p-3">Devotee</th>
                      <th className="p-3">Gateway</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right pr-4">Paid At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentPayments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center p-8 text-muted-foreground">
                          No recent payments found.
                        </td>
                      </tr>
                    ) : (
                      recentPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-3 pl-4 font-mono font-bold text-xs">{p.id.substring(0, 8)}...</td>
                          <td className="p-3 font-semibold text-foreground">{p.user?.fullName || 'Anonymous'}</td>
                          <td className="p-3 text-xs font-mono">{p.gateway}</td>
                          <td className="p-3 font-bold text-emerald-600">₹{parseFloat(p.amount || '0').toLocaleString('en-IN')}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="p-3 text-right pr-4 text-xs text-muted-foreground">
                            {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN') : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Support Tickets Table */}
          {activeTab === 'tickets' && (
            <Card className="border shadow-none overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted/40 border-b text-muted-foreground font-medium text-xs">
                      <th className="p-3 pl-4">Ticket Number</th>
                      <th className="p-3">Devotee</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Priority</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right pr-4">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentSupportTickets.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center p-8 text-muted-foreground">
                          No recent support tickets found.
                        </td>
                      </tr>
                    ) : (
                      recentSupportTickets.map((t) => (
                        <tr key={t.id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-3 pl-4 font-mono font-bold text-xs">{t.ticketNumber}</td>
                          <td className="p-3 font-semibold text-foreground">{t.user?.fullName || 'Anonymous'}</td>
                          <td className="p-3 text-muted-foreground truncate max-w-[150px]">{t.subject}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.priority === 'HIGH' || t.priority === 'URGENT' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {t.priority}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="bg-gray-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              {t.status}
                            </span>
                          </td>
                          <td className="p-3 text-right pr-4 text-xs text-muted-foreground">
                            {new Date(t.updatedAt).toLocaleDateString('en-IN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Quick Stats Chart from DB */}
          <Card className="p-5">
            <h3 className="text-sm font-bold text-foreground mb-4">Weekly Seva Trend (Bookings & Prasad Orders)</h3>
            <div className="h-44 flex items-end justify-between gap-2 pt-2">
              {weeklyTrend.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                  No weekly trend data available.
                </div>
              ) : (
                weeklyTrend.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="w-full flex justify-center gap-1 h-[80%] items-end">
                      {/* Bookings Bar */}
                      <div 
                        className="w-3 sm:w-4 rounded-t bg-primary" 
                        style={{ height: `${(item.bookings / maxWeeklyValue) * 100}%` }}
                        title={`Bookings: ${item.bookings}`}
                      />
                      {/* Orders Bar */}
                      <div 
                        className="w-3 sm:w-4 rounded-t bg-orange-400" 
                        style={{ height: `${(item.orders / maxWeeklyValue) * 100}%` }}
                        title={`Orders: ${item.orders}`}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">{item.day}</span>
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center gap-4 justify-center mt-4 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-primary rounded-sm" />
                <span className="text-muted-foreground font-medium">Puja Bookings</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-orange-400 rounded-sm" />
                <span className="text-muted-foreground font-medium">Prasad & Product Sales</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side: Quick Action Panel & Integration Health */}
        <div className="space-y-6">
          
          {/* Quick Actions Panel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Quick Actions</CardTitle>
              <CardDescription className="text-xs">Direct paths to administrative controls</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Link href="/admin/temples" className="block">
                <Button variant="outline" className="w-full h-14 flex flex-col items-center justify-center text-center p-2 text-xs font-semibold gap-1 hover:bg-muted/50">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Temples</span>
                </Button>
              </Link>
              <Link href="/admin/pujas" className="block">
                <Button variant="outline" className="w-full h-14 flex flex-col items-center justify-center text-center p-2 text-xs font-semibold gap-1 hover:bg-muted/50">
                  <Flame className="h-4 w-4 text-[var(--primary-color)]" />
                  <span>Pujas</span>
                </Button>
              </Link>
              <Link href="/admin/products" className="block">
                <Button variant="outline" className="w-full h-14 flex flex-col items-center justify-center text-center p-2 text-xs font-semibold gap-1 hover:bg-muted/50">
                  <ShoppingBag className="h-4 w-4 text-blue-500" />
                  <span>Products</span>
                </Button>
              </Link>
              <Link href="/admin/users" className="block">
                <Button variant="outline" className="w-full h-14 flex flex-col items-center justify-center text-center p-2 text-xs font-semibold gap-1 hover:bg-muted/50">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span>Devotees</span>
                </Button>
              </Link>
              <Link href="/admin/customizer" className="block">
                <Button variant="outline" className="w-full h-14 flex flex-col items-center justify-center text-center p-2 text-xs font-semibold gap-1 hover:bg-muted/50 col-span-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Theme Customizer</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Database Overview metrics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Sanatan Content Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-xs font-medium border-b pb-2">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-[var(--primary-color)]" /> Active Pujas:
                </span>
                <span className="font-bold text-foreground">{stats.activePujasCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-medium border-b pb-2">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> Temples Enrolled:
                </span>
                <span className="font-bold text-foreground">{stats.templesCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-medium border-b pb-2">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-purple-500" /> Products Catalog:
                </span>
                <span className="font-bold text-foreground">{stats.productsCount} items</span>
              </div>
              <div className="flex items-center justify-between text-xs font-medium border-b pb-2">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-blue-500" /> Scheduled Events:
                </span>
                <span className="font-bold text-foreground">{stats.eventsCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-medium border-b pb-2">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-pink-500" /> Testimonials:
                </span>
                <span className="font-bold text-foreground">{stats.testimonialsCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" /> Support Tickets:
                </span>
                <span className="font-bold text-amber-600">{stats.supportTicketsCount} Open</span>
              </div>
            </CardContent>
          </Card>

          {/* Control Center Security status */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" /> System Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <Database className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground flex-1">Database Sync:</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Prisma Live
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground flex-1">Authentication:</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Secure JWT
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground flex-1">Gateway Ref:</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Razorpay
                </span>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  )
}

