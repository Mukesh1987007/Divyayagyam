import { Card, CardContent } from '@/components/ui/card'
import { Wallet } from 'lucide-react'
export const revalidate = 60; // ISR: Revalidate every 60s

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payments History</h1>
        <p className="text-muted-foreground text-sm">View transaction details and payment history.</p>
      </div>

      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <Wallet className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
        <h3 className="font-semibold text-lg">No Payments Recorded</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1">
          There are no transaction records associated with your account yet.
        </p>
      </Card>
    </div>
  )
}
