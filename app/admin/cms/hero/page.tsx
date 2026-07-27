'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image';
import { PageHeader } from '@/components/admin/page-header'
import { DataTableShell } from '@/components/admin/data-table-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2, Edit, Sliders, Upload, Image as ImageIcon, Link as LinkIcon } from 'lucide-react'
import { convertGoogleDriveUrl } from '@/lib/utils'

export default function HeroSliderPage() {
  const [slides, setSlides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  
  // Edit mode state
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form states
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [image, setImage] = useState('')
  const [driveUrl, setDriveUrl] = useState('')
  const [ctaText, setCtaText] = useState('')
  const [ctaUrl, setCtaUrl] = useState('')
  const [order, setOrder] = useState('0')

  async function loadSlides() {
    try {
      const res = await fetch('/api/admin/hero')
      const data = await res.json()
      if (data.ok) {
        setSlides(data.data || [])
      }
    } catch {
      toast.error('Failed to load hero slides')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSlides()
  }, [])

  function handleDriveAdd() {
    if (!driveUrl) return
    const converted = convertGoogleDriveUrl(driveUrl)
    setImage(converted)
    setDriveUrl('')
    toast.success('Google Drive image linked!')
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // Compress image client-side
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
        throw new Error(res.status === 413 ? 'Image size is too large' : `Server Error: ${res.statusText}`)
      }

      if (data.ok) {
        setImage(data.url)
        toast.success('Slide banner image uploaded!')
      } else {
        toast.error(data.error || 'Upload failed. Tip: Use Google Drive Link for large files.')
      }
    } catch (err: any) {
      toast.error('Upload Error: ' + (err.message || 'Network error'))
    } finally {
      setUploading(false)
    }
  }

  function handleEditClick(slide: any) {
    setEditingId(slide.id)
    setTitle(slide.title)
    setSubtitle(slide.subtitle || '')
    setImage(slide.image)
    setCtaText(slide.ctaText || '')
    setCtaUrl(slide.ctaUrl || '')
    setOrder(slide.order.toString())
    setShowAddForm(true)
  }

  function resetForm() {
    setShowAddForm(false)
    setEditingId(null)
    setTitle('')
    setSubtitle('')
    setImage('')
    setDriveUrl('')
    setCtaText('')
    setCtaUrl('')
    setOrder('0')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !image) {
      toast.error('Title and Image are required')
      return
    }

    setSaving(true)
    const payload = {
      id: editingId,
      title,
      subtitle,
      image,
      ctaText,
      ctaUrl,
      order: Number(order),
    }

    try {
      const url = editingId ? `/api/admin/hero?id=${editingId}` : '/api/admin/hero'
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.ok) {
        toast.success(`Slide ${editingId ? 'updated' : 'created'} successfully!`)
        resetForm()
        loadSlides()
      } else {
        toast.error(data.error || 'Failed to save slide')
      }
    } catch {
      toast.error('Network error saving slide')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this slide?')) return
    try {
      const res = await fetch(`/api/admin/hero?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Slide deleted successfully')
        loadSlides()
      } else {
        toast.error(data.error || 'Failed to delete slide')
      }
    } catch {
      toast.error('Network error deleting slide')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Homepage Hero Slider Banners"
        description="Configure rotating hero banners, background slides and call-to-action buttons for the website entrance page."
        breadcrumbs={[{ label: 'CMS', href: '/admin/cms' }, { label: 'Hero Slider' }]}
        action={{
          label: showAddForm ? 'Cancel' : 'Add Slide',
          icon: Plus,
          onClick: () => {
            if (showAddForm) resetForm()
            else setShowAddForm(true)
          },
        }}
      />

      {showAddForm && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sliders className="h-5 w-5 text-primary" /> {editingId ? 'Edit Slide' : 'Create New Slide'}
            </CardTitle>
            <CardDescription>Setup full-width banner slides with customized links.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Main Title / Headline</Label>
                <Input
                  id="title"
                  placeholder="e.g. Book Sacred Somwar Somnath Pujas Online"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle / Supporting Text</Label>
                <Input
                  id="subtitle"
                  placeholder="e.g. Live streamed with deep daan and prasad delivery."
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ctaText">Button text (CTA)</Label>
                <Input
                  id="ctaText"
                  placeholder="e.g. Explore Pujas"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ctaUrl">Redirect link (URL)</Label>
                <Input
                  id="ctaUrl"
                  placeholder="e.g. /pujas"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Display Order Index</Label>
                <Input
                  id="order"
                  type="number"
                  placeholder="e.g. 1"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Slide Banner Background Image</Label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-36 rounded border bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                    {image ? (
                      <img src={image} alt="Slide Preview" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground opacity-50" />
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Paste Google Drive Link here..." 
                        value={driveUrl}
                        onChange={e => setDriveUrl(e.target.value)}
                      />
                      <Button type="button" variant="secondary" onClick={handleDriveAdd} disabled={!driveUrl}>
                        <LinkIcon className="h-4 w-4 mr-2" /> Apply Link
                      </Button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                      <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or Local Upload</span></div>
                    </div>
                    <label className="cursor-pointer inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 text-sm font-medium gap-2 w-full">
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {uploading ? 'Uploading…' : 'Upload Banner Image'}
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

              <div className="sm:col-span-2 pt-2 flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? 'Save Changes' : 'Create Slide Banner'}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel Edit
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTableShell
          columns={[
            {
              key: 'image',
              label: 'Slide Preview',
              render: (r) => (
                <div className="h-10 w-20 rounded bg-slate-100 border overflow-hidden">
                  {r.image ? (
                    <img src={r.image} alt={r.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-slate-200" />
                  )}
                </div>
              ),
            },
            { key: 'title', label: 'Main Headline' },
            { key: 'subtitle', label: 'Subtitle' },
            { key: 'order', label: 'Display Order' },
            {
              key: 'isActive',
              label: 'Status',
              render: (r) => (
                <Badge
                  variant={r.isActive ? 'success' : 'secondary'}
                  className={r.isActive ? 'bg-green-100 text-green-800' : ''}
                >
                  {r.isActive ? 'Active' : 'Draft'}
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
                    variant="outline"
                    className="h-8 w-8 text-blue-600"
                    onClick={() => handleEditClick(r)}
                    title="Edit Slide"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={() => handleDelete(r.id)}
                    title="Delete Slide"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ),
            },
          ]}
          rows={slides}
        />
      )}
    </div>
  )
}

