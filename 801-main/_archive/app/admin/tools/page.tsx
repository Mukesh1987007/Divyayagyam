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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2, Sparkle, Edit, Upload, Image as ImageIcon, Cloud } from 'lucide-react'
import { convertGoogleDriveUrl } from '@/lib/utils'

export default function AdminToolsPage() {
  const [tools, setTools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  // Form states
  const [editingId, setEditingId] = useState('')
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [isFree, setIsFree] = useState(true)
  const [price, setPrice] = useState('')
  const [trialDays, setTrialDays] = useState('7')
  const [isActive, setIsActive] = useState(true)
  const [thumbnail, setThumbnail] = useState('')
  const [htmlCode, setHtmlCode] = useState('')
  const [cssCode, setCssCode] = useState('')
  const [jsCode, setJsCode] = useState('')
  const [driveUrl, setDriveUrl] = useState('')

  async function loadTools() {
    try {
      const res = await fetch('/api/admin/tools')
      const data = await res.json()
      if (data.ok) {
        setTools(data.data || [])
      }
    } catch {
      toast.error('Failed to load spiritual tools')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTools()
  }, [])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.ok) {
        setThumbnail(data.url)
        toast.success('Thumbnail uploaded!')
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch {
      toast.error('Network error uploading image')
    } finally {
      setUploadingImage(false)
    }
  }

  function handleDriveAdd() {
    if (!driveUrl) return
    const convertedUrl = convertGoogleDriveUrl(driveUrl)
    setThumbnail(convertedUrl)
    setDriveUrl('')
    toast.success('Drive link applied as thumbnail!')
  }

  function handleEdit(tool: any) {
    setEditingId(tool.id)
    setName(tool.name)
    setSlug(tool.slug)
    setDescription(tool.description || '')
    setIsFree(tool.isFree)
    setPrice(tool.price?.toString() || '0')
    setTrialDays(tool.trialDays?.toString() || '0')
    setIsActive(tool.isActive)
    setThumbnail(tool.thumbnail || '')
    setHtmlCode(tool.htmlCode || '')
    setCssCode(tool.cssCode || '')
    setJsCode(tool.jsCode || '')
    setShowAddForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setEditingId('')
    setName('')
    setSlug('')
    setDescription('')
    setIsFree(true)
    setPrice('')
    setTrialDays('7')
    setIsActive(true)
    setThumbnail('')
    setHtmlCode('')
    setCssCode('')
    setJsCode('')
    setShowAddForm(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name) return

    setSaving(true)
    try {
      const res = await fetch('/api/admin/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId || undefined,
          name,
          slug,
          description,
          isFree,
          price: isFree ? 0 : Number(price || 0),
          trialDays: isFree ? 0 : Number(trialDays || 0),
          isActive,
          thumbnail,
          htmlCode,
          cssCode,
          jsCode
        }),
      })
      const data = await res.json()
      if (data.ok) {
        toast.success(editingId ? 'Tool updated!' : 'Spiritual Tool registered!')
        resetForm()
        loadTools()
      } else {
        toast.error(data.error || 'Failed to save tool')
      }
    } catch {
      toast.error('Network error saving tool')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this tool?')) return
    try {
      const res = await fetch(`/api/admin/tools?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Tool deleted successfully')
        loadTools()
      } else {
        toast.error(data.error || 'Failed to delete')
      }
    } catch {
      toast.error('Network error deleting tool')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Spiritual Tools & CMS"
        description="Build custom astrology tools with HTML/JS/CSS. Set up trial IP-tracking systems and payments."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Tools' }]}
        action={{
          label: showAddForm ? 'Cancel' : 'Add Tool',
          icon: Plus,
          onClick: () => {
            if (showAddForm) resetForm()
            else setShowAddForm(true)
          },
        }}
      />

      {showAddForm && (
        <form onSubmit={handleCreate} className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkle className="h-5 w-5 text-primary animate-spin" /> 
                  {editingId ? 'Edit Tool' : 'Register New Spiritual Tool'}
                </CardTitle>
                <CardDescription>Basic Information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tName">Tool Name *</Label>
                    <Input
                      id="tName"
                      placeholder="e.g. Kundali Generator"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        if (!editingId && !slug) {
                          setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
                        }
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tSlug">Slug (URL Path)</Label>
                    <Input id="tSlug" placeholder="e.g. kundali" value={slug} onChange={(e) => setSlug(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tDesc">Description</Label>
                  <Textarea
                    id="tDesc"
                    placeholder="Provide details about what the tool does..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <Label className="text-primary font-bold">Custom Code Injection (CMS)</Label>
                  <p className="text-xs text-muted-foreground mb-4">
                    Inject raw HTML, CSS, and JS to build a custom tool. It will be rendered securely on the frontend inside the tool page.
                  </p>
                  
                  <div className="space-y-2">
                    <Label>HTML Code</Label>
                    <Textarea 
                      placeholder="<div id='my-tool'>...</div>"
                      className="font-mono text-sm bg-slate-50"
                      rows={6}
                      value={htmlCode}
                      onChange={(e) => setHtmlCode(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>CSS Code</Label>
                    <Textarea 
                      placeholder="#my-tool { color: red; }"
                      className="font-mono text-sm bg-slate-50"
                      rows={4}
                      value={cssCode}
                      onChange={(e) => setCssCode(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Javascript Code</Label>
                    <Textarea 
                      placeholder="document.getElementById('my-tool').innerHTML = 'Hello!';"
                      className="font-mono text-sm bg-slate-50"
                      rows={6}
                      value={jsCode}
                      onChange={(e) => setJsCode(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Thumbnail Image</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {thumbnail && (
                  <div className="aspect-video relative rounded-md overflow-hidden border bg-slate-100 flex items-center justify-center">
                    <img src={thumbnail} alt="Thumbnail Preview" className="object-cover w-full h-full" />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 text-sm font-medium gap-2 w-full select-none">
                    {uploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {uploadingImage ? 'Uploading…' : 'Upload Thumbnail'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </label>

                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Or paste Google Drive link"
                      value={driveUrl}
                      onChange={(e) => setDriveUrl(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <Button type="button" size="sm" onClick={handleDriveAdd} disabled={!driveUrl} className="h-8 bg-blue-600 hover:bg-blue-700">
                      <Cloud className="h-3 w-3 mr-1" /> Use
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Monetization & Trial</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-md">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Free Tool Option</Label>
                    <p className="text-[10px] text-muted-foreground">Is this completely free?</p>
                  </div>
                  <Switch checked={isFree} onCheckedChange={setIsFree} />
                </div>

                {!isFree && (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="tPrice">One-Time Activation Price (₹)</Label>
                      <Input
                        id="tPrice"
                        type="number"
                        placeholder="e.g. 299"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required={!isFree}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tTrial">Free Trial IP-Limit (Days)</Label>
                      <Input
                        id="tTrial"
                        type="number"
                        placeholder="e.g. 7"
                        value={trialDays}
                        onChange={(e) => setTrialDays(e.target.value)}
                        required={!isFree}
                      />
                      <p className="text-[10px] text-muted-foreground">Users violating trial by changing emails will be blocked via IP detection.</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-md">
                  <Label className="text-sm font-semibold">Active Status</Label>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>

                <Button className="w-full" type="submit" disabled={saving || uploadingImage}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? 'Save Changes' : 'Publish Tool'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTableShell
          columns={[
            {
              key: 'thumbnail',
              label: 'Image',
              render: (r) => (
                <div className="h-10 w-16 bg-slate-100 rounded border overflow-hidden">
                  {r.thumbnail ? (
                    <img src={r.thumbnail} alt={r.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-slate-200" />
                  )}
                </div>
              ),
            },
            { key: 'name', label: 'Tool Name' },
            {
              key: 'slug',
              label: 'Access Slug',
              render: (r) => (
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">{r.slug}</code>
              ),
            },
            {
              key: 'isFree',
              label: 'Type',
              render: (r) => (
                <Badge variant={r.isFree ? 'outline' : 'default'}>
                  {r.isFree ? 'Free' : 'Premium'}
                </Badge>
              ),
            },
            {
              key: 'price',
              label: 'Price',
              render: (r) => (
                <span>{r.isFree ? 'N/A' : `₹${Number(r.price)}`}</span>
              ),
            },
            {
              key: 'trialDays',
              label: 'Trial Limits',
              render: (r) => (
                <span>{r.isFree ? 'Unlimited' : `${r.trialDays} Days`}</span>
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
                    variant="outline"
                    className="h-8 w-8 text-blue-600"
                    onClick={() => handleEdit(r)}
                    title="Edit Tool"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={() => handleDelete(r.id)}
                    title="Delete Tool"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ),
            },
          ]}
          rows={tools}
        />
      )}
    </div>
  )
}
