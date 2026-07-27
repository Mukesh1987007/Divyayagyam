import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ArrowDown, ArrowUp } from 'lucide-react'

export function KpiCard({
  title, value, icon: Icon, change, changeLabel, iconClass, valueClass,
}: {
  title: string
  value: string | number
  icon?: any
  change?: number
  changeLabel?: string
  iconClass?: string
  valueClass?: string
}) {
  const positive = (change ?? 0) >= 0
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          {Icon && <Icon className={cn('h-4 w-4', iconClass || 'text-muted-foreground')} />}
        </div>
        <p className={cn('mt-1 text-2xl font-bold', valueClass)}><span>{value}</span></p>
        {typeof change === 'number' && (
          <div className="mt-1 flex items-center gap-1 text-[11px]">
            <span className={cn('flex items-center', positive ? 'text-green-600' : 'text-red-600')}>
              {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {Math.abs(change)}%
            </span>
            {changeLabel && <span className="text-muted-foreground">{changeLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
