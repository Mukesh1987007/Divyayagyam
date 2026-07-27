'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation'
import { PageHeader } from '@/components/admin/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Loader2, Upload, ImageIcon } from 'lucide-react'

function TempleFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loadingTemple, setLoadingTemple] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [deity, setDeity] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pincode, setPincode] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)

  // Fetch details if edit mode
  useEffect(() => {
    if (!editId) return
    const fetchTemple = async () => {
      try {
        setLoadingTemple(true)
        const res = await fetch('/api/admin/temples')
        const data = await res.json()
        if (data.ok) {
          const t = (data.data || []).find((x: any) => x.id === editId)
          if (t) {
            setName(t.name || '')
            setSlug(t.slug || '')
            setDeity(t.deity || '')
            setDescription(t.description || '')
            setAddress(t.address || '')
            setCity(t.city || '')
            setState(t.state || '')
            setPincode(t.pincode || '')
            setCoverImage(t.coverImage || '')
            setIsFeatured(!!t.isFeatured)
            setIsActive(!!t.isActive)
            setIsVideoEnabled(t.isVideoEnabled !== undefined ? !!t.isVideoEnabled : true)
          }
        }
      } catch (err) {
// console.error(err) (removed for production)
        toast.error('Failed to load temple details')
      } finally {
        setLoadingTemple(false)
      }
    }
    fetchTemple()
  }, [editId])

  // Auto slugify name
  useEffect(() => {
    if (!editId) {
      setSlug(name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))
    }
  }, [name, editId])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.ok) {
        setCoverImage(data.url)
        toast.success('Temple cover image uploaded!')
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch {
      toast.error('Network error uploading cover image')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name) return

    setSaving(true)
    try {
      const res = await fetch('/api/admin/temples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editId || undefined,
          name,
          slug,
          deity,
          description,
          address,
          city,
          state,
          pincode,
          coverImage,
          isFeatured,
          isActive,
          isVideoEnabled,
        }),
      })
      const data = await res.json()
      if (data.ok) {
        toast.success(editId ? 'Temple updated successfully!' : 'Temple created successfully!')
        router.push('/admin/temples')
      } else {
        toast.error(data.error || 'Failed to save temple')
      }
    } catch {
      toast.error('Network error saving temple')
    } finally {
      setSaving(false)
    }
  }

  if (loadingTemple) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={editId ? 'Edit Temple' : 'Add Temple'}
        description={editId ? 'Edit temple entry location, timings and media.' : 'Create a new temple entry with location, timings and media.'}
        breadcrumbs={[{ label: 'Temples', href: '/admin/temples' }, { label: editId ? 'Edit' : 'New' }]}
      />
      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tName">Temple Name *</Label>
                <Input
                  id="tName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kashi Vishwanath"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tSlug">Slug</Label>
                <Input
                  id="tSlug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="kashi-vishwanath"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tDeity">Presiding Deity</Label>
                <Input
                  id="tDeity"
                  value={deity}
                  onChange={(e) => setDeity(e.target.value)}
                  placeholder="e.g. Lord Shiva"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tDesc">Description</Label>
                <Textarea
                  id="tDesc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="About the temple, history & significance…"
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Location</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="tAddr">Address</Label>
                <Input id="tAddr" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tCity">City</Label>
                <Input id="tCity" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tState">State</Label>
                <Input id="tState" value={state} onChange={(e) => setState(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tPin">Pincode</Label>
                <Input id="tPin" value={pincode} onChange={(e) => setPincode(e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Featured</Label>
                <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Enable Videos</Label>
                <Switch checked={isVideoEnabled} onCheckedChange={setIsVideoEnabled} />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Temple
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cover Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-[16/9] rounded border bg-slate-100 flex items-center justify-center overflow-hidden">
                {coverImage ? (
                  <img src={coverImage} alt="Cover Preview" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-10 w-10 text-muted-foreground opacity-50" />
                )}
              </div>
              <label className="cursor-pointer inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 text-sm font-medium gap-2 w-full">
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {uploading ? 'Uploading…' : 'Upload Cover'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
              <Input type="text" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="Or paste image URL (e.g. Google Drive)" className="mt-2 text-xs" />
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}

export default function NewTemplePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
      </div>
    }>
      <TempleFormContent />
    </Suspense>
  )
}
