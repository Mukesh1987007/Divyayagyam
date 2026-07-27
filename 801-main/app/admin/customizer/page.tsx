'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PageHeader } from '@/components/admin/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Save, Code2, Trash2, Palette, Sparkles, Layers, Upload } from 'lucide-react'

function CustomizerManager() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get('tab') || 'theme'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  // CSS/JS codes
  const [globalCss, setGlobalCss] = useState('')
  const [globalJs, setGlobalJs] = useState('')
  const [pageCustom, setPageCustom] = useState<Record<string, { html?: string; css?: string; js?: string }>>({})
  const [selectedPath, setSelectedPath] = useState('/')

  // Theme styling states
  const [primaryColor, setPrimaryColor] = useState('#FF8C21')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [fontFamily, setFontFamily] = useState('Outfit')

  // Header/Footer branding
  const [brandName, setBrandName] = useState('DivyaYagyam')
  const [logoUrl, setLogoUrl] = useState('/logo.jpg')
  const [copyrightText, setCopyrightText] = useState('© 2026 DivyaYagyam. All rights reserved. • हरि ओम् 🙏')

  useEffect(() => {
    fetch('/api/customizer')
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setGlobalCss(j.data.globalCss || '')
          setGlobalJs(j.data.globalJs || '')
          setPageCustom(j.data.pageCustom || {})
          
          // Theme config from database
          const theme = j.data.theme || {}
          setPrimaryColor(theme['theme.primary'] || '#FF8C21')
          setBackgroundColor(theme['theme.background'] || '#ffffff')
          setFontFamily(theme['theme.fontFamily'] || 'Outfit')
          setBrandName(theme['site.name'] || 'DivyaYagyam')
          setLogoUrl(theme['site.logo'] || '/logo.jpg')
          setCopyrightText(theme['site.copyright'] || '© 2026 DivyaYagyam. All rights reserved. • हरि ओम् 🙏')
        }
        setLoading(false)
      })
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/customizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          globalCss,
          globalJs,
          pageCustom,
          theme: {
            'theme.primary': primaryColor,
            'theme.background': backgroundColor,
            'theme.fontFamily': fontFamily,
            'site.name': brandName,
            'site.logo': logoUrl,
            'site.copyright': copyrightText
          }
        }),
      })
      const j = await res.json()
      if (!j.ok) throw new Error(j.error)
      toast.success('🎨 WordPress-style Theme & Customizations applied live successfully!')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save theme settings')
    } finally {
      setSaving(false)
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    
    try {
      let fileToUpload = file;
      if (file.type.startsWith('image/')) {
        toast.info('Compressing image...');
        const { compressImage } = await import('@/lib/utils');
        fileToUpload = await compressImage(file, { maxSizeMB: 0.8 });
      }

      if (fileToUpload.size > 4 * 1024 * 1024) {
        setUploadingLogo(false);
        toast.error('Image is still too large after compression (Max 4MB). Please select a smaller photo.');
        return;
      }

      const formData = new FormData()
      formData.append('file', fileToUpload)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      const data = await res.json()
      if (data.ok) {
        setLogoUrl(data.url)
        toast.success('Logo uploaded and compressed successfully!')
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch (err: any) {
      toast.error('Upload Error: ' + (err.message || 'Network error'))
    } finally {
      setUploadingLogo(false)
    }
  }

  const changeTab = (val: string) => {
    router.push(`/admin/customizer?tab=${val}`)
  }

  const pageEntry = pageCustom[selectedPath] || {}
  function updatePageEntry(patch: Partial<{ html: string; css: string; js: string }>) {
    setPageCustom({ ...pageCustom, [selectedPath]: { ...pageEntry, ...patch } })
  }
  function deletePageEntry(path: string) {
    const cp = { ...pageCustom }
    delete cp[path]
    setPageCustom(cp)
  }

  const tabs = [
    { label: 'Theme Styling (फॉन्ट/कलर)', value: 'theme' },
    { label: 'Branding & Layout (ब्रांडिंग)', value: 'branding' },
    { label: 'Custom CSS (सीएसएस)', value: 'css' },
    { label: 'Custom JS (जावास्क्रिप्ट)', value: 'js' },
    { label: 'Per-Page HTML (पेज ओवरराइड)', value: 'html' },
    { label: 'Live Preview (लाइव)', value: 'preview' }
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Site Theme Customizer"
        description="WordPress-style control panel to edit fonts, colors, brand logo, footer details and inject HTML/CSS/JS code."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Customizer' }]}
        action={{ label: saving ? 'Saving…' : 'Save & Publish', icon: Save, onClick: handleSave }}
      />

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
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
        </div>
      ) : (
        <div className="grid gap-6">
          {activeTab === 'theme' && (
            <Card className="rounded-3xl border shadow-sm max-w-xl">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Palette className="h-5 w-5 text-orange-600" /> Typography & Colors
                </CardTitle>
                <CardDescription className="text-xs">Select primary brand colors and typography styles.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Primary Font Family</Label>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Outfit">Outfit (Modern Elegant)</SelectItem>
                      <SelectItem value="Inter">Inter (Sleek Tech)</SelectItem>
                      <SelectItem value="Playfair Display">Playfair Display (Sacred Serif)</SelectItem>
                      <SelectItem value="Roboto">Roboto (Clean sans-serif)</SelectItem>
                      <SelectItem value="Cinzel">Cinzel (Divine Roman)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pColor">Primary Theme Accent</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="pColor"
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="h-10 w-16 p-0 border cursor-pointer"
                      />
                      <span className="font-mono text-xs uppercase">{primaryColor}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bgColor">Body Background Color</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="bgColor"
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="h-10 w-16 p-0 border cursor-pointer"
                      />
                      <span className="font-mono text-xs uppercase">{backgroundColor}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'branding' && (
            <Card className="rounded-3xl border shadow-sm max-w-xl">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-orange-600" /> Site Identity, Header & Footer
                </CardTitle>
                <CardDescription className="text-xs">Update your brand name, logo and footer copyright notes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="brandN">Branding Site Name</Label>
                  <Input
                    id="brandN"
                    placeholder="e.g. DivyaYagyam"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoU">Branding Logo path / Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="logoU"
                      placeholder="e.g. /logo.jpg"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                    />
                    <label className="cursor-pointer inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 text-sm font-medium gap-2 shrink-0">
                      {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {uploadingLogo ? 'Uploading…' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="copyT">Footer Copyright Text / Social links</Label>
                  <Input
                    id="copyT"
                    placeholder="e.g. © 2026 DivyaYagyam. All rights reserved."
                    value={copyrightText}
                    onChange={(e) => setCopyrightText(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'css' && (
            <Card className="rounded-3xl border shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-orange-600" /> Custom Global CSS
                </CardTitle>
                <CardDescription className="text-xs">Custom CSS styles to modify layout, margins, buttons and background header decorations.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={globalCss}
                  onChange={(e) => setGlobalCss(e.target.value)}
                  rows={20}
                  className="font-mono text-xs bg-slate-50 border p-3 rounded-2xl"
                  placeholder={`/* e.g. custom changes */\n.text-primary {\n  color: ${primaryColor} !important;\n}`}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === 'js' && (
            <Card className="rounded-3xl border shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-orange-600" /> Custom Global Javascript
                </CardTitle>
                <CardDescription className="text-xs">Inject scripts site-wide for analytics tools, popups or user chat widget hooks.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={globalJs}
                  onChange={(e) => setGlobalJs(e.target.value)}
                  rows={20}
                  className="font-mono text-xs bg-slate-50 border p-3 rounded-2xl"
                  placeholder={`// Custom JS codes\nconsole.log("Sanatan Customizer Live Active!");`}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === 'html' && (
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="rounded-3xl border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-slate-800">Select Page Path</CardTitle>
                  <CardDescription className="text-xs">Customize layout per route</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input value={selectedPath} onChange={(e) => setSelectedPath(e.target.value)} placeholder="/pujas" />
                    <Button size="sm" className="rounded-xl" onClick={() => setPageCustom((prev) => ({ ...(typeof prev === 'object' && prev !== null ? prev : {}), [selectedPath]: (typeof prev === 'object' && prev !== null ? prev[selectedPath] : undefined) || {} }))}>Add</Button>
                  </div>
                  <div className="border rounded-2xl divide-y max-h-96 overflow-auto bg-slate-50 p-2">
                    {Object.keys(pageCustom).length === 0 ? (
                      <p className="p-3 text-xs text-muted-foreground text-center">No per-page overrides configured.</p>
                    ) : Object.keys(pageCustom).map((p) => (
                      <div key={p} className={`flex items-center justify-between p-2 text-xs cursor-pointer rounded-lg mb-1 ${selectedPath === p ? 'bg-orange-50 text-orange-800 font-bold' : 'hover:bg-slate-200'}`}
                        onClick={() => setSelectedPath(p)}>
                        <code>{p}</code>
                        <button onClick={(e) => { e.stopPropagation(); deletePageEntry(p) }} className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 rounded-3xl border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Layers className="h-5 w-5 text-orange-600" /> Per-Page HTML & Code Override for <Badge variant="outline">{selectedPath}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs">Override Page HTML</Label>
                    <Textarea
                      value={pageEntry.html || ''}
                      onChange={(e) => updatePageEntry({ html: e.target.value })}
                      rows={12}
                      className="font-mono text-xs bg-slate-50 border p-3 rounded-2xl mt-1"
                      placeholder="<!-- Inject custom HTML structures directly into the page layout -->"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'preview' && (
            <Card className="rounded-3xl border shadow-sm col-span-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Layers className="h-5 w-5 text-orange-600" /> Live Preview
                  </CardTitle>
                  <CardDescription className="text-xs">
                    See exactly how your site looks with the saved customizer settings. (Please click "Save" first to see latest changes).
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
                  if (iframe) iframe.src = iframe.src;
                }}>
                  Refresh Preview
                </Button>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200 h-[600px] relative">
                  <iframe 
                    id="preview-iframe"
                    src="/" 
                    className="w-full h-full border-none"
                    title="Live Preview"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

export default function CustomizerPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
      </div>
    }>
      <CustomizerManager />
    </Suspense>
  )
}
