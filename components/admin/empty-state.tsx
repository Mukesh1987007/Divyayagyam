import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Inbox } from 'lucide-react'

export function EmptyState({
  title = 'No data yet',
  description = 'Records will appear here once created.',
  icon: Icon = Inbox,
  action,
  className,
}: {
  title?: string
  description?: string
  icon?: any
  action?: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn('flex flex-col items-center justify-center py-16 px-6 text-center border-dashed', className)}>
      <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </Card>
  )
}
