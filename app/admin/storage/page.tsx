'use client'

import { useEffect, useState, useRef } from 'react'
import { PageHeader } from '@/components/admin/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { HardDrive, ImageIcon, FileText, Video, UploadCloud, Trash2, Loader2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Image from 'next/image'

export default function StoragePage() {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function loadFiles() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/storage')
      const json = await res.json()
      if (json.ok) {
        setFiles(json.data)
      } else {
        toast.error(json.error || 'Failed to load storage files')
      }
    } catch {
      toast.error('Network error loading storage')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFiles()
  }, [])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const { compressImage } = await import('@/lib/utils')
    const compressedFile = await compressImage(file)
    const formData = new FormData()
    formData.append('file', compressedFile)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('File uploaded successfully!')
        loadFiles()
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch {
      toast.error('Network error during upload')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('URL Copied to clipboard')
  }

  const totalBytes = files.reduce((acc, f) => acc + (f.size || 0), 0)
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2)
  const percentUsed = (totalBytes / (1024 * 1024 * 1024)) * 100 // Out of 1GB max for free tier
  const imageCount = files.length // Assuming all are images for now as per bucket rules

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Storage & File Manager" 
        description="Manage media, documents, and other assets securely on Supabase."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Storage' }]} 
      />
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><HardDrive className="h-4 w-4" /> Capacity Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-1">
              <span>Used</span>
              <span className="text-muted-foreground">{totalMB} MB / 1 GB</span>
            </div>
            <Progress value={Math.min(percentUsed, 100)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UploadCloud className="h-4 w-4" /> Quick Upload</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload} 
              className="hidden" 
              accept="image/*,video/*,.pdf" 
            />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full">
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              {uploading ? 'Uploading...' : 'Upload New File'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><ImageIcon className="h-4 w-4 text-blue-500" /> Files Count</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{imageCount}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><HardDrive className="h-4 w-4 text-orange-500" /> Total Size</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{totalMB} MB</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>File Manager</CardTitle>
          <CardDescription>Live gallery of all media hosted on Supabase.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-orange-600" /></div>
          ) : files.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No files uploaded yet.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {files.map((file) => (
                <div key={file.id || file.name} className="relative group border rounded-lg overflow-hidden bg-muted flex flex-col items-center justify-center p-2 text-center aspect-square">
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/80 p-1 rounded-md shadow">
                    <button onClick={() => copyUrl(file.url)} className="p-1 hover:text-blue-600" title="Copy URL"><Copy className="h-4 w-4" /></button>
                  </div>
                  {file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={file.url} alt={file.name} className="object-cover h-24 w-24 rounded-md mb-2" />
                  ) : (
                    <FileText className="h-12 w-12 text-slate-400 mb-2" />
                  )}
                  <p className="text-[10px] w-full truncate px-1" title={file.name}>{file.name}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
