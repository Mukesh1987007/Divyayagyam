'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Sparkles, Sparkle, Calendar, Gem, ScrollText, Bot, Music, ArrowRight, Loader2, Lock } from 'lucide-react'
import Link from 'next/link'

export default function ToolsPage() {
  const [tools, setTools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [trialStatuses, setTrialStatuses] = useState<Record<string, boolean>>({})
  const [activatedStatuses, setActivatedStatuses] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch('/api/tools')
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setTools(j.data || [])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function startTrial(slug: string, trialDays: number, toolId: string) {
    try {
      const res = await fetch('/api/tools/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId })
      })
      const data = await res.json()
      if (data.ok) {
        setTrialStatuses((prev) => ({ ...prev, [slug]: true }))
        toast.success(`🎉 Your ${trialDays}-day Free Trial has been activated for this tool!`)
        window.location.href = `/tools/${slug}`
      } else {
        toast.error(data.error || 'Failed to start trial')
      }
    } catch {
      toast.error('Network error starting trial')
    }
  }

  function buyActivation(slug: string, price: number) {
    setActivatedStatuses((prev) => ({ ...prev, [slug]: true }))
    toast.success(`💳 Payment of ₹${price} received. Premium access activated!`)
  }

  const iconMap: Record<string, any> = {
    kundali: ScrollText,
    milan: Sparkle,
    panchang: Calendar,
    muhurat: Sparkles,
    numerology: Sparkles,
    ratna: Gem,
    mala: Music,
    'ask-a-pandit': Bot,
  }



  return (
    <div className="container py-14 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <Badge variant="secondary" className="mb-4 text-sm px-4 py-1">🔮 Spiritual Tools</Badge>
        <h1 className="text-4xl md:text-5xl font-black text-om-gradient">Sacred Vedic Tools</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Empowering your spiritual journey with ancient wisdom and modern AI.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary-color)]" />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          
          {/* Static AI Pandit Tool (Always Free & Live) */}
          <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden border-2 border-green-500/30 bg-gradient-to-b from-green-50/50 to-white">
            <CardContent className="p-8 space-y-5 flex flex-col h-full">
              <div className="flex items-start justify-between">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-200">
                  <Bot className="h-7 w-7 text-white" />
                </div>
                <Badge className="bg-green-100 text-green-800 font-bold border-green-200">LIVE NOW</Badge>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-slate-900">AI Pandit Ji ✨</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed font-medium">
                  Ask your spiritual queries, get astrology insights, and Vedic guidance instantly in Hindi or English.
                </p>
              </div>
              <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl h-12 shadow-md">
                <Link href="/ask-a-pandit">
                  Chat Now for Free <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Database Tools */}
          {tools
            .filter((t) => t.isActive)
            .map((t) => {
              const IconComponent = iconMap[t.slug] || Sparkle
              const trialActive = trialStatuses[t.slug]
              const premiumActive = activatedStatuses[t.slug]

              return (
                <Card key={t.id} className="group hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden border border-slate-200">
                  <CardContent className="p-8 space-y-5 flex flex-col justify-between h-full">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="h-14 w-14 rounded-2xl bg-orange-100 flex items-center justify-center">
                          <IconComponent className="h-7 w-7 text-[var(--primary-color)]" />
                        </div>
                        {t.isFree ? (
                          <Badge variant="outline" className="font-bold">Free Access</Badge>
                        ) : premiumActive ? (
                          <Badge className="bg-green-100 text-green-800 font-bold">Premium Active</Badge>
                        ) : trialActive ? (
                          <Badge className="bg-yellow-100 text-yellow-800 font-bold">Trial Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="font-bold">Premium (₹{Number(t.price)})</Badge>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-slate-900">{t.name}</h3>
                        <p className="mt-2 text-sm text-slate-600 leading-relaxed font-medium">{t.description}</p>
                      </div>
                    </div>

                    <div className="pt-5 border-t border-slate-100 space-y-3">
                      {t.isFree || premiumActive || trialActive ? (
                        <Button className="w-full h-12 rounded-xl font-bold bg-[var(--primary-color)] hover:bg-orange-700 text-white" asChild>
                          <Link href={`/tools/${t.slug}`}>
                            Open Tool <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          <Button variant="outline" className="h-12 rounded-xl font-bold border-slate-300 text-slate-700" onClick={() => startTrial(t.slug, t.trialDays, t.id)}>
                            {t.trialDays} Days Trial
                          </Button>
                          <Button className="h-12 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800" onClick={() => buyActivation(t.slug, Number(t.price))}>
                            Activate
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            

        </div>
      )}
    </div>
  )
}
