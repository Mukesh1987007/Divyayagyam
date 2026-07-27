'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Calendar, ShoppingBag, Heart, MapPin, HeadphonesIcon,
  Bell, FileDown, User as UserIcon, LogOut, FileText, Wallet, ScrollText
} from 'lucide-react'

const items = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'My Bookings', href: '/dashboard/bookings', icon: Calendar },
  { title: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
  { title: 'Payments', href: '/dashboard/payments', icon: Wallet },
  { title: 'Invoices', href: '/dashboard/invoices', icon: FileText },
  { title: 'Reports', href: '/dashboard/reports', icon: ScrollText },
  { title: 'Wishlist', href: '/dashboard/wishlist', icon: Heart },
  { title: 'Addresses', href: '/dashboard/addresses', icon: MapPin },
  { title: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { title: 'Support', href: '/dashboard/support', icon: HeadphonesIcon },
  { title: 'Profile', href: '/dashboard/profile', icon: UserIcon },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border/60 bg-sidebar min-h-[calc(100vh-4rem)] sticky top-16">
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                active
                  ? 'bg-[var(--primary-color)] text-white shadow-md'
                  : 'text-slate-600 hover:bg-[var(--secondary-color)]/10 hover:text-orange-700'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-slate-200/60 mt-auto">
        <form action="/auth/signout" method="post">
          <button className="flex items-center gap-3 w-full rounded-xl px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors" aria-label="Button">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}

