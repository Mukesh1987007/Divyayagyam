'use client'
import React from 'react';
import { useEffect, useState } from 'react'
import Image from 'next/image';
import { compressImage } from '@/lib/utils'
import { PageHeader } from '@/components/admin/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Upload, Trash2, Star } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface RefCategory {
  id: string
  name: string
}

function NewProductPage_Content() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')

  const [categories, setCategories] = useState<RefCategory[]>([])
  const [loadingRefs, setLoadingRefs] = useState(true)

  // Form states
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [sku, setSku] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('500')
  const [salePrice, setSalePrice] = useState('')
  const [stock, setStock] = useState('50')
  const [weight, setWeight] = useState('100')
  const [isAbhimantrit, setIsAbhimantrit] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)
  const [status, setStatus] = useState('DRAFT')
  const [coverImage, setCoverImage] = useState('')
  const [extraImages, setExtraImages] = useState<string[]>([])
  const [tags, setTags] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [seoKeywords, setSeoKeywords] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [newReviewName, setNewReviewName] = useState('')
  const [newReviewRating, setNewReviewRating] = useState('5')
  const [newReviewTitle, setNewReviewTitle] = useState('')
  const [newReviewComment, setNewReviewComment] = useState('')
  const [addingReview, setAddingReview] = useState(false)

  // Fetch product categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        setLoadingRefs(true)
        const res = await fetch('/api/admin/product-categories')
        const data = await res.json()
        if (data.ok) {
          setCategories(data.data || [])
        }
      } catch {
        toast.error('Failed to load product categories')
      } finally {
        setLoadingRefs(false)
      }
    }
    fetchCats()
  }, [])

  // Auto-slugify
  useEffect(() => {
    if (!editId) {
      setSlug(name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))
    }
  }, [name, editId])

  // Fetch details if editing
  useEffect(() => {
    if (!editId) return
    const fetchProduct = async () => {
      try {
        setLoadingDetails(true)
        const res = await fetch(`/api/admin/products?id=${editId}`)
        const data = await res.json()
        if (data.ok && data.product) {
          const p = data.product
          setName(p.name || '')
          setSlug(p.slug || '')
          setSku(p.sku || '')
          setCategoryId(p.categoryId || '')
          setShortDescription(p.shortDescription || '')
          setDescription(p.description || '')
          setPrice(String(p.price || '0'))
          setSalePrice(String(p.salePrice || ''))
          setStock(String(p.inventory?.quantity || '0'))
          setWeight(String(p.weight || ''))
          setIsAbhimantrit(!!p.isAbhimantrit)
          setIsFeatured(!!p.isFeatured)
          setStatus(p.status || 'DRAFT')
          setCoverImage(p.coverImage || '')
          setTags(p.tags || '')
          setSeoTitle(p.seoTitle || '')
          setSeoDescription(p.seoDescription || '')
          setSeoKeywords(p.seoKeywords || '')
          if (p.images && p.images.length > 0) {
            setExtraImages(p.images.map((img: any) => img.url))
          }
        }
      } catch {
        toast.error('Error fetching product details')
      } finally {
        setLoadingDetails(false)
      }
    }
    fetchProduct()
  }, [editId])

  // Fetch reviews
  useEffect(() => {
    if (!editId) return
    const fetchReviews = async () => {
      setLoadingReviews(true)
      try {
        const res = await fetch(`/api/admin/products/reviews?productId=${editId}`)
        const data = await res.json()
        if (data.ok) {
          setReviews(data.reviews)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingReviews(false)
      }
    }
    fetchReviews()
  }, [editId])

  const handleAddReview = async () => {
    if (!newReviewName || !newReviewComment) return toast.error('Name and comment required')
    setAddingReview(true)
    try {
      const res = await fetch('/api/admin/products/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: editId,
          reviewerName: newReviewName,
          rating: newReviewRating,
          title: newReviewTitle,
          comment: newReviewComment
        })
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Review added')
        setReviews([data.review, ...reviews])
        setNewReviewName('')
        setNewReviewTitle('')
        setNewReviewComment('')
      } else {
        toast.error(data.error)
      }
    } catch (err) {
      toast.error('Failed to add review')
    } finally {
      setAddingReview(false)
    }
  }

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Delete review?')) return
    try {
      const res = await fetch(`/api/admin/products/reviews?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setReviews(reviews.filter(r => r.id !== id))
        toast.success('Review deleted')
      }
    } catch {
      toast.error('Failed to delete review')
    }
  }

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
        toast.success('Product image uploaded successfully!')
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch {
      toast.error('Network error uploading file')
    } finally {
      setUploading(false)
    }
  }

  const handleExtraImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
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
        setExtraImages((prev) => [...prev, data.url])
        toast.success('Extra image uploaded successfully!')
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch {
      toast.error('Network error uploading file')
    } finally {
      setUploading(false)
    }
  }

  const removeExtraImage = (indexToRemove: number) => {
    setExtraImages(prev => prev.filter((_, i) => i !== indexToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Product Name is required')
      return
    }
    if (!categoryId) {
      toast.error('Please select a Product Category')
      return
    }

    try {
      setSaving(true)
      const payload = {
        id: editId || undefined,
        name,
        slug,
        sku,
        categoryId,
        shortDescription,
        description,
        price: Number(price) || 0,
        salePrice: salePrice ? Number(salePrice) : null,
        isAbhimantrit,
        isFeatured,
        status,
        coverImage,
        weight: weight ? Number(weight) : null,
        stock: Number(stock) || 0,
        tags,
        seoTitle,
        seoDescription,
        seoKeywords,
        extraImages
      }

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (data.ok) {
        toast.success(editId ? 'Product updated successfully!' : 'Product created successfully!')
        router.push('/admin/products')
      } else {
        toast.error(data.error || 'Failed to save product')
      }
    } catch {
      toast.error('Network error saving product')
    } finally {
      setSaving(false)
    }
  }

  if (loadingDetails) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={editId ? 'Edit Product' : 'Add Product'}
        description="Create or edit a product for the store with price and inventory details."
        breadcrumbs={[{ label: 'Products', href: '/admin/products' }, { label: editId ? 'Edit' : 'New' }]}
      />
      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Details (विवरण)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Product Name (सामग्री का नाम)</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Energized Rudraksha Mala" />
              </div>
              <div className="space-y-2">
                <Label>Slug (यूआरएल स्लॉग)</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. energized-rudraksha-mala" />
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
                  <Label>SKU (कोड)</Label>
                  <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. RUD-MALA-108" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Short Description (संक्षिप्त विवरण)</Label>
                <Textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Full Description (विस्तृत विवरण)</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={10} className="font-sans" />
              </div>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Sale Price (₹)</Label>
                  <Input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Stock Qty</Label>
                  <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Weight (g)</Label>
                  <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t mt-4">
                <h3 className="font-bold text-slate-800">SEO & Tags</h3>
                <div className="space-y-2">
                  <Label>Tags (comma separated)</Label>
                  <Input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. rudraksha, shiva, energized" />
                </div>
                <div className="space-y-2">
                  <Label>Meta Title (SEO)</Label>
                  <Input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Title for search engines" />
                </div>
                <div className="space-y-2">
                  <Label>Meta Description (SEO)</Label>
                  <Textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={2} placeholder="Description for search engines" />
                </div>
                <div className="space-y-2">
                  <Label>SEO Keywords</Label>
                  <Input type="text" value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder="e.g. rudraksha, yantra, spiritual (comma separated)" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Publishing (प्रकाशन)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Abhimantrit (अभिमंत्रित)</Label>
                <Switch checked={isAbhimantrit} onCheckedChange={setIsAbhimantrit} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Featured (मुख्य)</Label>
                <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={saving} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : 'Save Product'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Product Image (उत्पाद छवि)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {coverImage && (
                <div className="aspect-[4/3] rounded-lg overflow-hidden border bg-slate-100 flex items-center justify-center overflow-hidden">
                  <img src={coverImage} className="h-full w-full object-cover" alt="Preview" />
                </div>
              )}
              
              <label className="cursor-pointer inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 text-sm font-medium gap-2 w-full select-none">
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {uploading ? 'Uploading…' : 'Upload Product Image'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={uploading}
                />
              </label>

              <Input type="text" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="Or paste image URL" className="text-xs" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Gallery Images (अतिरिक्त छवियाँ)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {extraImages.map((img, i) => (
                  <div key={i} className="aspect-square rounded border bg-slate-100 flex items-center justify-center relative overflow-hidden group">
                    <img src={img} className="h-full w-full object-cover" alt={`Gallery ${i}`} />
                    <button type="button" onClick={() => removeExtraImage(i)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <label className="cursor-pointer inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 text-sm font-medium gap-2 w-full select-none">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Add Gallery Image
                <input type="file" accept="image/*" className="hidden" onChange={handleExtraImageUpload} disabled={uploading} />
              </label>
            </CardContent>
          </Card>
        </div>
      </form>

      {/* REVIEWS SECTION */}
      {editId && (
        <Card className="mt-8 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Customer Reviews (ग्राहक समीक्षा)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Review Form */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 grid gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Reviewer Name</Label>
                  <Input value={newReviewName} onChange={(e) => setNewReviewName(e.target.value)} placeholder="e.g. Ramesh Kumar" />
                </div>
                <div className="space-y-2">
                  <Label>Rating (1-5)</Label>
                  <Select value={newReviewRating} onValueChange={setNewReviewRating}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Review Title (Optional)</Label>
                  <Input value={newReviewTitle} onChange={(e) => setNewReviewTitle(e.target.value)} placeholder="e.g. Excellent Quality!" />
                </div>
              </div>
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-2 flex-1">
                  <Label>Review Comment</Label>
                  <Textarea value={newReviewComment} onChange={(e) => setNewReviewComment(e.target.value)} rows={5} placeholder="Write the review here..." className="h-[142px]" />
                </div>
                <Button onClick={handleAddReview} disabled={addingReview} className="w-full bg-slate-900 text-white font-bold hover:bg-slate-800">
                  {addingReview ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Star className="h-4 w-4 mr-1" />}
                  Add Review Manually
                </Button>
              </div>
            </div>

            {/* List Reviews */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-bold text-slate-800">Existing Reviews</h3>
              {loadingReviews ? (
                <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin"/> Loading...</div>
              ) : reviews.length === 0 ? (
                <div className="text-sm text-slate-500">No reviews found for this product.</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {reviews.map((r) => (
                    <div key={r.id} className="p-4 rounded-xl border bg-white relative">
                      <button onClick={() => handleDeleteReview(r.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-[#F4B400] text-[#F4B400]" />
                        ))}
                      </div>
                      <p className="font-bold text-slate-900 text-sm">{r.reviewerName || r.user?.firstName || 'Anonymous'} <span className="font-normal text-xs text-slate-500 ml-1">{new Date(r.createdAt).toLocaleDateString()}</span></p>
                      {r.title && <p className="font-bold text-xs mt-1 text-slate-700">{r.title}</p>}
                      <p className="text-sm text-slate-600 mt-2">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}


export default function NewProductPage() {
  return (
    <React.Suspense fallback={<div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#FF8C21]"></div></div>}>
      <NewProductPage_Content />
    </React.Suspense>
  )
}
