import { Navbar } from '@/components/layouts/navbar'
import { DashboardSidebar } from '@/components/layouts/dashboard-sidebar'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, ShoppingBag, User, LogOut, LayoutDashboard, FileText, ScrollText } from 'lucide-react'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser().catch(() => null)
  if (!user) redirect('/login?redirect=/dashboard')

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={{ fullName: user.fullName, email: user.email }} />
      
      {/* Mobile Sub-header navigation for dashboard */}
      <div className="lg:hidden border-b bg-background px-4 py-2.5 overflow-x-auto flex items-center gap-2 scrollbar-none sticky top-16 z-30 shadow-sm">
        <Link href="/dashboard" className="text-xs font-semibold px-3 py-1.5 rounded-full bg-muted flex items-center gap-1.5 whitespace-nowrap">
          <LayoutDashboard className="h-3.5 w-3.5" /> Overview
        </Link>
        <Link href="/dashboard/bookings" className="text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-muted flex items-center gap-1.5 whitespace-nowrap">
          <Calendar className="h-3.5 w-3.5" /> Bookings
        </Link>
        <Link href="/dashboard/orders" className="text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-muted flex items-center gap-1.5 whitespace-nowrap">
          <ShoppingBag className="h-3.5 w-3.5" /> Orders
        </Link>
        <Link href="/dashboard/invoices" className="text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-muted flex items-center gap-1.5 whitespace-nowrap">
          <FileText className="h-3.5 w-3.5" /> Invoices
        </Link>
        <Link href="/dashboard/reports" className="text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-muted flex items-center gap-1.5 whitespace-nowrap">
          <ScrollText className="h-3.5 w-3.5" /> Reports
        </Link>
        <Link href="/dashboard/profile" className="text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-muted flex items-center gap-1.5 whitespace-nowrap">
          <User className="h-3.5 w-3.5" /> Profile
        </Link>
        <form action="/auth/signout" method="post" className="inline-flex">
          <button type="submit" className="text-xs font-semibold px-3 py-1.5 rounded-full text-destructive hover:bg-destructive/10 flex items-center gap-1.5 whitespace-nowrap" aria-label="Button">
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </form>
      </div>

      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-6 lg:p-8 bg-muted/20">{children}</main>
      </div>
    </div>
  )
}
