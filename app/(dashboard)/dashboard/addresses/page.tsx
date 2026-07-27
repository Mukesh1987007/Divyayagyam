import { Card } from '@/components/ui/card'
import { MapPin } from 'lucide-react'
export const revalidate = 60; // ISR: Revalidate every 60s

export default function AddressesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Addresses</h1>
        <p className="text-muted-foreground text-sm">Manage your shipping and billing addresses.</p>
      </div>

      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <MapPin className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
        <h3 className="font-semibold text-lg">No Addresses Saved</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1">
          You haven't added any shipping or billing addresses to your account yet.
        </p>
      </Card>
    </div>
  )
}
