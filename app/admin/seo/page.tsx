'use client'

import { useEffect, useState, Suspense } from 'react'
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation'
import { PageHeader } from '@/components/admin/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Send, Calendar, Video, Image as ImageIcon, Trash2, Plus, Sparkles, Facebook, Instagram, Youtube, Twitter } from 'lucide-react'

function SocialMediaManager() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get('tab') || 'publish'

  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [platforms, setPlatforms] = useState<string[]>(['facebook', 'instagram'])
  const [postNow, setPostNow] = useState(true)
  const [scheduledAt, setScheduledAt] = useState('')

  // Connected accounts simulation
  const [fbConnected, setFbConnected] = useState(true)
  const [igConnected, setIgConnected] = useState(true)
  const [ytConnected, setYtConnected] = useState(true)
  const [twConnected, setTwConnected] = useState(true)

  async function loadPosts() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/social')
      const data = await res.json()
      if (data.ok) {
        setPosts(data.data || [])
      }
    } catch {
      toast.error('Failed to load social posts queue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
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
        body: formData,
      })
      const data = await res.json()
      if (data.ok) {
        setMediaUrl(data.url)
        toast.success('Media file uploaded successfully!')
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch {
      toast.error('Network error uploading file')
    } finally {
      setUploading(false)
    }
  }

  function handleSuggestSeo() {
    if (!title) {
      toast.error('Please enter a brief topic/title first!')
      return
    }
    // Generate suggested spiritual SEO tags and title
    const suggestedTitle = `${title} Special Seva 🌸🕉️`
    const suggestedHashtags = `\n\nJoin us in this auspicious ritual. Receive live blessings and prasad. #DivyaYagyam #SanatanSeva #VedicBlessings #Puja`
    
    setTitle(suggestedTitle)
    setDescription((prev) => prev + suggestedHashtags)
    toast.success('SEO Title & Hashtags generated and inserted!')
  }

  const togglePlatform = (p: string) => {
    if (platforms.includes(p)) {
      setPlatforms(platforms.filter((x) => x !== p))
    } else {
      setPlatforms([...platforms, p])
    }
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !description) return

    setSaving(true)
    try {
      const res = await fetch('/api/admin/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          mediaUrl,
          platforms,
          scheduledAt,
          postNow
        })
      })
      const data = await res.json()
      if (data.ok) {
        toast.success(data.message)
        setTitle('')
        setDescription('')
        setMediaUrl('')
        setScheduledAt('')
        setPostNow(true)
        loadPosts()
      } else {
        toast.error(data.error || 'Failed to dispatch post')
      }
    } catch {
      toast.error('Network error publishing post')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to cancel this scheduled post?')) return
    try {
      const res = await fetch(`/api/admin/social?id=${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Post removed from queue')
        loadPosts()
      } else {
        toast.error(data.error || 'Failed to cancel')
      }
    } catch {
      toast.error('Network error deleting post')
    }
  }

  const changeTab = (val: string) => {
    router.push(`/admin/seo?tab=${val}`)
  }

  const tabs = [
    { label: 'Create Broadcast Post (नया पोस्ट)', value: 'publish' },
    { label: 'Scheduled Queue (शेड्यूल कतार)', value: 'queue' },
    { label: 'Linked Social Channels (सोशल मीडिया लिंक्स)', value: 'channels' }
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Social Media Broadcast & Scheduling Hub"
        description="Write and publish event posts, videos and images across all connected social media channels in one click."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Social Hub' }]}
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
          {activeTab === 'publish' && (
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="md:col-span-2 rounded-3xl border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <MegaphoneIcon className="h-5 w-5 text-orange-600" /> Create Multichannel Post
                  </CardTitle>
                  <CardDescription className="text-xs">Select target channels, upload media and write copy.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePublish} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="postTitle">Post Title / Heading</Label>
                      <div className="flex gap-2">
                        <Input
                          id="postTitle"
                          placeholder="e.g. Sawan Somwar Maha Rudrabhishek Darshan"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                          className="flex-1"
                        />
                        <Button type="button" variant="outline" className="rounded-xl border-orange-500 text-orange-600 gap-1" onClick={handleSuggestSeo}>
                          <Sparkles className="h-4 w-4" /> SEO Suggest
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postDesc">Post Description (Description & Hashtags)</Label>
                      <Textarea
                        id="postDesc"
                        placeholder="Write the captions for your social media handle..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows={6}
                      />
                    </div>

                    {/* Media Upload */}
                    <div className="space-y-2">
                      <Label>Attach Post Image / Video</Label>
                      <div className="flex items-center gap-4 border p-3 rounded-2xl bg-slate-50">
                        <div className="h-16 w-16 bg-slate-200 border rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                          {mediaUrl ? (
                            <img src={mediaUrl} alt="Attached Media" className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <label className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-orange-600 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-700 transition-all gap-1.5 h-9">
                            {uploading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <UploadIcon className="h-3.5 w-3.5" />
                            )}
                            {uploading ? 'Uploading…' : 'Attach Photo/Video'}
                            <input
                              type="file"
                              accept="image/*,video/*"
                              className="hidden"
                              onChange={handleMediaUpload}
                              disabled={uploading}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Schedule Checkbox */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-2xl">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-xs text-slate-800">Publish Immediately</span>
                        <span className="text-[10px] text-slate-500">Uncheck to schedule for a specific date and time</span>
                      </div>
                      <Switch checked={postNow} onCheckedChange={setPostNow} />
                    </div>

                    {!postNow && (
                      <div className="space-y-2">
                        <Label htmlFor="sch">Schedule Date & Time</Label>
                        <Input
                          id="sch"
                          type="datetime-local"
                          value={scheduledAt}
                          onChange={(e) => setScheduledAt(e.target.value)}
                          required={!postNow}
                        />
                      </div>
                    )}

                    <Button type="submit" disabled={saving} className="w-full bg-orange-600 hover:bg-orange-700 rounded-xl h-11 text-sm font-bold">
                      {saving ? (
                        <span className="flex items-center justify-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Broadcasting Post…
                        </span>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" /> {postNow ? 'Broadcast to All Platforms Now' : 'Schedule Broadcast Queue'}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Target Platforms Checklist */}
              <Card className="rounded-3xl border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-slate-800">Target Channels</CardTitle>
                  <CardDescription className="text-xs">Post will be broadcasted to checked platforms.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { id: 'facebook', name: 'Facebook Page', icon: Facebook, connected: fbConnected },
                    { id: 'instagram', name: 'Instagram Business', icon: Instagram, connected: igConnected },
                    { id: 'youtube', name: 'YouTube Channel', icon: Youtube, connected: ytConnected },
                    { id: 'twitter', name: 'Twitter / X', icon: Twitter, connected: twConnected }
                  ].map((p) => {
                    const Icon = p.icon
                    const isChecked = platforms.includes(p.id)
                    return (
                      <div key={p.id} className={`flex items-center justify-between p-3 border rounded-2xl transition-all ${p.connected ? 'opacity-100' : 'opacity-50'}`}>
                        <div className="flex items-center gap-2.5">
                          <Icon className={`h-5 w-5 ${p.id === 'facebook' ? 'text-blue-600' : p.id === 'instagram' ? 'text-pink-600' : p.id === 'youtube' ? 'text-red-600' : 'text-slate-900'}`} />
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-slate-800">{p.name}</span>
                            <span className="text-[9px] text-muted-foreground">{p.connected ? 'Active Account Connected' : 'Disconnected'}</span>
                          </div>
                        </div>
                        {p.connected && (
                          <Switch checked={isChecked} onCheckedChange={() => togglePlatform(p.id)} />
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'queue' && (
            <Card className="rounded-3xl border shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-800">Broadcast queue & scheduled posts</CardTitle>
                <CardDescription className="text-xs">Monitor posts in queue waiting to be sent automatically.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {posts.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-xs">No posts scheduled.</div>
                ) : (
                  <div className="border rounded-2xl divide-y bg-slate-50 p-2">
                    {posts.map((post) => (
                      <div key={post.id} className="p-3 flex items-start justify-between text-xs">
                        <div className="flex gap-3">
                          {post.mediaUrl && (
                            <img src={post.mediaUrl} alt={post.title} className="h-12 w-12 rounded-lg object-cover border" />
                          )}
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800 text-xs block">{post.title}</span>
                            <span className="text-[10px] text-slate-500 block max-w-xl line-clamp-2">{post.description}</span>
                            <div className="flex gap-1.5 pt-1.5">
                              {post.platforms.map((p: string) => (
                                <Badge key={p} className="bg-slate-200 text-slate-700 hover:bg-slate-300 font-mono text-[9px]">
                                  {p.toUpperCase()}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <Badge variant={post.status === 'PUBLISHED' ? 'success' : 'secondary'} className="font-bold text-[9px]">
                            {post.status}
                          </Badge>
                          <span className="text-[9px] text-muted-foreground">{post.scheduledAt}</span>
                          {post.status === 'SCHEDULED' && (
                            <Button size="icon" variant="destructive" className="h-6 w-6 rounded-lg" onClick={() => handleDelete(post.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'channels' && (
            <Card className="rounded-3xl border shadow-sm max-w-xl">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-800">Link Social Media Channels</CardTitle>
                <CardDescription className="text-xs">Connect platform OAuth APIs to unlock bulk scheduling.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { id: 'fb', name: 'Meta / Facebook Developer Portal', state: fbConnected, setter: setFbConnected },
                  { id: 'ig', name: 'Instagram Graph API', state: igConnected, setter: setIgConnected },
                  { id: 'yt', name: 'Google YouTube Creator API', state: ytConnected, setter: setYtConnected },
                  { id: 'tw', name: 'Twitter / X API V2 Keys', state: twConnected, setter: setTwConnected }
                ].map((channel) => (
                  <div key={channel.id} className="flex justify-between items-center p-3 border rounded-2xl bg-slate-50">
                    <span className="font-bold text-xs text-slate-800">{channel.name}</span>
                    <div className="flex items-center gap-3">
                      <Badge variant={channel.state ? 'success' : 'secondary'} className="font-bold text-[9px]">
                        {channel.state ? 'CONNECTED' : 'DISCONNECTED'}
                      </Badge>
                      <Switch checked={channel.state} onCheckedChange={channel.setter} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

// Helpers renamed to avoid conflict
function MegaphoneIcon(props: any) {
  return <Send {...props} />
}
function UploadIcon(props: any) {
  return <Plus {...props} />
}

export default function SocialPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
      </div>
    }>
      <SocialMediaManager />
    </Suspense>
  )
}
