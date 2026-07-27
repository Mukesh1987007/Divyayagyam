'use client'
import React from 'react';

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/admin/page-header'
import { AdminTabs } from '@/components/admin/admin-tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const TABS = [
  { label: 'Hero Slider', value: 'hero' }, // Will link to /admin/cms/hero
  { label: 'About', value: 'about' },
  { label: 'Privacy', value: 'privacy' },
  { label: 'Terms', value: 'terms' },
  { label: 'Refund', value: 'refund' },
  { label: 'FAQs', value: 'faqs' }
]

function CmsPage_Content() {
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'about'

  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const settingKey = `cms.${currentTab}`

  useEffect(() => {
    async function fetchContent() {
      setLoading(true)
      try {
        const res = await fetch('/api/settings')
        const data = await res.json()
        if (data.ok) {
          setContent(data.data.settings[settingKey] || '')
        }
      } catch {
        toast.error('Failed to load content')
      } finally {
        setLoading(false)
      }
    }
    
    // Skip fetching if it's the hero tab
    if (currentTab !== 'hero') {
      fetchContent()
    } else {
      setLoading(false)
    }
  }, [currentTab, settingKey])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: { [settingKey]: content }
        })
      })
      const data = await res.json()
      if (data.ok) {
        toast.success(`${currentTab} content saved successfully!`)
      } else {
        toast.error('Failed to save content')
      }
    } catch {
      toast.error('Network error saving content')
    } finally {
      setSaving(false)
    }
  }

  if (currentTab === 'hero') {
    return (
      <div className="space-y-6">
        <PageHeader title="CMS — Content Management" description="Edit every page and section of the website."
          breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'CMS' }]} />
        <AdminTabs tabs={TABS} />
        <Card>
          <CardHeader>
            <CardTitle>Hero Slider Management</CardTitle>
            <CardDescription>Manage the main banner images on the homepage.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/cms/hero">Go to Hero Slider Manager</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="CMS — Content Management" description="Edit every page and section of the website."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'CMS' }]} />
      <AdminTabs tabs={TABS} />
      
      <Card>
        <CardHeader>
          <CardTitle className="capitalize">{currentTab} Page Content</CardTitle>
          <CardDescription>You can use standard Markdown or HTML to format this text.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <Textarea
                className="min-h-[400px] font-mono text-sm p-4"
                placeholder={`Write the ${currentTab} content here...`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


export default function CmsPage() {
  return (
    <React.Suspense fallback={<div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#FF8C21]"></div></div>}>
      <CmsPage_Content />
    </React.Suspense>
  )
}
