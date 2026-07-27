'use client'

import Link from 'next/link'
import Image from 'next/image';
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ADMIN_NAV } from '@/lib/admin-nav'
import { can } from '@/lib/rbac'
import { LogOut, ChevronDown } from 'lucide-react'

export function AdminSidebar({ permissions = ['*'], isMobile }: { permissions?: string[], isMobile?: boolean }) {
  const pathname = usePathname()

  return (
    <aside className={cn(
      "flex-col w-72 border-r border-border/60 bg-sidebar min-h-screen sticky top-0",
      isMobile ? "flex" : "hidden lg:flex"
    )}>
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border shrink-0 justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl shadow border border-amber-200/60 bg-white">
            <Image src="/logo.jpg" alt="Logo" width={400} height={300} loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold text-slate-800">Divyayagyam</span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Control Center</span>
          </div>
        </Link>
        <Link href="/" target="_blank" className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-md border font-semibold hover:bg-primary hover:text-white transition-colors">
          View Site 🌐
        </Link>
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto scrollbar-thin">
        {ADMIN_NAV.filter(section => !section.permission || can(permissions, section.permission)).map((section) => (
          <SidebarSection key={section.slug} section={section} pathname={pathname} permissions={permissions} />
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border shrink-0">
        <form action="/api/admin/logout" method="post">
          <button className="flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent" aria-label="Button">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}

function SidebarSection({ section, pathname, permissions }: { section: (typeof ADMIN_NAV)[number]; pathname: string; permissions: string[] }) {
  const Icon = section.icon
  const hasChildren = !!section.items?.length
  const isActiveParent =
    (section.href && pathname === section.href) ||
    !!section.items?.some((i) => pathname === i.href?.split('?')[0])

  const [open, setOpen] = useState(isActiveParent)

  if (!hasChildren && section.href) {
    const active = pathname === section.href
    return (
      <Link
        href={section.href}
        className={cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          active ? 'bg-primary text-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{section.title}</span>
      </Link>
    )
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActiveParent ? 'text-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent'
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate flex-1 text-left">{section.title}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="mt-0.5 mb-1 ml-4 pl-3 border-l border-sidebar-border space-y-0.5">
          {section.items!.map((item) => {
            const active = pathname + (typeof window !== 'undefined' ? window.location.search : '') === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block rounded-md px-3 py-1.5 text-xs transition-colors',
                  active
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                )}
              >
                {item.title}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
