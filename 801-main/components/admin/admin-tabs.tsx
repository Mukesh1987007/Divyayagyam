'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

import React from 'react'

function AdminTabsContent({ tabs, className }: { tabs: { label: string; value?: string; badge?: string | number }[]; className?: string }) {
  const pathname = usePathname()
  const params = useSearchParams()
  const active = params.get('tab') || ''

  return (
    <div className={cn('mb-4 border-b overflow-x-auto', className)}>
      <div className="flex gap-1 min-w-max">
        {tabs.map((t) => {
          const val = t.value ?? ''
          const isActive = active === val
          const href = val ? `${pathname}?tab=${val}` : pathname
          return (
            <Link
              key={t.label}
              href={href}
              className={cn(
                'px-3 py-2 -mb-px border-b-2 text-sm font-medium whitespace-nowrap',
                isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {t.label}
              {t.badge !== undefined && (
                <span className="ml-1.5 text-[10px] bg-muted px-1.5 py-0.5 rounded-full">{t.badge}</span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function AdminTabs(props: { tabs: { label: string; value?: string; badge?: string | number }[]; className?: string }) {
  return (
    <React.Suspense fallback={<div className="h-10 mb-4 animate-pulse bg-muted rounded"></div>}>
      <AdminTabsContent {...props} />
    </React.Suspense>
  )
}
