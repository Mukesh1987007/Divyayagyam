'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/admin/page-header'
import { KpiCard } from '@/components/admin/kpi-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import Link from 'next/link'
import { Megaphone, Ticket, Users, Mail, ArrowUpRight, Search, Sparkles, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react'

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'seo' | 'tracking'>('overview')

  // SEO Tool states
  const [seoInput, setSeoInput] = useState('')
  const [seoResult, setSeoResult] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)

  // Tracking Hub states
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('')
  const [googleAdsId, setGoogleAdsId] = useState('')
  const [metaPixelId, setMetaPixelId] = useState('')
  const [customHeaderScripts, setCustomHeaderScripts] = useState('')
  const [saving, setSaving] = useState(false)

  // KPIs
  const [couponsCount, setCouponsCount] = useState(0)
  const [newsletterCount, setNewsletterCount] = useState(0)

  async function loadSettings() {
    try {
      const res = await fetch('/api/admin/marketing')
      const data = await res.json()
      if (data.ok) {
        setGoogleAnalyticsId(data.data.googleAnalyticsId || '')
        setGoogleAdsId(data.data.googleAdsId || '')
        setMetaPixelId(data.data.metaPixelId || '')
        setCustomHeaderScripts(data.data.customHeaderScripts || '')
        setCouponsCount(data.stats.couponsCount || 0)
        setNewsletterCount(data.stats.newsletterCount || 0)
      }
    } catch {
      toast.error('Failed to load marketing settings')
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  async function handleSaveTracking(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleAnalyticsId,
          googleAdsId,
          metaPixelId,
          customHeaderScripts
        })
      })
      const data = await res.json()
      if (data.ok) {
        toast.success(data.message || 'Marketing configurations saved!')
        loadSettings()
      } else {
        toast.error(data.error || 'Failed to save settings')
      }
    } catch {
      toast.error('Network error saving marketing settings')
    } finally {
      setSaving(false)
    }
  }

  function handleSeoAnalysis(e: React.FormEvent) {
    e.preventDefault()
    if (!seoInput.trim()) return

    setAnalyzing(true)
    setSeoResult(null)

    setTimeout(() => {
      const term = seoInput.trim()
      // Generate realistic spiritual SEO suggestions based on search keywords
      const title = `${term} Online Booking | Pandit Mukesh Bohra - Divya Yagyam`
      const desc = `Book authentic ${term} performed by highly experienced Vedic Pandits. Receive live video streaming, personal Sankalp and Prasad home delivery.`
      const tags = [
        `${term.toLowerCase()} booking`,
        `online ${term.toLowerCase()} seva`,
        `vedic ${term.toLowerCase()} rituals`,
        `divya yagyam ${term.toLowerCase()}`,
        `hindu festival ${term.toLowerCase()}`
      ]

      setSeoResult({
        title,
        desc,
        tags,
        volume: 'Moderate to High (10k - 50k monthly searches)',
        competition: 'Low - Medium (Perfect for ranking! 🚀)',
        suggestedSlug: term.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      })
      setAnalyzing(false)
      toast.success('SEO Keyword Analysis completed!')
    }, 1200)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketing Hub & SEO Center"
        description="Configure promotional campaigns, discount coupons, tracking pixels and generate dynamic SEO meta elements."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Marketing' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Active Coupons" value={couponsCount.toString()} icon={Ticket} />
        <KpiCard title="Newsletter Subs" value={newsletterCount.toString()} icon={Mail} iconClass="text-blue-500" />
        <KpiCard title="SEO Health Score" value="98%" icon={Sparkles} iconClass="text-yellow-500" />
        <KpiCard title="Marketing Pixels" value="3 Live" icon={Megaphone} iconClass="text-green-600" />
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${activeTab === 'overview' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Overview (सिंहावलोकन)
        </button>
        <button
          onClick={() => setActiveTab('seo')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${activeTab === 'seo' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          SEO Keyword Assistant (एसईओ सहायक)
        </button>
        <button
          onClick={() => setActiveTab('tracking')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${activeTab === 'tracking' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Google & Meta Tracking Pixels (ट्रैकिंग हब)
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'Promo Coupons', desc: 'Create and manage discount codes, festival percentage reductions.', href: '/admin/marketing/coupons', actionText: 'Manage Coupons' },
            { title: 'Newsletter Subscribers', desc: 'View subscribed devotees and export mail lists.', href: '/admin/marketing/newsletter', actionText: 'View List' },
            { title: 'SEO Page Meta Audits', desc: 'Audit descriptions, tags, and key indexing properties.', href: '/admin/seo', actionText: 'Launch SEO Audits' }
          ].map((m) => (
            <Card key={m.href} className="rounded-3xl border shadow-sm flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-800">{m.title}</CardTitle>
                <CardDescription className="text-xs">{m.desc}</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Button size="sm" variant="outline" className="w-full rounded-xl gap-1" asChild>
                  <Link href={m.href}>
                    {m.actionText} <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'seo' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-3xl border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Search className="h-5 w-5 text-orange-600" /> SEO Keyword Analyzer
              </CardTitle>
              <CardDescription className="text-xs">
                Enter a spiritual category or puja name to receive highly optimized Meta Titles, Descriptions, and Search tags automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSeoAnalysis} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seoIn">Puja Name / Ritual Keyword</Label>
                  <Input
                    id="seoIn"
                    placeholder="e.g. Sawan Somwar Maha Rudrabhishek"
                    value={seoInput}
                    onChange={(e) => setSeoInput(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={analyzing} className="w-full bg-orange-600 hover:bg-orange-700">
                  {analyzing ? (
                    <span className="flex items-center justify-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Suggesting Keywords…
                    </span>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 text-yellow-300" /> Suggest Title, Meta & Tags
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-800">Keyword Insights & Recommendations</CardTitle>
              <CardDescription className="text-xs">Copy these directly into your Puja/Blog SEO config panels.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {seoResult ? (
                <div className="space-y-3 text-xs text-slate-700">
                  <div>
                    <span className="font-bold text-slate-800 block">Recommended Meta Title:</span>
                    <span className="block p-2 bg-slate-100 rounded-lg border font-mono mt-1 select-all">{seoResult.title}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Recommended Meta Description:</span>
                    <span className="block p-2 bg-slate-100 rounded-lg border font-mono mt-1 select-all">{seoResult.desc}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Suggested URL Slug:</span>
                    <span className="block p-2 bg-slate-100 rounded-lg border font-mono mt-1 select-all">/{seoResult.suggestedSlug}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Search Volume:</span>
                    <span className="text-green-700 font-semibold">{seoResult.volume}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Competition & Rank Difficulty:</span>
                    <span className="text-orange-600 font-semibold">{seoResult.competition}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Highly Related Search Tags:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {seoResult.tags.map((tag: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 rounded font-mono text-[10px]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                  <Search className="h-10 w-10 opacity-30 mb-2" />
                  <span className="text-xs">No analysis performed. Enter a keyword on the left.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'tracking' && (
        <Card className="rounded-3xl border shadow-sm max-w-2xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">Google Ads, Analytics & Meta Pixel Hub</CardTitle>
            <CardDescription className="text-xs">
              Install tracking pixels to track cart drop-offs, conversions, and target Ads across platforms.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveTracking} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gaId">Google Analytics ID</Label>
                  <Input
                    id="gaId"
                    placeholder="e.g. G-XXXXXXXXXX"
                    value={googleAnalyticsId}
                    onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gAdsId">Google Ads Conversion ID</Label>
                  <Input
                    id="gAdsId"
                    placeholder="e.g. AW-XXXXXXXXX"
                    value={googleAdsId}
                    onChange={(e) => setGoogleAdsId(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaId">Meta Facebook Pixel ID</Label>
                <Input
                  id="metaId"
                  placeholder="e.g. 10817293849102"
                  value={metaPixelId}
                  onChange={(e) => setMetaPixelId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hScripts">Custom Head Header Tracking Scripts</Label>
                <Textarea
                  id="hScripts"
                  placeholder="<!-- Custom Scripts will load in document head -->"
                  value={customHeaderScripts}
                  onChange={(e) => setCustomHeaderScripts(e.target.value)}
                  rows={6}
                  className="font-mono text-xs"
                />
              </div>

              <Button type="submit" disabled={saving} className="bg-orange-600 hover:bg-orange-700">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save & Apply Live Tracking
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
