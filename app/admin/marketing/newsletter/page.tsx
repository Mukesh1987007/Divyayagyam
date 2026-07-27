'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/admin/page-header'
import { DataTableShell } from '@/components/admin/data-table-shell'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, Send } from 'lucide-react'

export default function NewsletterPage() {
  const [subs, setSubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    async function loadSubs() {
      try {
        const res = await fetch('/api/newsletter')
        const data = await res.json()
        if (data.ok) {
          setSubs(data.data || [])
        } else {
          toast.error(data.error || 'Failed to load newsletter subscribers')
        }
      } catch {
        toast.error('Network error loading subscribers')
      } finally {
        setLoading(false)
      }
    }
    loadSubs()
  }, [])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!subject || !message) {
      toast.error('Please enter both subject and message')
      return
    }

    setSending(true)
    try {
      const res = await fetch('/api/admin/marketing/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message }),
      })
      const data = await res.json()
      
      if (data.ok) {
        toast.success(data.message)
        setSubject('')
        setMessage('')
      } else {
        toast.error(data.error || 'Failed to send newsletter')
      }
    } catch {
      toast.error('Network error while sending newsletter')
    } finally {
      setSending(false)
    }
  }

  const activeCount = subs.filter(s => s.isActive).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Newsletter System"
        description="View subscribers and send bulk email announcements."
        breadcrumbs={[{ label: 'Marketing', href: '/admin/marketing' }, { label: 'Newsletter' }]}
      />
      
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compose Newsletter</CardTitle>
                <CardDescription>
                  Send an email to {activeCount} active subscribers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSend} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Subject Line</Label>
                    <Input 
                      placeholder="Enter email subject" 
                      value={subject} 
                      onChange={(e) => setSubject(e.target.value)}
                      disabled={sending}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Content</Label>
                    <Textarea 
                      placeholder="Write your newsletter content here..." 
                      className="min-h-[250px]"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={sending}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={sending || activeCount === 0}>
                    {sending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {sending ? 'Sending...' : 'Send Newsletter'}
                  </Button>
                  {activeCount === 0 && (
                    <p className="text-xs text-orange-600 text-center">No active subscribers to send to.</p>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-1">
              <DataTableShell
                columns={[
                  { key: 'email', label: 'Email Address' },
                  { 
                    key: 'isActive', 
                    label: 'Status', 
                    render: (r) => (
                      <Badge variant={r.isActive ? 'success' : 'secondary'} className={r.isActive ? 'bg-green-100 text-green-800' : ''}>
                        {r.isActive ? 'Active' : 'Unsubscribed'}
                      </Badge>
                    ) 
                  },
                  { 
                    key: 'subscribedAt', 
                    label: 'Subscribed On',
                    render: (r) => new Date(r.subscribedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })
                  },
                ]}
                rows={subs}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

