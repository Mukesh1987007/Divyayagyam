import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, ShoppingBag, Heart, MessageSquare, Clock } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { format } from 'date-fns'
import { RealtimeRefresher } from '@/components/realtime-refresher'
export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user?.id) return null

  // Fetch real counts
  const [bookingsCount, ordersCount, wishlistCount, ticketsCount] = await Promise.all([
    prisma.booking.count({ where: { userId: user.id } }),
    prisma.order.count({ where: { userId: user.id } }),
    prisma.wishlist.count({ where: { userId: user.id } }),
    prisma.supportTicket.count({ where: { userId: user.id } })
  ])

  // Fetch recent activity
  const [recentBookings, recentOrders, recentTickets] = await Promise.all([
    prisma.booking.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 3, include: { puja: { select: { name: true } } } }),
    prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 3 }),
    prisma.supportTicket.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 3 })
  ])

  // Combine and sort activities
  const activities = [
    ...recentBookings.map(b => ({ type: 'booking', date: b.createdAt, title: `Booked Puja: ${b.puja?.name || 'Custom'}`, status: b.status, link: '/dashboard/bookings' })),
    ...recentOrders.map(o => ({ type: 'order', date: o.createdAt, title: `Order Placed (#${o.orderNumber})`, status: o.status, link: '/dashboard/orders' })),
    ...recentTickets.map(t => ({ type: 'ticket', date: t.createdAt, title: `Support Ticket: ${t.subject}`, status: t.status, link: '/dashboard/support' }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5)

  const stats = [
    { title: 'My Bookings', value: bookingsCount, icon: Calendar, color: 'text-primary' },
    { title: 'My Orders', value: ordersCount, icon: ShoppingBag, color: 'text-accent' },
    { title: 'Wishlist', value: wishlistCount, icon: Heart, color: 'text-pink-500' },
    { title: 'Complaints', value: ticketsCount, icon: MessageSquare, color: 'text-red-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">नमस्ते, {user?.fullName?.split(' ')[0] || 'Devotee'} 🙏</h1>
        <p className="text-muted-foreground text-sm">Welcome to your spiritual dashboard.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.title}>
              <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
                <Icon className={`h-4 w-4 ${s.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader><CardTitle>Live Activity Timeline</CardTitle></CardHeader>
        <CardContent>
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((act, i) => (
                <div key={i} className="flex items-start gap-4 border-b border-border/50 pb-4 last:border-0 last:pb-0">
                  <div className="mt-1 h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{act.title}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{format(new Date(act.date), 'dd MMM yyyy, hh:mm a')}</span>
                      <span className="uppercase text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{act.status}</span>
                    </div>
                  </div>
                  <Link href={act.link} className="text-xs font-semibold text-primary hover:underline shrink-0">
                    View
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity yet. Start by booking a puja — <a href="/pujas" className="text-primary hover:underline">browse pujas →</a></p>
          )}
        </CardContent>
      </Card>
      <RealtimeRefresher />
    </div>
  )
}





