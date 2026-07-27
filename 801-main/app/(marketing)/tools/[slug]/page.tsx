import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle, Lock, Sparkles } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ToolMapper } from '@/components/tools/ToolMapper'
import { PaywallOverlay } from '@/components/tools/PaywallOverlay'
export const revalidate = 30

export default async function ToolViewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let tool = await prisma.spiritualTool.findUnique({ where: { slug: slug } })

  if (!tool || !tool.isActive) {
    notFound()
  }

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') || '127.0.0.1'

  let allowed = tool.isFree
  let trialExpired = false

  // For now, assume it's locked if it's a paid tool (until real user payment check is implemented)
  if (!tool.isFree) {
    allowed = false
  }

  return (
    <div className="container max-w-4xl py-10 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {tool.name} 
            {!tool.isFree && <span className="bg-amber-100 text-amber-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles className="h-3 w-3" /> Premium</span>}
          </h1>
          <p className="text-muted-foreground mt-1">{tool.description}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/tools">Back to Tools</Link>
        </Button>
      </div>

      <div className="relative">
        {/* Render the tool */}
        <div className={!allowed ? "max-h-[400px] overflow-hidden blur-[2px] opacity-60 pointer-events-none select-none relative" : ""}>
          <ToolMapper tool={tool} isPremiumUnlocked={allowed} />
        </div>

        {/* The Paywall Overlay */}
        {!allowed && (
          <PaywallOverlay tool={tool} />
        )}
      </div>
    </div>
  )
}
