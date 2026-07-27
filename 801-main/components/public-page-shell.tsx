import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function PublicPageShell({
  title, subtitle, description, badge, cta, children,
}: {
  title: string
  subtitle?: string
  description?: string
  badge?: string
  cta?: { label: string; href: string }
  children?: React.ReactNode
}) {
  return (
    <div className="container py-14">
      <div className="text-center max-w-2xl mx-auto">
        {badge && <Badge variant="secondary" className="mb-3">{badge}</Badge>}
        <h1 className="text-4xl md:text-5xl font-black text-om-gradient">{title}</h1>
        {subtitle && <p className="mt-3 text-lg text-muted-foreground">{subtitle}</p>}
        {description && <p className="mt-4 text-sm text-muted-foreground">{description}</p>}
        {cta && <Button asChild className="mt-6"><Link href={cta.href}>{cta.label}</Link></Button>}
      </div>
      {children && <div className="mt-10">{children}</div>}
    </div>
  )
}
