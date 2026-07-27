'use client'

import { useEffect, useState, Suspense } from 'react'
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation'
import { PageHeader } from '@/components/admin/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Copy, Trash2, Upload, Link as LinkIcon, Image as ImageIcon, Flame, Calendar, Star, Eye, Edit2 } from 'lucide-react'
import { compressImage } from '@/lib/utils'
function MediaLibraryManager() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get('folder') || 'all'

  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  // Form states
  const [filename, setFilename] = useState('')
  const [folderTag, setFolderTag] = useState('General')

  async function loadItems() {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/media?folder=${activeTab}`)
      const data = await res.json()
      if (data.ok) {
        setItems(data.data || [])
      }
    } catch {
      toast.error('Failed to load media library items')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [activeTab])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    let fileToUpload = file
    setUploading(true)

    // Auto compress image
    fileToUpload = await compressImage(file)

    const formData = new FormData()
    formData.append('file', fileToUpload)

    try {
      // 1. Upload to /api/upload
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      let uploadData: any
      const contentType = uploadRes.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        uploadData = await uploadRes.json()
      } else {
        const text = await uploadRes.text()
        if (uploadRes.status === 413 || text.toLowerCase().includes('entity too large')) {
          throw new Error('File size is too large! Please upload images under 4.5MB.')
        }
        throw new Error('Server upload failed')
      }

      if (!uploadData.ok) throw new Error(uploadData.error || 'Upload failed')

      // 2. Save in media library database with Tag/Folder category
      const saveRes = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: uploadData.url,
          filename: filename || file.name,
          size: file.size,
          mimeType: file.type,
          type: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
          folder: folderTag,
        }),
      })
      const saveData = await saveRes.json()
      if (!saveData.ok) throw new Error(saveData.error || 'Failed to save record')

      toast.success('Media successfully uploaded and tagged!')
      setFilename('')
      loadItems()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to complete upload')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this media?')) return
    try {
      const res = await fetch(`/api/admin/media?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Media deleted successfully')
        loadItems()
      } else {
        toast.error(data.error || 'Failed to delete')
      }
    } catch {
      toast.error('Network error deleting media')
    }
  }

  async function handleEdit(media: any) {
    const newName = prompt('Enter new filename:', media.filename || '')
    if (newName === null) return

    const newFolder = prompt('Enter new category (Past Puja, Festival Event, Customer Review, General):', media.folder || 'General')
    if (newFolder === null) return

    try {
      const res = await fetch('/api/admin/media', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: media.id, filename: newName, folder: newFolder })
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Media updated successfully')
        loadItems()
      } else {
        toast.error(data.error || 'Update failed')
      }
    } catch {
      toast.error('Network error updating media')
    }
  }

  function copyToClipboard(url: string) {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`
    navigator.clipboard.writeText(fullUrl)
    toast.success('Media path URL copied to clipboard! You can paste this in any Puja/Blog Cover Image.')
  }

  const changeTab = (val: string) => {
    router.push(`/admin/media?folder=${val}`)
  }

  const tabs = [
    { label: 'All Assets', value: 'all' },
    { label: 'Past Pujas (बीती हुई पूजा)', value: 'Past Puja' },
    { label: 'Festival Events (त्योहार)', value: 'Festival Event' },
    { label: 'Customer Reviews (लाइव रिव्यु)', value: 'Customer Review' },
    { label: 'General / Others', value: 'General' }
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sacred Media Library"
        description="Upload photos/videos of past pujas, customer live reviews, and festival event cover photos to display across the site."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Media' }]}
      />

      {/* Uploader panel */}
      <Card className="rounded-3xl border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-800">Add New Media Asset</CardTitle>
          <CardDescription className="text-xs">Specify a display category so it syncs with sitemaps and sections.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3 items-end">
            <div className="space-y-2">
              <Label htmlFor="mediaName">Asset Name (Optional)</Label>
              <Input
                id="mediaName"
                placeholder="e.g. Sawan Somwar Pooja Prasadam"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Display Category / Website Tag</Label>
              <Select value={folderTag} onValueChange={setFolderTag}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Past Puja">Past Puja (बीती हुई पूजा)</SelectItem>
                  <SelectItem value="Festival Event">Festival Event (त्योहार इवेंट)</SelectItem>
                  <SelectItem value="Customer Review">Customer Review (श्रद्धालु लाइव रिव्यु)</SelectItem>
                  <SelectItem value="General">General / Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-orange-600 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-700 transition-all gap-2 w-full h-10">
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {uploading ? 'Uploading…' : 'Upload Asset'}
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b pb-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => changeTab(t.value)}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all shrink-0 ${activeTab === t.value ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : items.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
          <h3 className="font-semibold text-sm">No Assets Found in Category</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Upload images or videos under this category to display them live.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {items.map((media) => (
            <Card key={media.id} className="overflow-hidden border group relative rounded-2xl shadow-sm">
              <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                <img src={media.url} alt={media.filename} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-2 left-2">
                  <Badge className="bg-orange-500 text-white font-bold text-[9px] hover:bg-orange-600">
                    {media.folder}
                  </Badge>
                </div>
              </div>
              <div className="p-3 bg-white space-y-2">
                <div className="flex flex-col">
                  <span className="font-bold text-xs truncate text-slate-800" title={media.filename}>{media.filename || 'Unnamed Asset'}</span>
                  <span className="text-[9px] text-muted-foreground">{(media.size / 1024).toFixed(1)} KB</span>
                </div>
                <div className="flex items-center gap-1.5 pt-1 border-t">
                  <Button size="sm" variant="outline" className="flex-1 h-7 text-[10px] gap-1 rounded-lg" onClick={() => copyToClipboard(media.url)}>
                    <Copy className="h-3 w-3" /> Copy Path
                  </Button>
                  <Button size="icon" variant="secondary" className="h-7 w-7 rounded-lg shrink-0" onClick={() => handleEdit(media)} title="Edit Asset">
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="destructive" className="h-7 w-7 rounded-lg shrink-0" onClick={() => handleDelete(media.id)} title="Delete Asset">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function MediaLibraryPage() {
  return (
    <Suspense fallback={
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    }>
      <MediaLibraryManager />
    </Suspense>
  )
}
