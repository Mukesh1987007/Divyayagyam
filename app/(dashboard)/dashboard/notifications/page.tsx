import { Card } from '@/components/ui/card'
import { Bell } from 'lucide-react'
export const revalidate = 60; // ISR: Revalidate every 60s

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-muted-foreground text-sm">Stay updated with your puja updates and order status.</p>
      </div>

      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <Bell className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
        <h3 className="font-semibold text-lg">No Notifications</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1">
          You are all caught up! There are no new notifications.
        </p>
      </Card>
    </div>
  )
}
