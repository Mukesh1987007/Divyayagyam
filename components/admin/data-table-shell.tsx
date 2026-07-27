'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Search, Filter, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

type Column<T> = { key: keyof T | string; label: string; render?: (row: T) => React.ReactNode; className?: string }

export function DataTableShell<T extends Record<string, any>>({
  columns, rows, searchPlaceholder, actions, emptyMessage,
}: {
  columns: Column<T>[]
  rows: T[]
  searchPlaceholder?: string
  actions?: React.ReactNode
  emptyMessage?: string
}) {
  return (
    <Card className="overflow-hidden">
      <div className="p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border-b">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={searchPlaceholder || 'Search…'} className="pl-9 h-9" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-1" /> Filter</Button>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Export</Button>
          {actions}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((c) => (
                <th key={String(c.key)} className={cn('text-left font-medium text-muted-foreground px-4 py-2', c.className)}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-16 text-center text-muted-foreground">
                {emptyMessage || 'No records found.'}
              </td></tr>
            ) : (
              rows.map((row, i) => (
                <tr key={row.id || i} className="border-t hover:bg-muted/30">
                  {columns.map((c) => (
                    <td key={String(c.key)} className={cn('px-4 py-3', c.className)}>
                      {c.render ? c.render(row) : String(row[c.key as keyof T] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
