'use client'
import React from 'react';

import { PageHeader } from '@/components/admin/page-header'
import { AdminTabs } from '@/components/admin/admin-tabs'
import { AiChat, type ChatMode } from '@/components/ai-chat'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSearchParams } from 'next/navigation'
import { Bot, Wand2, Newspaper, Sparkles, Palette, MessageCircleQuestion } from 'lucide-react'

const MODE_CONFIG: Record<string, { mode: ChatMode; title: string; description: string; placeholder: string; suggestions: string[] }> = {
  '': {
    mode: 'admin_content',
    title: 'AI Chat',
    description: 'General-purpose AI assistant (Gemini 2.5 Pro).',
    placeholder: 'Draft a temple description for Kashi Vishwanath…',
    suggestions: ['Write product description for 5 Mukhi Rudraksha', 'Draft an email to donors for Gaushala campaign', 'Explain the significance of Sawan Somvar'],
  },
  content: {
    mode: 'admin_content',
    title: 'Content Generator',
    description: 'Product descriptions, temple copy, marketing content.',
    placeholder: 'Generate description for Maha Rudrabhishek puja package…',
    suggestions: ['Product description for Ganesh idol', 'Temple description for Somnath', 'Marketing copy for VIP puja package'],
  },
  blog: {
    mode: 'admin_blog',
    title: 'Blog Generator',
    description: 'Full articles with SEO structure (Gemini 2.5 Pro).',
    placeholder: 'Write a blog on "Benefits of daily meditation for busy professionals"…',
    suggestions: ['Blog on the science behind chanting Om', 'Guide to Ekadashi vrats', 'History of Kashi Vishwanath temple'],
  },
  seo: {
    mode: 'admin_seo',
    title: 'SEO Assistant',
    description: 'Meta tags, keyword clusters, schema suggestions.',
    placeholder: 'Generate SEO meta for /pujas/maha-rudrabhishek page…',
    suggestions: ['Meta tags for Ganesh Chaturthi puja page', 'Keyword cluster for "online puja booking"', 'Schema markup for temple listing'],
  },
  image: {
    mode: 'admin_content',
    title: 'Image Prompt Generator',
    description: 'Craft prompts for image generators (Gemini helps you write them).',
    placeholder: 'Generate an image prompt for a Sawan Somvar hero banner…',
    suggestions: ['Prompt for Ganesh Chaturthi festival banner', 'Prompt for spiritual meditation illustration'],
  },
  support: {
    mode: 'admin_content',
    title: 'Customer Support AI',
    description: 'Draft polite, on-brand replies to customer tickets.',
    placeholder: 'Draft a reply to a customer asking about prasad delivery time…',
    suggestions: ['Reply for delayed booking refund', 'Reply thanking donor for Gaushala contribution'],
  },
}

const TOOLS = [
  { key: '', label: 'AI Chat', icon: Bot },
  { key: 'content', label: 'Content', icon: Wand2 },
  { key: 'blog', label: 'Blog', icon: Newspaper },
  { key: 'seo', label: 'SEO', icon: Sparkles },
  { key: 'image', label: 'Image', icon: Palette },
  { key: 'support', label: 'Support', icon: MessageCircleQuestion },
]

function AiPage_Content() {
  const params = useSearchParams()
  const tab = params.get('tab') || ''
  const config = MODE_CONFIG[tab] || MODE_CONFIG['']

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Assistant"
        description="AI-powered content, SEO, blog & customer support. Powered by Gemini 2.5."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'AI' }]}
      />
      <AdminTabs tabs={TOOLS.map((t) => ({ label: t.label, value: t.key }))} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AiChat
            key={config.mode + tab}
            mode={config.mode}
            emptyTitle={config.title}
            emptyDescription={config.description}
            placeholder={config.placeholder}
            suggestions={config.suggestions}
            streamHeight="h-[540px]"
          />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">AI Tools</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {TOOLS.map((t) => {
                const Icon = t.icon
                const active = t.key === tab
                return (
                  <a
                    key={t.key}
                    href={t.key ? `/admin/ai?tab=${t.key}` : '/admin/ai'}
                    className={`flex items-center gap-3 p-2.5 rounded-md text-sm transition-colors ${active ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </a>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">💡 Pro Tips</CardTitle></CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>• Blog & Content tabs use <b>Gemini 2.5 Pro</b> for depth.</p>
              <p>• Other tabs use <b>Gemini 2.5 Flash</b> for speed.</p>
              <p>• Shift+Enter for a new line. Enter to send.</p>
              <p>• Click 📋 on any response to copy it.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


export default function AiPage() {
  return (
    <React.Suspense fallback={<div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#FF8C21]"></div></div>}>
      <AiPage_Content />
    </React.Suspense>
  )
}
