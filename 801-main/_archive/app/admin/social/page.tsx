'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image';
import { PageHeader } from '@/components/admin/page-header'
import { KpiCard } from '@/components/admin/kpi-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Share2, Clock, CheckCircle2, Trash2, Send, Calendar, ShieldCheck, Video, Image as ImageIcon } from 'lucide-react'

interface SocialPost {
  id: string
  title: string
  description: string
  mediaUrl: string
  platforms: string[]
  scheduledAt: string
  status: 'SCHEDULED' | 'PUBLISHED'
}

export default function SocialMediaAdminPage() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [platforms, setPlatforms] = useState<string[]>(['facebook'])
  const [scheduledAt, setScheduledAt] = useState('')
  const [postNow, setPostNow] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  async function loadPosts() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/social')
      const data = await res.json()
      if (data.ok) {
        setPosts(data.data || [])
      } else {
        toast.error(data.error || 'Failed to load social posts')
      }
    } catch {
      toast.error('Network error loading posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const togglePlatform = (p: string) => {
    setPlatforms(prev => 
      prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p]
    )
  }

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      toast.error('Title and Description are required')
      return
    }

    if (!postNow && !scheduledAt) {
      toast.error('Please specify a schedule date & time')
      return
    }

    setSubmitting(true)
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
        toast.success(data.message || 'Post saved successfully!')
        setTitle('')
        setDescription('')
        setMediaUrl('')
        setScheduledAt('')
        loadPosts()
      } else {
        toast.error(data.error || 'Failed to register post')
      }
    } catch {
      toast.error('Network error posting campaign')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to remove this post / schedule?')) return

    try {
      const res = await fetch(`/api/admin/social?id=${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.ok) {
        toast.success(data.message || 'Post removed successfully!')
        loadPosts()
      } else {
        toast.error(data.error || 'Failed to delete post')
      }
    } catch {
      toast.error('Network error deleting post')
    }
  }

  const publishedCount = posts.filter(p => p.status === 'PUBLISHED').length
  const scheduledCount = posts.filter(p => p.status === 'SCHEDULED').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Social Media Planner & Dispatch Center"
        description="Write spiritual posts, upload live video updates or puja images, broadcast them instantly or schedule them for festivals."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Social Media' }]}
      />

      {/* KPI stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Scheduled" value={scheduledCount.toString()} icon={Clock} iconClass="text-orange-500" />
        <KpiCard title="Dispatched Live" value={publishedCount.toString()} icon={CheckCircle2} iconClass="text-green-600" />
        <KpiCard title="Spiritual Reaches" value="48k+" icon={Share2} iconClass="text-blue-500" />
        <KpiCard title="Active Channels" value="4 Connected" icon={ShieldCheck} iconClass="text-amber-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Create Post Form */}
        <div className="lg:col-span-5">
          <Card className="rounded-3xl border shadow-sm overflow-hidden">
            <CardHeader className="bg-orange-50/20 border-b">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Send className="h-5 w-5 text-orange-600" /> Create Spiritual Campaign
              </CardTitle>
              <CardDescription className="text-xs">
                Write quotes, updates, video live links to publish to Facebook, Instagram, YouTube and Twitter.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleCreatePost} className="space-y-4">
                
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Campaign / Post Title *</Label>
                  <Input 
                    placeholder="e.g. Sawan Somwar Shiva Aarti live updates" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    required 
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Caption & Description * (Supports hashtags)</Label>
                  <Textarea
                    placeholder="Describe the blessings, dynamic mantra chanting guidelines, and puja significance..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Media URL (Video Link / Image Link)</Label>
                  <Input 
                    placeholder="e.g. 4589 || '' or youtube embed url" 
                    value={mediaUrl} 
                    onChange={e => setMediaUrl(e.target.value)} 
                  />
                </div>

                {/* Target Channels */}
                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-xs font-bold">Select Platforms (प्लेटफार्म्स)</Label>
                  <div className="flex flex-wrap gap-2">
                    {['facebook', 'instagram', 'youtube', 'twitter'].map(p => {
                      const selected = platforms.includes(p)
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => togglePlatform(p)}
                          className={"px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border " + (
                            selected 
                              ? 'bg-orange-600 border-orange-600 text-white shadow' 
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          )}
                        >
                          {p === 'youtube' ? '📹 ' : p === 'instagram' ? '📸 ' : '🌐 '}{p}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Schedule Options */}
                <div className="space-y-3 pt-2 border-t">
                  <Label className="text-xs font-bold">Dispatch Schedule (शेड्यूल चुनें)</Label>
                  <div className="flex gap-4 text-xs font-bold text-slate-700">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="radio" 
                        name="scheduleType" 
                        checked={postNow} 
                        onChange={() => setPostNow(true)} 
                        className="text-orange-600 focus:ring-orange-500" 
                      />
                      <span>Post Instantly (अभी भेजें)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="radio" 
                        name="scheduleType" 
                        checked={!postNow} 
                        onChange={() => setPostNow(false)} 
                        className="text-orange-600 focus:ring-orange-500" 
                      />
                      <span>Schedule Post (तारीख चुनें)</span>
                    </label>
                  </div>

                  {!postNow && (
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-slate-500">Pick Target Date & Time</Label>
                      <Input 
                        type="datetime-local" 
                        value={scheduledAt} 
                        onChange={e => setScheduledAt(e.target.value)} 
                        className="h-10" 
                      />
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  disabled={submitting} 
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold h-11 rounded-xl shadow mt-2"
                >
                  {submitting ? 'Registering post...' : postNow ? 'Publish Live Now' : 'Schedule for Festival'}
                </Button>

              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Planner Queue list */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Social Media Queue ({posts.length})</h3>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-600"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl text-slate-400 font-medium text-xs">
              Your social planner queue is empty. Use the form on the left to write one!
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((p) => {
                const isPublished = p.status === 'PUBLISHED'
                return (
                  <Card key={p.id} className="rounded-2xl border shadow-sm bg-white overflow-hidden group">
                    <div className="p-5 flex gap-4 items-start">
                      {p.mediaUrl ? (
                        <div className="h-16 w-24 rounded-lg bg-slate-100 overflow-hidden shrink-0 border relative">
                          <img src={p.mediaUrl} alt="" className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-black/10 flex items-center justify-center text-white">
                            {p.mediaUrl.includes('youtube') || p.mediaUrl.includes('video') ? <Video className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                          </div>
                        </div>
                      ) : (
                        <div className="h-16 w-24 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 border border-orange-100">
                          <Share2 className="h-6 w-6 opacity-40" />
                        </div>
                      )}

                      <div className="flex-1 space-y-1.5 text-left">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{p.title}</h4>
                          <span className={ "px-2 py-0.5 rounded-full text-[9px] font-bold " + (
                            isPublished 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-orange-100 text-orange-800'
                          ) }>
                            {p.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{p.description}</p>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t text-[10px] text-slate-400 font-semibold">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>Scheduled: {p.scheduledAt}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {p.platforms.map(plat => (
                              <span key={plat} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase text-[8px] font-bold">
                                {plat}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50/60 px-5 py-2.5 flex justify-end border-t">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50/50 rounded-xl h-8 text-[11px] font-bold gap-1"
                        onClick={() => handleDelete(p.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
