'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Loader2, Send, MessageSquare } from 'lucide-react'

export default function SupportClient({ initialTickets }: { initialTickets: any[] }) {
  const [loading, setLoading] = useState(false)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, description, category: 'Complaint' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit')
      
      toast.success('Support ticket submitted successfully!')
      setSubject('')
      setDescription('')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* TICKET FORM */}
      <Card>
        <CardHeader>
          <CardTitle>Submit a Complaint / Query</CardTitle>
          <CardDescription>We will respond to your ticket within 24 hours.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input 
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Order not received" 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe your issue in detail..." 
                rows={4}
                required 
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Submit Ticket
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* PAST TICKETS */}
      <Card>
        <CardHeader>
          <CardTitle>Your Tickets</CardTitle>
          <CardDescription>Track the status of your past queries.</CardDescription>
        </CardHeader>
        <CardContent>
          {initialTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-center">
              <MessageSquare className="h-10 w-10 mb-3 opacity-50" />
              <p className="text-sm">No tickets found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {initialTickets.map(ticket => (
                <div key={ticket.id} className="p-4 border rounded-lg bg-card">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h4 className="font-semibold text-sm">{ticket.subject}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">#{ticket.ticketNumber} • {format(new Date(ticket.createdAt), 'dd MMM yyyy')}</p>
                    </div>
                    <Badge variant={ticket.status === 'OPEN' ? 'default' : 'secondary'}>{ticket.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-2">{ticket.description}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
