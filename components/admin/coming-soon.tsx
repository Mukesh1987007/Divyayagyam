import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'

export function ComingSoon({
  title = 'Coming Soon',
  description = 'This module is being crafted with devotion. Stay tuned.',
  features,
}: {
  title?: string
  description?: string
  features?: string[]
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>{title}</CardTitle>
          <Badge variant="secondary">Roadmap</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        {features && features.length > 0 && (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 rounded-md border p-3 text-sm">
                <span className="h-2 w-2 rounded-full bg-primary" />
                {f}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
