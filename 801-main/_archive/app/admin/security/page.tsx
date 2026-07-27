'use client'
import React from 'react';

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/admin/page-header'
import { AdminTabs } from '@/components/admin/admin-tabs'
import { KpiCard } from '@/components/admin/kpi-card'
import { DataTableShell } from '@/components/admin/data-table-shell'
import { Lock, ShieldCheck, Activity, Key, Loader2, Save } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useSearchParams, useRouter } from 'next/navigation'

function SecurityPage_Content() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get('tab') || 'overview'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logs, setLogs] = useState<any[]>([])
  
  // Settings state
  const [originalConfig, setOriginalConfig] = useState<Record<string, any>>({})
  const [enableRateLimit, setEnableRateLimit] = useState(true)
  const [maxReqPerMin, setMaxReqPerMin] = useState(100)
  const [ipBlocklist, setIpBlocklist] = useState('')
  const [require2FA, setRequire2FA] = useState(false)

  async function loadData() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/security')
      const json = await res.json()
      if (json.ok) {
        setLogs(json.data.logs || [])
        
        const conf = json.data.config || {}
        setOriginalConfig(conf)
        setEnableRateLimit(conf['security.rateLimit'] ?? true)
        setMaxReqPerMin(conf['security.maxReqPerMin'] ?? 100)
        setIpBlocklist(conf['security.ipBlocklist'] ?? '')
        setRequire2FA(conf['security.require2FA'] ?? false)
      } else {
        toast.error('Failed to load security logs & settings')
      }
    } catch {
      toast.error('Network error loading security data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            'security.rateLimit': enableRateLimit,
            'security.maxReqPerMin': maxReqPerMin,
            'security.ipBlocklist': ipBlocklist,
            'security.require2FA': require2FA
          }
        })
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Security settings applied globally!')
        loadData()
      } else {
        toast.error(data.error || 'Failed to save')
      }
    } catch {
      toast.error('Network error saving security settings')
    } finally {
      setSaving(false)
    }
  }

  function handleUndo() {
    setEnableRateLimit(originalConfig['security.rateLimit'] ?? true)
    setMaxReqPerMin(originalConfig['security.maxReqPerMin'] ?? 100)
    setIpBlocklist(originalConfig['security.ipBlocklist'] ?? '')
    setRequire2FA(originalConfig['security.require2FA'] ?? false)
    toast.info('Security settings restored to last saved state.')
  }

  const changeTab = (val: string) => {
    router.push(`/admin/security?tab=${val}`)
  }

  const tabs = [
    { label: 'Overview', value: 'overview' }, 
    { label: 'Audit & Login Logs', value: 'login-logs' },
    { label: 'Rate Limits & Blocklist', value: 'rate-limits' }
  ]

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  const failedLogins = logs.filter(l => l.action === 'LOGIN_FAILED').length

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Security & Firewall" 
        description="Monitor login activity, configure rate limiting, and manage IP blocks."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Security' }]} 
      />
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Active Sessions" value="1" icon={Activity} iconClass="text-green-600" />
        <KpiCard title="Failed Logins (Recent)" value={failedLogins.toString()} icon={Lock} iconClass={failedLogins > 0 ? "text-red-500" : "text-slate-500"} />
        <KpiCard title="Blocked IPs" value={ipBlocklist ? ipBlocklist.split(',').length.toString() : "0"} icon={ShieldCheck} iconClass="text-blue-500" />
        <KpiCard title="Rate Limiting" value={enableRateLimit ? "Enabled" : "Disabled"} icon={Key} iconClass={enableRateLimit ? "text-green-600" : "text-red-500"} />
      </div>

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

      {activeTab === 'login-logs' && (
        <DataTableShell
          columns={[
            { key: 'user', label: 'User Email' }, 
            { key: 'action', label: 'Action' },
            { key: 'ip', label: 'IP Address' }, 
            { key: 'ua', label: 'Device/User Agent' }, 
            { key: 'time', label: 'Time' },
          ]}
          rows={logs.map(l => ({
            id: l.id,
            user: l.user?.email || l.userId || 'System/Guest',
            action: <span className={l.action.includes('FAIL') || l.action.includes('ERROR') ? 'text-red-600 font-semibold' : 'text-green-600'}>{l.action}</span>,
            ip: l.ipAddress || 'Unknown',
            ua: <span className="truncate max-w-[200px] inline-block" title={l.userAgent}>{l.userAgent || '-'}</span>,
            time: new Date(l.createdAt).toLocaleString()
          }))}
        />
      )}

      {activeTab === 'rate-limits' && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Firewall & Rate Limiting</CardTitle>
            <CardDescription>Configure protection rules to prevent abuse.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Rate Limiting</Label>
                <div className="text-sm text-muted-foreground">Block excessive requests from a single IP.</div>
              </div>
              <Switch checked={enableRateLimit} onCheckedChange={setEnableRateLimit} />
            </div>
            
            {enableRateLimit && (
              <div className="space-y-2">
                <Label>Max Requests per Minute</Label>
                <Input type="number" value={maxReqPerMin} onChange={e => setMaxReqPerMin(Number(e.target.value))} />
              </div>
            )}

            <div className="space-y-2 pt-4 border-t">
              <Label>IP Blocklist</Label>
              <Input placeholder="e.g. 192.168.1.1, 10.0.0.1" value={ipBlocklist} onChange={e => setIpBlocklist(e.target.value)} />
              <div className="text-xs text-muted-foreground">Comma-separated list of IP addresses to block globally.</div>
            </div>

            <div className="flex gap-2 pt-6">
              <Button variant="outline" type="button" onClick={handleUndo}>Undo Changes</Button>
              <Button type="button" onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Security Rules
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'overview' && (
        <Card>
          <CardHeader>
            <CardTitle>Security Overview</CardTitle>
            <CardDescription>Your system is currently being monitored.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm leading-relaxed">
              From this dashboard you can monitor all login attempts (successful and failed), track admin actions across the portal, and enforce security policies like API Rate Limiting and IP Blocklisting. Use the tabs above to navigate.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


export default function SecurityPage() {
  return (
    <React.Suspense fallback={<div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#FF8C21]"></div></div>}>
      <SecurityPage_Content />
    </React.Suspense>
  );
}
