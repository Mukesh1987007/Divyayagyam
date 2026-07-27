import { Card } from '@/components/ui/card'
import { FileDown } from 'lucide-react'
export const revalidate = 60; // ISR: Revalidate every 60s

export default function DownloadsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Downloads</h1>
        <p className="text-muted-foreground text-sm">Download your certificates and spiritual guides.</p>
      </div>

      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <FileDown className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
        <h3 className="font-semibold text-lg">No Downloads Available</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1">
          No files or certificates are available to download yet.
        </p>
      </Card>
    </div>
  )
}
