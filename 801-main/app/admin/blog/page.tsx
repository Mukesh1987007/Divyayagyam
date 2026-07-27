'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PageHeader } from '@/components/admin/page-header'
import { KpiCard } from '@/components/admin/kpi-card'
import { DataTableShell } from '@/components/admin/data-table-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Newspaper, FileText, MessageSquare, Eye, Trash2, Edit2, Loader2, Search, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

function BlogManager() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get('tab') || 'all'

  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function loadPosts() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/blog')
      const data = await res.json()
      if (data.ok) {
        setPosts(data.data || [])
      }
    } catch {
      toast.error('Failed to load blog posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to permanently delete this post?')) return
    try {
      const res = await fetch(`/api/admin/blog?id=${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Article deleted successfully')
        loadPosts()
      } else {
        toast.error(data.error || 'Failed to delete')
      }
    } catch {
      toast.error('Network error deleting post')
    }
  }

  // Filter based on active tab
  const filteredPosts = posts.filter((p) => {
    if (activeTab === 'published') return p.status === 'PUBLISHED'
    if (activeTab === 'drafts') return p.status === 'DRAFT'
    if (activeTab === 'archived') return p.status === 'ARCHIVED'
    return true
  })

  const tabs = [
    { label: 'All Articles', value: 'all' },
    { label: 'Published (लाइव)', value: 'published' },
    { label: 'Drafts (ड्राफ्ट)', value: 'drafts' }
  ]

  const changeTab = (val: string) => {
    router.push(`/admin/blog?tab=${val}`)
  }

  const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog & CMS Management"
        description="Manage articles, search tags, meta-keyword titles and page descriptions."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Blog' }]}
        action={{ label: 'New Post', href: '/admin/blog/new' }}
        secondaryAction={{ label: 'Categories', href: '/admin/blog/categories' }}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Posts" value={posts.length.toString()} icon={Newspaper} />
        <KpiCard title="Published" value={posts.filter(p => p.status === 'PUBLISHED').length.toString()} icon={FileText} iconClass="text-green-600" />
        <KpiCard title="Total Views" value={totalViews.toString()} icon={Eye} iconClass="text-blue-500" />
        <KpiCard title="Feedback Comments" value="0" icon={MessageSquare} iconClass="text-orange-500" />
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

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
        </div>
      ) : (
        <DataTableShell
          columns={[
            { key: 'title', label: 'Article Title', render: (r) => <span className="font-bold text-slate-800">{r.title}</span> },
            { key: 'category', label: 'Category' },
            {
              key: 'seo',
              label: 'SEO Audit (Keywords & Tags)',
              render: (r) => (
                <div className="flex flex-col text-[10px] max-w-xs gap-0.5">
                  <span className="font-bold text-orange-600 truncate" title={r.seoTitle}>Meta Title: {r.seoTitle || 'Missing ⚠️'}</span>
                  <span className="text-slate-500 truncate" title={r.seoDescription}>Desc: {r.seoDescription || 'Missing ⚠️'}</span>
                </div>
              )
            },
            {
              key: 'status',
              label: 'Status',
              render: (r) => (
                <Badge variant={r.status === 'PUBLISHED' ? 'success' : 'secondary'}>
                  {r.status}
                </Badge>
              )
            },
            { key: 'views', label: 'Views (👀)' },
            { key: 'publishedAt', label: 'Published On' },
            {
              key: 'actions',
              label: 'Actions',
              render: (r) => (
                <div className="flex gap-1.5">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" asChild>
                    <Link href={`/admin/blog/new?id=${r.id}`}>
                      <Edit2 className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            }
          ]}
          rows={filteredPosts}
          searchPlaceholder="Search articles..."
        />
      )}
    </div>
  )
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
      </div>
    }>
      <BlogManager />
    </Suspense>
  )
}
