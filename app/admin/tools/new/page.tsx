'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PageHeader } from '@/components/admin/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function NewToolPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [isFree, setIsFree] = useState(true)
  const [price, setPrice] = useState('0')
  const [htmlCode, setHtmlCode] = useState('')
  const [cssCode, setCssCode] = useState('')
  const [jsCode, setJsCode] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (editId) {
      setLoadingData(true)
      fetch(`/api/admin/tools?id=${editId}`)
        .then(res => res.json())
        .then(data => {
          if (data.ok && data.data) {
            const tool = data.data
            setName(tool.name)
            setSlug(tool.slug)
            setDescription(tool.description || '')
            setIsFree(tool.isFree)
            setPrice(tool.price?.toString() || '0')
            setHtmlCode(tool.htmlCode || '')
            setCssCode(tool.cssCode || '')
            setJsCode(tool.jsCode || '')
            setIsActive(tool.isActive)
          } else {
            toast.error('Tool not found')
          }
        })
        .catch(() => toast.error('Failed to load tool'))
        .finally(() => setLoadingData(false))
    }
  }, [editId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !slug) {
      toast.error('Name and Slug are required')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/tools${editId ? `?id=${editId}` : ''}`, {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, slug, description, isFree, 
          price: parseFloat(price) || 0,
          htmlCode, cssCode, jsCode, isActive
        })
      })

      const data = await res.json()
      if (data.ok) {
        toast.success(editId ? 'Tool updated successfully' : 'Tool created successfully')
        router.push('/admin/tools')
      } else {
        toast.error(data.error || 'Failed to save tool')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) return <div className="p-20 text-center flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>

  return (
    <div className="space-y-6">
      <PageHeader 
        title={editId ? "Edit Tool" : "Create New Tool"} 
        description="Add HTML/JS/CSS code directly or configure a code-mapped tool."
        breadcrumbs={[{ label: 'Tools', href: '/admin/tools' }, { label: editId ? 'Edit' : 'New' }]}
      />

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tool Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tool Name</Label>
                  <Input 
                    placeholder="e.g. Kundli Milan" 
                    value={name} 
                    onChange={e => {
                      setName(e.target.value)
                      if (!editId && !slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL Slug</Label>
                  <Input 
                    placeholder="kundli-milan" 
                    value={slug} 
                    onChange={e => setSlug(e.target.value)} 
                    required
                  />
                  <p className="text-[10px] text-slate-500">Must match the React Component name if loading from code.</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  rows={2} 
                  placeholder="A brief description of what this tool does..." 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tool Code (Optional)</CardTitle>
              <CardDescription>If you are injecting HTML/JS directly, paste it here. If the slug matches a hardcoded React component in your codebase, this will be ignored.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>HTML Code</Label>
                <Textarea rows={6} className="font-mono text-xs bg-slate-900 text-green-400" value={htmlCode} onChange={e => setHtmlCode(e.target.value)} placeholder="<div id='tool-container'></div>" />
              </div>
              <div className="space-y-2">
                <Label>CSS Code</Label>
                <Textarea rows={4} className="font-mono text-xs bg-slate-900 text-blue-400" value={cssCode} onChange={e => setCssCode(e.target.value)} placeholder="#tool-container { color: red; }" />
              </div>
              <div className="space-y-2">
                <Label>JavaScript Code</Label>
                <Textarea rows={6} className="font-mono text-xs bg-slate-900 text-yellow-400" value={jsCode} onChange={e => setJsCode(e.target.value)} placeholder="document.getElementById('tool-container').innerText = 'Hello';" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Publishing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Active (Visible to public)</Label>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Tool
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardHeader className="bg-amber-50 rounded-t-xl pb-4">
              <CardTitle className="text-amber-800 flex items-center gap-2">Freemium / Paywall</CardTitle>
              <CardDescription className="text-amber-700/80">Configure access restrictions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <Label>Is Free Tool?</Label>
                  <p className="text-[10px] text-slate-500">If false, the tool will be locked behind a paywall.</p>
                </div>
                <Switch checked={isFree} onCheckedChange={setIsFree} />
              </div>

              {!isFree && (
                <div className="space-y-2 p-3 bg-slate-50 rounded-md border">
                  <Label>Unlock Price (₹)</Label>
                  <Input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} />
                  <p className="text-[10px] text-slate-500 mt-1">Users will see a teaser view of the tool until they pay this amount.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
