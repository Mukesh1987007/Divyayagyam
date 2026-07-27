'use client'

import { useEffect, useState, Suspense } from 'react'
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation'
import { PageHeader } from '@/components/admin/page-header'
import { KpiCard } from '@/components/admin/kpi-card'
import { DataTableShell } from '@/components/admin/data-table-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2, Sparkles, Upload, Video, Image as ImageIcon, Edit2 } from 'lucide-react'
import imageCompression from 'browser-image-compression';

function BhaktiSevaManager() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get('tab') || 'all'

  const [offerings, setOfferings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  // Form states
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [image, setImage] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isActive, setIsActive] = useState(true)

  async function loadOfferings() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/bhaktiseva')
      const data = await res.json()
      if (data.ok) {
        setOfferings(data.data || [])
      }
    } catch {
      toast.error('Failed to load offerings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOfferings()
  }, [])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    
    try {
      // Compress image client-side to prevent Vercel 413 (Payload Too Large) limit
      let fileToUpload = file;
      if (file.type.startsWith('image/')) {
        toast.info('Compressing image...');
        const { compressImage } = await import('@/lib/utils');
        fileToUpload = await compressImage(file, { maxSizeMB: 0.8 });
      }

      if (fileToUpload.size > 4 * 1024 * 1024) {
        setUploading(false);
        toast.error('Image is still too large after compression (Max 4MB). Please select a smaller photo.');
        return;
      }

      const formData = new FormData()
      formData.append('file', fileToUpload)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      let data;
      try {
        data = await res.json()
      } catch (parseErr) {
        throw new Error(res.status === 413 ? 'Image size is too large (Max 4.5MB allowed)' : `Server Error: ${res.statusText}`)
      }

      if (data.ok) {
        setImage(data.url)
        toast.success('BhaktiSeva image uploaded!')
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch (err: any) {
      toast.error('Upload Error: ' + (err.message || 'Network error'))
    } finally {
      setUploading(false)
    }
  }

  function startEdit(offering: any) {
    setEditId(offering.id)
    setName(offering.name)
    setDescription(offering.description || '')
    setPrice(offering.price ? String(offering.price) : '')
    setImage(offering.image || '')
    setVideoUrl(offering.videoUrl || '')
    setIsVideoEnabled(offering.isVideoEnabled !== false)
    setIsActive(offering.isActive !== false)
    setShowAddForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setEditId(null)
    setName('')
    setDescription('')
    setPrice('')
    setImage('')
    setVideoUrl('')
    setIsVideoEnabled(true)
    setIsActive(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !price) return

    setSaving(true)
    try {
      const method = editId ? 'PUT' : 'POST'
      const url = editId ? `/api/admin/bhaktiseva?id=${editId}` : '/api/admin/bhaktiseva'
      const payload: any = {
        name,
        description,
        price: Number(price),
        image,
        videoUrl,
        isVideoEnabled,
        isActive,
      }
      if (editId) payload.id = editId

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const text = await res.text()
        toast.error(`Server Error: ${res.status} - ${text.substring(0, 50)}`)
        return
      }
      const data = await res.json()
      if (data.ok) {
        toast.success(editId ? 'Offering updated successfully!' : 'Offering added successfully!')
        setShowAddForm(false)
        resetForm()
        loadOfferings()
      } else {
        toast.error(data.error || 'Failed to save offering')
      }
    } catch (err: any) {
      toast.error('Network error saving offering: ' + (err.message || ''))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this offering?')) return
    try {
      const res = await fetch(`/api/admin/bhaktiseva?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Offering deleted successfully')
        loadOfferings()
      } else {
        toast.error(data.error || 'Failed to delete')
      }
    } catch {
      toast.error('Network error deleting offering')
    }
  }

  // Filter offerings based on active tab keyword matches
  const filteredOfferings = offerings.filter((o) => {
    const text = `${o.name} ${o.description || ''}`.toLowerCase()
    if (activeTab === 'flowers') {
      return text.includes('flower') || text.includes('garland') || text.includes('पुष्प') || text.includes('फूल')
    }
    if (activeTab === 'prasad') {
      return text.includes('prasad') || text.includes('sweet') || text.includes('प्रसाद')
    }
    if (activeTab === 'bhog') {
      return text.includes('bhog') || text.includes('भोग') || text.includes('food')
    }
    if (activeTab === 'deep-daan') {
      return text.includes('deep') || text.includes('diya') || text.includes('lamp') || text.includes('दीपक') || text.includes('तेल')
    }
    if (activeTab === 'gau-seva') {
      return text.includes('cow') || text.includes('gau') || text.includes('गौ') || text.includes('चारा') || text.includes('feed')
    }
    return true
  })

  const tabs = [
    { label: 'All Offerings', value: 'all' },
    { label: 'Flowers (फूल चढ़ावा)', value: 'flowers' },
    { label: 'Prasad (प्रसाद सेवा)', value: 'prasad' },
    { label: 'Bhog (भोग अर्पण)', value: 'bhog' },
    { label: 'Deep Daan (दीप दान)', value: 'deep-daan' },
    { label: 'Gau Seva (गौ सेवा)', value: 'gau-seva' }
  ]

  const changeTab = (val: string) => {
    router.push(`/admin/bhaktiseva?tab=${val}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="BhaktiSeva Seva Management"
        description="Offer flowers, bhog, deep daan, or feed cows. Create and manage sacred offerings."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'BhaktiSeva' }]}
        action={{
          label: showAddForm ? 'Cancel' : 'Add Offering',
          icon: Plus,
          onClick: () => {
            if (showAddForm) resetForm()
            setShowAddForm(!showAddForm)
          },
        }}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard title="Total Offerings" value={offerings.length.toString()} icon={Sparkles} />
        <KpiCard title="Active Sevas" value={offerings.filter(o => o.isActive).length.toString()} iconClass="text-green-600" />
        <KpiCard title="Inactive Sevas" value={offerings.filter(o => !o.isActive).length.toString()} iconClass="text-muted" />
      </div>

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

      {showAddForm && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> {editId ? 'Edit BhaktiSeva Seva' : 'Create New BhaktiSeva Seva'}
            </CardTitle>
            <CardDescription>Setup offering details, custom prices, and supporting images or youtube streams.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="offName">Offering / Seva Name *</Label>
                <Input
                  id="offName"
                  placeholder="e.g. Gau Seva (Feed 11 Cows)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="offPrice">Price (₹) *</Label>
                <Input
                  id="offPrice"
                  type="number"
                  placeholder="e.g. 501"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="offDesc">Description</Label>
                <Textarea
                  id="offDesc"
                  placeholder="Provide an overview of the blessings, location and ritual..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="offVid">Supporting YouTube Video URL (Optional)</Label>
                <Input
                  id="offVid"
                  placeholder="e.g. process.env.NEXT_PUBLIC_URL_4560 || ''"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Offering Cover Image</Label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-24 rounded border bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                    {image ? (
                      <img src={image} alt="Cover Preview" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground opacity-50" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="cursor-pointer inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 text-sm font-medium gap-2">
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {uploading ? 'Uploading…' : 'Upload Image'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:col-span-2 p-3 bg-muted/20 rounded-md">
                <div className="flex items-center justify-between">
                  <Label>Active Status</Label>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Enable Video</Label>
                  <Switch checked={isVideoEnabled} onCheckedChange={setIsVideoEnabled} />
                </div>
              </div>

              <div className="sm:col-span-2 pt-2">
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editId ? 'Update Offering' : 'Add Offering'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <DataTableShell
          columns={[
            {
              key: 'image',
              label: 'Image',
              render: (r) => (
                <div className="h-10 w-16 bg-slate-100 rounded border overflow-hidden">
                  {r.image ? (
                    <img src={r.image} alt={r.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-slate-200" />
                  )}
                </div>
              ),
            },
            { key: 'name', label: 'Offering Seva' },
            {
              key: 'price',
              label: 'Price',
              render: (r) => <span>₹{Number(r.price)}</span>,
            },
            {
              key: 'videoUrl',
              label: 'Video Linked',
              render: (r) => (
                <Badge variant={r.videoUrl ? 'default' : 'secondary'}>
                  {r.videoUrl ? '📹 Yes' : 'No'}
                </Badge>
              ),
            },
            {
              key: 'isActive',
              label: 'Status',
              render: (r) => (
                <Badge variant={r.isActive ? 'success' : 'secondary'}>
                  {r.isActive ? 'Active' : 'Disabled'}
                </Badge>
              ),
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (r) => (
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-blue-600"
                    onClick={() => startEdit(r)}
                    title="Edit Seva"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={() => handleDelete(r.id)}
                    title="Delete Seva"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ),
            },
          ]}
          rows={filteredOfferings}
        />
      )}
    </div>
  )
}

export default function BhaktiSevaPage() {
  return (
    <Suspense fallback={
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    }>
      <BhaktiSevaManager />
    </Suspense>
  )
}
