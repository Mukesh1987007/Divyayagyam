'use client'
import React from 'react';

import { useEffect, useState } from 'react'
import Image from 'next/image';
import { PageHeader } from '@/components/admin/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2, Cloud, Upload } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { convertGoogleDriveUrl, compressImage } from '@/lib/utils'

interface ItemRef {
  id: string
  name: string
}

function NewPujaPage_Content() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')

  const [categories, setCategories] = useState<ItemRef[]>([])
  const [loadingRefs, setLoadingRefs] = useState(true)

  // Form states
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [location, setLocation] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [description, setDescription] = useState('')
  const [benefits, setBenefits] = useState('')
  const [price, setPrice] = useState('1100')
  const [vipPrice, setVipPrice] = useState('5100')
  const [duration, setDuration] = useState('60')
  const [maxMembers, setMaxMembers] = useState('5')
  const [isVip, setIsVip] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)
  const [status, setStatus] = useState('DRAFT')
  const [publishedAt, setPublishedAt] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [seoKeywords, setSeoKeywords] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [packages, setPackages] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [loadingPuja, setLoadingPuja] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [driveUrl, setDriveUrl] = useState('')
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [uploadingGallery, setUploadingGallery] = useState(false)

  // Fetch references
  useEffect(() => {
    const fetchRefs = async () => {
      try {
        setLoadingRefs(true)
        const [catRes] = await Promise.all([
          fetch('/api/admin/puja-categories')
        ])

        const [catData] = await Promise.all([
          catRes.json()
        ])

        if (catData.ok) setCategories(catData.data || [])
      } catch {
        toast.error('Failed to load categories references')
      } finally {
        setLoadingRefs(false)
      }
    }

    fetchRefs()
  }, [])

  // Auto slugify name
  useEffect(() => {
    if (!editId) {
      setSlug(name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))
    }
  }, [name, editId])

  // Fetch details if edit mode
  useEffect(() => {
    if (!editId) return
    const fetchPuja = async () => {
      try {
        setLoadingPuja(true)
        const res = await fetch(`/api/admin/pujas?id=${editId}`)
        const data = await res.json()
        if (data.ok && data.puja) {
          const p = data.puja
          setName(p.name || '')
          setSlug(p.slug || '')
          setCategoryId(p.categoryId || '')
          setLocation(p.location || '')
          setShortDescription(p.shortDescription || '')
          setDescription(p.description || '')
          setBenefits(p.benefits || '')
          setPrice(String(p.price || '0'))
          setVipPrice(String(p.vipPrice || ''))
          setDuration(String(p.duration || '60'))
          setMaxMembers(String(p.maxMembers || '1'))
          setIsVip(!!p.isVip)
          setIsOnline(!!p.isOnline)
          setIsFeatured(!!p.isFeatured)
          setStatus(p.status || 'DRAFT')
          setPublishedAt(p.publishedAt ? new Date(p.publishedAt).toISOString().slice(0, 16) : '')
          setSeoTitle(p.seoTitle || '')
          setSeoDescription(p.seoDescription || '')
          setSeoKeywords(p.seoKeywords || '')
          setCoverImage(p.coverImage || '')
          if (p.images && Array.isArray(p.images)) {
            setGalleryImages(p.images.map((img: any) => img.url))
          }
          setPackages(p.packages || [])
        } else {
          toast.error('Failed to find puja details')
        }
      } catch {
        toast.error('Error fetching puja details')
      } finally {
        setLoadingPuja(false)
      }
    }
    fetchPuja()
  }, [editId])

  // Handle image upload fallback
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    
    // Auto compress image
    file = await compressImage(file)
    
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (data.ok && data.url) {
        setCoverImage(data.url)
        toast.success('Puja file uploaded successfully!')
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch {
      toast.error('Network error uploading file')
    } finally {
      setUploading(false)
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingGallery(true)
    const newUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = await compressImage(files[i])
      const formData = new FormData()
      formData.append('file', file)
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        const data = await res.json()
        if (data.ok && data.url) {
          newUrls.push(data.url)
        }
      } catch {
        toast.error(`Failed to upload ${file.name}`)
      }
    }

    if (newUrls.length > 0) {
      setGalleryImages(prev => [...prev, ...newUrls])
      toast.success(`${newUrls.length} image(s) added to gallery!`)
    }
    setUploadingGallery(false)
    e.target.value = ''
  }

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index))
  }

  function handleDriveAdd() {
    if (!driveUrl) return
    const convertedUrl = convertGoogleDriveUrl(driveUrl)
    setCoverImage(convertedUrl)
    setDriveUrl('')
    toast.success('Drive link applied as cover!')
  }

  const handleAddPackage = () => {
    setPackages([...packages, { id: Date.now().toString(), name: '', price: '', description: '' }])
  }

  const handleRemovePackage = (index: number) => {
    setPackages(packages.filter((_, i) => i !== index))
  }

  const handlePackageChange = (index: number, field: string, value: string) => {
    const newPkgs = [...packages]
    newPkgs[index] = { ...newPkgs[index], [field]: value }
    setPackages(newPkgs)
  }

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Puja Name is required')
      return
    }
    if (!categoryId) {
      toast.error('Please select a Category')
      return
    }

    try {
      setSaving(true)
      const payload = {
        id: editId || undefined,
        name,
        slug,
        categoryId,
        location,
        shortDescription,
        description,
        benefits,
        price: Number(price) || 0,
        vipPrice: vipPrice ? Number(vipPrice) : null,
        duration: Number(duration) || 60,
        maxMembers: Number(maxMembers) || 1,
        isVip,
        isOnline,
        isFeatured,
        status,
        publishedAt: status === 'PUBLISHED' && publishedAt ? new Date(publishedAt).toISOString() : null,
        seoTitle,
        seoDescription,
        seoKeywords,
        coverImage,
        packages,
        images: galleryImages
      }

      const res = await fetch('/api/admin/pujas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (data.ok) {
        toast.success(editId ? 'Puja updated successfully!' : 'Puja created successfully!')
        router.push('/admin/pujas')
      } else {
        toast.error(data.error || 'Failed to save puja')
      }
    } catch {
      toast.error('Network error saving puja')
    } finally {
      setSaving(false)
    }
  }

  const isVideoFile = (url: string) => {
    if (!url) return false
    return (
      url.endsWith('.mp4') ||
      url.endsWith('.webm') ||
      url.endsWith('.ogg') ||
      url.startsWith('data:video/')
    )
  }

  if (loadingPuja) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={editId ? 'Edit Puja' : 'Add Puja'}
        description="Create or edit a puja with pricing, samagri, and booking configurations."
        breadcrumbs={[{ label: 'Pujas', href: '/admin/pujas' }, { label: editId ? 'Edit' : 'New' }]}
      />
      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Details (विवरण)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Puja Name (पूजा का नाम)</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Maha Rudrabhishek" />
              </div>
              <div className="space-y-2">
                <Label>Slug (यूआरएल स्लॉग)</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. maha-rudrabhishek" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category (श्रेणी)</Label>
                  {loadingRefs ? (
                    <div className="text-xs text-muted-foreground animate-pulse">Loading categories...</div>
                  ) : (
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Location (स्थान)</Label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Ujjain, Kashi..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Short Description (संक्षिप्त विवरण)</Label>
                <Textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Full Description (विस्तृत विवरण)</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
              </div>
              <div className="space-y-2">
                <Label>Benefits (लाभ)</Label>
                <Textarea value={benefits} onChange={(e) => setBenefits(e.target.value)} rows={3} placeholder="e.g. removes obstacles, brings prosperity…" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">SEO Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>SEO Meta Title</Label><Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Title for Search Engines" /></div>
              <div className="space-y-2"><Label>SEO Meta Description</Label><Textarea rows={2} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="Description for Search Engines" /></div>
              <div className="space-y-2"><Label>SEO Keywords</Label><Input value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder="e.g. puja, havan, shanti (comma separated)" /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Pricing & Slots (मूल्य निर्धारण)</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-2">
                  <Label>Base Price (₹)</Label>
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>VIP Price (₹)</Label>
                  <Input type="number" value={vipPrice} onChange={(e) => setVipPrice(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Duration (min)</Label>
                  <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Max Members</Label>
                  <Input type="number" value={maxMembers} onChange={(e) => setMaxMembers(e.target.value)} />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-base font-bold">Custom Packages</Label>
                    <p className="text-xs text-muted-foreground">Add specific packages like Basic, Premium, etc.</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddPackage}>
                    <Plus className="h-4 w-4 mr-1" /> Add Package
                  </Button>
                </div>
                
                {packages.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic text-center py-4 border rounded bg-slate-50">No custom packages added. Base/VIP prices will be used.</p>
                ) : (
                  <div className="space-y-4">
                    {packages.map((pkg, i) => (
                      <div key={pkg.id || i} className="grid sm:grid-cols-12 gap-3 p-3 border rounded-lg bg-slate-50 relative">
                        <div className="sm:col-span-4 space-y-1">
                          <Label className="text-xs">Package Name</Label>
                          <Input value={pkg.name} onChange={(e) => handlePackageChange(i, 'name', e.target.value)} placeholder="e.g. Basic Pack" required />
                        </div>
                        <div className="sm:col-span-3 space-y-1">
                          <Label className="text-xs">Price (₹)</Label>
                          <Input type="number" value={pkg.price} onChange={(e) => handlePackageChange(i, 'price', e.target.value)} placeholder="e.g. 1100" required />
                        </div>
                        <div className="sm:col-span-4 space-y-1">
                          <Label className="text-xs">Description</Label>
                          <Input value={pkg.description || ''} onChange={(e) => handlePackageChange(i, 'description', e.target.value)} placeholder="Package benefits..." />
                        </div>
                        <div className="sm:col-span-1 flex items-end justify-end">
                          <Button type="button" variant="destructive" size="icon" onClick={() => handleRemovePackage(i)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Publishing (प्रकाशन)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-orange-50/50">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold text-slate-800">VIP Puja</Label>
                  <p className="text-xs text-slate-500">Enable to mark this as a VIP Puja.</p>
                </div>
                <Switch checked={isVip} onCheckedChange={setIsVip} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {status === 'PUBLISHED' && (
                <div className="space-y-2">
                  <Label>Schedule Publish Date/Time</Label>
                  <Input type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
                  <p className="text-[10px] text-muted-foreground">Leave blank to publish immediately.</p>
                </div>
              )}

              <Button type="submit" disabled={saving} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : (editId ? 'Update Puja' : (status === 'PUBLISHED' && publishedAt && new Date(publishedAt) > new Date() ? 'Schedule Puja' : 'Save Puja'))}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Media Upload (इमेज/वीडियो)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {coverImage && (
                <div className="aspect-[4/3] rounded-lg overflow-hidden border bg-black flex items-center justify-center">
                  {isVideoFile(coverImage) ? (
                    <video src={coverImage} controls className="h-full w-full object-contain" />
                  ) : (
                    <img src={coverImage} className="h-full w-full object-cover" alt="Preview" />
                  )}
                </div>
              )}
              
              <label className="cursor-pointer inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 text-sm font-medium gap-2 w-full select-none">
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {uploading ? 'Uploading…' : 'Upload Cover Image/Video'}
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={uploading}
                />
              </label>

              <div className="flex gap-2">
                <Input type="text" value={driveUrl} onChange={(e) => setDriveUrl(e.target.value)} placeholder="Or paste Google Drive link" className="text-xs" />
                <Button type="button" size="sm" onClick={handleDriveAdd} disabled={!driveUrl} className="bg-blue-600 hover:bg-blue-700">
                  <Cloud className="h-4 w-4 mr-1" /> Use
                </Button>
              </div>
              <div className="pt-2 border-t mt-2">
                <Label className="text-xs mb-1 block">Manual Image/Video URL</Label>
                <Input type="text" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="Direct URL..." className="text-xs" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Gallery Images (अतिरिक्त चित्र)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {galleryImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {galleryImages.map((imgUrl, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border bg-slate-50 group shadow-sm">
                      <img src={imgUrl} className="h-full w-full object-cover" alt={`Gallery ${idx + 1}`} />
                      <button 
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-bold shadow"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <label className="cursor-pointer inline-flex items-center justify-center rounded-md border border-dashed border-primary bg-primary/5 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/10 transition-colors gap-2 w-full select-none">
                {uploadingGallery ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {uploadingGallery ? 'Uploading images…' : 'Upload Gallery Images'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleGalleryUpload}
                  disabled={uploadingGallery}
                />
              </label>

              <div className="space-y-1">
                <Label className="text-[10px] text-slate-500">Or Paste Comma-Separated Image URLs</Label>
                <Textarea 
                  placeholder="Paste direct image links split by comma (,)" 
                  value={galleryImages.join(', ')} 
                  onChange={(e) => {
                    const val = e.target.value
                    setGalleryImages(val.split(',').map(s => s.trim()).filter(Boolean))
                  }}
                  rows={3}
                  className="text-xs"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}


export default function NewPujaPage() {
  return (
    <React.Suspense fallback={<div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#FF8C21]"></div></div>}>
      <NewPujaPage_Content />
    </React.Suspense>
  )
}
