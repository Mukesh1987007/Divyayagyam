'use client'

import { useEffect, useState, useRef } from 'react'
import { PageHeader } from '@/components/admin/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  DatabaseBackup, RotateCcw, Download, Trash2, 
  CloudLightning, Loader2, FileArchive
} from 'lucide-react'

type BackupHistory = {
  filename: string
  size: number
  createdAt: string
}

export default function BackupPage() {
  const [loading, setLoading] = useState(true)
  const [backingUp, setBackingUp] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)

  const [history, setHistory] = useState<BackupHistory[]>([])
  const [autoBackup, setAutoBackup] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const res = await fetch('/api/admin/backup')
      const j = await res.json()
      if (j.ok) {
        setHistory(j.backups || [])
        setAutoBackup(j.settings.autoBackup || false)
      }
    } catch (err: any) {
      toast.error('Failed to load backup configuration')
    } finally {
      setLoading(false)
    }
  }

  async function handleBackup() {
    setBackingUp(true)
    toast.info('Generating system database dump & theme backup zip...')
    try {
      const res = await fetch('/api/admin/backup', { method: 'POST' })
      const j = await res.json()
      if (j.ok) {
        toast.success(`Backup created and uploaded to Supabase Storage: ${j.filename}`)
        fetchData()
      } else {
        throw new Error(j.error)
      }
    } catch (err: any) {
      toast.error(err.message || 'Backup execution failed')
    } finally {
      setBackingUp(false)
    }
  }

  async function handleSaveSettings() {
    setSavingSettings(true)
    try {
      const res = await fetch('/api/admin/backup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoBackup })
      })
      const j = await res.json()
      if (j.ok) {
        toast.success('Backup settings updated!')
        fetchData()
      } else {
        throw new Error(j.error)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings')
    } finally {
      setSavingSettings(false)
    }
  }

  async function handleDelete(filename: string) {
    if (!confirm('Are you sure you want to permanently delete this backup file?')) return
    try {
      const res = await fetch(`/api/admin/backup?filename=${filename}`, { method: 'DELETE' })
      const j = await res.json()
      if (j.ok) {
        toast.success('Backup file removed successfully')
        fetchData()
      } else {
        throw new Error(j.error)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete backup file')
    }
  }

  async function handleRestore(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!confirm('WARNING: Restoring will overwrite existing database records and customizations! Proceed?')) {
      e.target.value = ''
      return
    }

    setRestoring(true)
    toast.info('Restoring database schema and customizations. Please wait...')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/backup/restore', {
        method: 'POST',
        body: formData
      })
      const j = await res.json()
      if (j.ok) {
        toast.success('🎉 Site database & layouts restored successfully!')
        e.target.value = ''
        fetchData()
      } else {
        throw new Error(j.error)
      }
    } catch (err: any) {
      toast.error(err.message || 'Database restoration failed')
    } finally {
      setRestoring(false)
    }
  }

  function formatBytes(bytes: number) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Site Backup & System Restore" 
        description="Configure target storage destinations (Supabase Cloud Storage) and execute database/customization backups."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Backup' }]}
        action={{ 
          label: backingUp ? 'Executing Backup...' : 'Create Backup Now', 
          icon: backingUp ? Loader2 : DatabaseBackup,
          onClick: handleBackup,
          disabled: backingUp || restoring
        }} 
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Settings & Destination Panel */}
          <div className="lg:col-span-2 space-y-6">
            
            <Card className="rounded-3xl border shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <CloudLightning className="h-5 w-5 text-orange-500" /> Cloud Storage Settings
                </CardTitle>
                <CardDescription className="text-xs">Your backups are automatically stored securely in your Supabase 'backups' bucket.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-backup" className="text-xs font-bold text-slate-700">Scheduled Automatic Backup</Label>
                    <p className="text-[10px] text-slate-400">Automatically trigger backup cron routines daily at 02:00 IST.</p>
                  </div>
                  <Switch 
                    id="auto-backup" 
                    checked={autoBackup}
                    onCheckedChange={setAutoBackup}
                  />
                </div>

                <div className="pt-2">
                  <Button 
                    onClick={handleSaveSettings} 
                    disabled={savingSettings}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs py-5"
                  >
                    {savingSettings ? 'Saving Settings...' : 'Save Storage Destinations'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <RotateCcw className="h-5 w-5 text-red-500" /> Database & Theme Restore
                </CardTitle>
                <CardDescription className="text-xs">Restore database schema, tables, and theme settings from a previously downloaded ZIP backup.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 text-xs text-red-800 space-y-1">
                  <p className="font-bold flex items-center gap-1">⚠️ संभल कर कदम उठाएं (Caution Required)</p>
                  <p className="leading-relaxed">डेटा रिस्टोर करने पर वर्तमान वेबसाइट के सारे आर्डर, कस्टमर, पूजन बुकिंग और सेटिंग्स डिलीट होकर पुराने बैकअप फाइल के डेटा से बदल जाएंगे। यह क्रिया वापस नहीं ली जा सकती।</p>
                </div>

                <div className="flex items-center gap-3">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleRestore} 
                    accept=".zip" 
                    className="hidden" 
                  />
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={backingUp || restoring}
                    variant="outline" 
                    className="border-red-200 bg-red-50/10 hover:bg-red-50 text-red-700 font-bold rounded-xl py-5 flex-1"
                  >
                    {restoring ? (
                      <span className="flex items-center gap-1.5"><Loader2 className="h-4 w-4 animate-spin" /> Restoring Site Data...</span>
                    ) : (
                      <span className="flex items-center gap-1.5"><RotateCcw className="h-4 w-4" /> Upload & Restore Backup (.zip)</span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Backup History Log */}
          <div className="space-y-6">
            <Card className="rounded-3xl border shadow-sm h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <FileArchive className="h-5 w-5 text-orange-500" /> Cloud Backups
                  </CardTitle>
                  <CardDescription className="text-[10px]">Historical archives found in Supabase.</CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-200">
                  {history.length} Logs
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                {history.length === 0 ? (
                  <div className="py-16 text-center space-y-2">
                    <DatabaseBackup className="h-10 w-10 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-400 font-medium">No backups generated yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                    {history.map((h) => (
                      <div key={h.filename} className="p-4 space-y-2 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5 max-w-[70%]">
                            <p className="text-xs font-bold text-slate-700 truncate" title={h.filename}>
                              {h.filename}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {new Date(h.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                            </p>
                          </div>
                          <Badge className="bg-orange-500/10 border-none text-orange-700 text-[10px] shrink-0">
                            {formatBytes(h.size)}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-1.5 pt-1">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 rounded-lg text-[10px] px-2 text-slate-600 hover:text-slate-900 border-slate-200 bg-white"
                            asChild
                          >
                            <a href={`/api/admin/backup/download?filename=${h.filename}`} download>
                              <Download className="h-3 w-3 mr-1 text-slate-500" /> Download
                            </a>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDelete(h.filename)}
                            className="h-8 rounded-lg text-[10px] px-2 text-red-600 hover:text-red-700 border-red-100 bg-red-50/10 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3 mr-1 text-red-400" /> Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      )}
    </div>
  )
}
