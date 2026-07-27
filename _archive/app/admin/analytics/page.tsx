'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/admin/page-header'
import { KpiCard } from '@/components/admin/kpi-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, TrendingUp, MousePointerClick, Globe, Smartphone, Monitor, Loader2, RefreshCw } from 'lucide-react'

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [data, setData] = useState<any>({
    visitors30d: 0,
    userGrowth: '0%',
    userGrowthValue: 0,
    conversionRate: '0%',
    revenueGrowth: '0%',
    revenueGrowthValue: 0,
    totalRevenue: 0,
    mobilePercentage: 76,
    desktopPercentage: 24
  })

  const loadAnalytics = async () => {
    try {
      setRefreshing(true)
      const res = await fetch('/api/admin/analytics')
      const j = await res.json()
      if (j.ok) {
        setData(j.data)
      }
    } catch {
      // fallback silently
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Real-Time Analytics" description="Google Analytics, user growth, conversion & traffic." />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadAnalytics} 
          disabled={refreshing}
          className="gap-2 rounded-xl"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          title="Total Visitors (30d)" 
          value={data.visitors30d.toString()} 
          icon={Globe} 
        />
        <KpiCard 
          title="User Growth" 
          value={data.userGrowth} 
          icon={Users} 
          change={data.userGrowthValue} 
        />
        <KpiCard 
          title="Conversion Rate" 
          value={data.conversionRate} 
          icon={MousePointerClick} 
        />
        <KpiCard 
          title="Revenue Growth" 
          value={data.revenueGrowth} 
          icon={TrendingUp} 
          change={data.revenueGrowthValue} 
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Traffic Sources */}
        <Card className="rounded-3xl border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">Traffic Sources</CardTitle>
            <CardDescription className="text-xs">Live channel acquisition breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs md:text-sm">
            <div className="flex items-center justify-center p-6 text-center h-full">
              <p className="text-slate-500 text-xs">
                To view live traffic acquisition sources (Direct, Social, Organic Search), please integrate your Google Analytics Measurement ID in the Settings tab.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card className="rounded-3xl border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">Device Breakdown</CardTitle>
            <CardDescription className="text-xs">User agent connection sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-orange-600 shrink-0" /> 
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Mobile Users</span>
                    <span>{data.mobilePercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-full rounded-full" style={{ width: `${data.mobilePercentage}%` }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Monitor className="h-5 w-5 text-slate-600 shrink-0" /> 
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Desktop Users</span>
                    <span>{data.desktopPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-slate-500 h-full rounded-full" style={{ width: `${data.desktopPercentage}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
