'use client'
import React from 'react';

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/admin/page-header'
import { AdminTabs } from '@/components/admin/admin-tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, Cpu, Database, Zap, FileText, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useSearchParams, useRouter } from 'next/navigation'

function DeveloperPage_Content() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get('tab') || 'health'

  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [services, setServices] = useState({
    nextjs: 'loading',
    supabaseAuth: 'loading',
    supabaseStorage: 'loading',
    postgres: 'loading'
  })

  async function loadHealth() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/developer')
      const data = await res.json()
      if (data.ok) {
        setServices(data.services)
      } else {
        toast.error('Failed to load system health')
      }
    } catch {
      toast.error('Network error loading health')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHealth()
  }, [])

  async function handleAction(actionType: string) {
    setActionLoading(actionType)
    try {
      const res = await fetch('/api/admin/developer/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionType })
      })
      const data = await res.json()
      if (data.ok) {
        toast.success(data.message)
        if (actionType === 'health-check') {
          await loadHealth()
        }
      } else {
        toast.error(data.error || 'Action failed')
      }
    } catch {
      toast.error('Network error executing action')
    } finally {
      setActionLoading('')
    }
  }

  const changeTab = (val: string) => {
    router.push(`/admin/developer?tab=${val}`)
  }

  const tabs = [
    { label: 'System Health', value: 'health' }, 
    { label: 'Env Vars', value: 'env' },
    { label: 'API Logs', value: 'api-logs' }, 
    { label: 'Cache Control', value: 'cache' }
  ]

  const serviceList = [
    { key: 'nextjs', label: 'Next.js Server', status: services.nextjs, icon: Cpu },
    { key: 'supabaseAuth', label: 'Supabase Auth', status: services.supabaseAuth, icon: Zap },
    { key: 'postgres', label: 'Postgres (Prisma)', status: services.postgres, icon: Database },
    { key: 'supabaseStorage', label: 'Supabase Storage', status: services.supabaseStorage, icon: FileText },
  ]

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Developer Console" 
        description="Monitor system health, clear caches, and manage background tasks."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Developer' }]} 
        action={{
          label: 'Refresh Status',
          icon: RefreshCw,
          onClick: loadHealth
        }}
      />

      <div className="flex gap-2 border-b pb-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => changeTab(t.value)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all shrink-0 ${activeTab === t.value ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'health' && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {serviceList.map((s) => {
              const Icon = s.icon
              const healthy = s.status === 'healthy'
              const error = s.status === 'error' || s.status === 'not-connected'
              return (
                <Card key={s.label}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center 
                      ${loading ? 'bg-slate-100 text-slate-400 animate-pulse' : healthy ? 'bg-green-500/10 text-green-600' : error ? 'bg-red-500/10 text-red-600' : 'bg-orange-500/10 text-orange-600'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{s.label}</p>
                      <Badge variant={healthy ? 'default' : error ? 'destructive' : 'secondary'} className={`mt-1 text-[10px] ${healthy ? 'bg-green-600 hover:bg-green-700' : ''}`}>
                        {loading ? 'Checking...' : healthy ? 'Healthy' : s.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Activity className="h-4 w-4" /> System Actions</CardTitle>
              <CardDescription>Perform administrative system tasks. Use with caution.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button variant="outline" onClick={() => handleAction('health-check')} disabled={actionLoading !== ''}>
                {actionLoading === 'health-check' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Run Health Check
              </Button>
              <Button variant="outline" onClick={() => handleAction('clear-cache')} disabled={actionLoading !== ''}>
                {actionLoading === 'clear-cache' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Clear Next.js Cache
              </Button>
              <Button variant="outline" onClick={() => handleAction('sitemap')} disabled={actionLoading !== ''}>
                {actionLoading === 'sitemap' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Regenerate Sitemap
              </Button>
              <Button variant="outline" onClick={() => handleAction('search-index')} disabled={actionLoading !== ''}>
                {actionLoading === 'search-index' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Rebuild Search Index
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab !== 'health' && (
        <Card>
          <CardHeader>
            <CardTitle>{tabs.find(t => t.value === activeTab)?.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">This section is currently being monitored by the system. Full logs and environment interfaces will appear here if activated.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


export default function DeveloperPage() {
  return (
    <React.Suspense fallback={<div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#FF8C21]"></div></div>}>
      <DeveloperPage_Content />
    </React.Suspense>
  );
}
