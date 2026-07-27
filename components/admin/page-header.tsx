'use client';

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronRight, Plus } from 'lucide-react'

export type BreadCrumb = { label: string; href?: string }

export function PageHeader({
  title, description, breadcrumbs, action, secondaryAction, className,
}: {
  title: string
  description?: string
  breadcrumbs?: BreadCrumb[]
  action?: { label: string; href?: string; onClick?: () => void; icon?: any; disabled?: boolean }
  secondaryAction?: { label: string; href?: string; onClick?: () => void }
  className?: string
}) {
  const ActionIcon = action?.icon || Plus
  return (
    <div className={cn('mb-6', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-1">
              {b.href ? (
                <Link href={b.href} className="hover:text-foreground">{b.label}</Link>
              ) : (
                <span>{b.label}</span>
              )}
              {i < breadcrumbs.length - 1 && <ChevronRight className="h-3 w-3" />}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {secondaryAction && (
            secondaryAction.href ? (
              <Button variant="outline" asChild><Link href={secondaryAction.href}>{secondaryAction.label}</Link></Button>
            ) : (
              <Button variant="outline" onClick={secondaryAction.onClick}>{secondaryAction.label}</Button>
            )
          )}
          {action && (
            action.href ? (
              <Button asChild><Link href={action.href}><ActionIcon className="h-4 w-4 mr-1" />{action.label}</Link></Button>
            ) : (
              <Button onClick={action.onClick}><ActionIcon className="h-4 w-4 mr-1" />{action.label}</Button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
