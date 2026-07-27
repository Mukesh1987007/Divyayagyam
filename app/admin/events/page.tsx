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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2, Calendar, Video, MapPin, Upload, Edit2, Send, FileSpreadsheet, Cloud } from 'lucide-react'
import { convertGoogleDriveUrl } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [temples, setTemples] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  // Edit states
  const [editId, setEditId] = useState<string | null>(null)

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [location, setLocation] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [isLive, setIsLive] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)
  const [streamUrl, setStreamUrl] = useState('')
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [templeId, setTempleId] = useState('none')
  const [driveUrl, setDriveUrl] = useState('')

  // Notification states
  const [notifyEventId, setNotifyEventId] = useState<string | null>(null)
  const [notifyFile, setNotifyFile] = useState<File | null>(null)
  const [notifyMessage, setNotifyMessage] = useState('')
  const [sendingNotify, setSendingNotify] = useState(false)

  async function loadEventsAndTemples() {
    try {
      const [resEvents, resTemples] = await Promise.all([
        fetch('/api/admin/events'),
        fetch('/api/admin/temples')
      ])
      const dataEvents = await resEvents.json()
      const dataTemples = await resTemples.json()
      if (dataEvents.ok) setEvents(dataEvents.data || [])
      if (dataTemples.ok) setTemples(dataTemples.data || [])
    } catch {
      toast.error('Failed to load events data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEventsAndTemples()
  }, [])

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
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
        setCoverImage(data.url)
        toast.success('Cover image uploaded!')
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch {
      toast.error('Network error uploading image')
    } finally {
      setUploading(false)
    }
  }

  function handleDriveAdd() {
    if (!driveUrl) return
    const convertedUrl = convertGoogleDriveUrl(driveUrl)
    setCoverImage(convertedUrl)
    setDriveUrl('')
    toast.success('Drive link applied as cover!')
  }

  // Format date helper for input type="datetime-local"
  const formatDateForInput = (dStr: string) => {
    if (!dStr) return ''
    const d = new Date(dStr)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !startsAt) return

    setSaving(true)
    try {
      const method = editId ? 'PUT' : 'POST'
      const payload: any = {
        title,
        description,
        coverImage,
        location,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        isLive,
        isFeatured,
        streamUrl,
        isVideoEnabled,
        templeId: templeId === 'none' ? null : templeId,
      }
      if (editId) payload.id = editId

      const url = editId ? `/api/admin/events?id=${editId}` : '/api/admin/events'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.ok) {
        toast.success(editId ? 'Event updated successfully!' : 'Event created and scheduled successfully!')
        setShowAddForm(false)
        resetForm()
        loadEventsAndTemples()
      } else {
        toast.error(data.error || 'Failed to save event')
      }
    } catch {
      toast.error('Network error saving event')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(event: any) {
    setEditId(event.id)
    setTitle(event.title)
    setDescription(event.description || '')
    setCoverImage(event.coverImage || '')
    setLocation(event.location || '')
    setStartsAt(formatDateForInput(event.startsAt))
    setEndsAt(formatDateForInput(event.endsAt))
    setIsLive(!!event.isLive)
    setIsFeatured(!!event.isFeatured)
    setStreamUrl(event.streamUrl || '')
    setIsVideoEnabled(event.isVideoEnabled !== undefined ? !!event.isVideoEnabled : true)
    setTempleId(event.templeId || 'none')
    setShowAddForm(true)
  }

  function startCreate() {
    resetForm()
    setShowAddForm(true)
  }

  function resetForm() {
    setEditId(null)
    setTitle('')
    setDescription('')
    setCoverImage('')
    setLocation('')
    setStartsAt('')
    setEndsAt('')
    setIsLive(false)
    setIsFeatured(false)
    setStreamUrl('')
    setIsVideoEnabled(true)
    setTempleId('none')
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this event?')) return
    try {
      const res = await fetch(`/api/admin/events?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Event deleted successfully')
        loadEventsAndTemples()
      } else {
        toast.error(data.error || 'Failed to delete event')
      }
    } catch {
      toast.error('Network error deleting event')
    }
  }

  async function handleSendNotifications(e: React.FormEvent) {
    e.preventDefault()
    if (!notifyEventId || !notifyFile) return

    setSendingNotify(true)
    const formData = new FormData()
    formData.append('file', notifyFile)
    formData.append('eventId', notifyEventId)
    formData.append('messageTemplate', notifyMessage)

    try {
      const res = await fetch('/api/admin/events/notify', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.ok) {
        toast.success(data.data.message)
        setNotifyEventId(null)
        setNotifyFile(null)
        setNotifyMessage('')
      } else {
        toast.error(data.error || 'Failed to send notifications')
      }
    } catch {
      toast.error('Network error sending notifications')
    } finally {
      setSendingNotify(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Spiritual Events & Live Streams"
        description="Schedule live aarti broadcasts, virtual festivals, and dynamic temple programs."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Events' }]}
        action={{
          label: showAddForm ? 'Cancel' : 'Add Event',
          icon: Plus,
          onClick: showAddForm ? () => setShowAddForm(false) : startCreate,
        }}
      />

      {showAddForm && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> {editId ? 'Edit Scheduled Event' : 'Schedule New Event'}
            </CardTitle>
            <CardDescription>Configure festival timings, livestream urls and location details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Sawan Somwar Maha Aarti"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location / Venue</Label>
                <Input
                  id="location"
                  placeholder="e.g. Somnath Temple, Gujarat"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between sm:col-span-2 pt-2">
                <Label className="cursor-pointer">Mark as Featured Event</Label>
                <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
              </div>

              <div className="flex items-center justify-between sm:col-span-2 pt-2">
                <Label className="cursor-pointer">Enable Video</Label>
                <Switch checked={isVideoEnabled} onCheckedChange={setIsVideoEnabled} />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Associated Temple (Optional)</Label>
                <Select value={templeId} onValueChange={setTempleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Temple" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None / Independent Event</SelectItem>
                    {temples.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startsAt">Starts At (Date & Time)</Label>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endsAt">Ends At (Optional)</Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Event Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide an overview of the event..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Event Cover Image</Label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-24 rounded border bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                    {coverImage ? (
                      <img src={coverImage} alt="Cover Preview" className="h-full w-full object-cover" />
                    ) : (
                      <MapPin className="h-6 w-6 text-muted-foreground opacity-50" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="cursor-pointer inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 text-sm font-medium gap-2">
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {uploading ? 'Uploading…' : 'Upload Cover'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverUpload}
                        disabled={uploading}
                      />
                    </label>
                    <div className="flex items-center gap-2 mt-2">
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
                </div>
              </div>

              <div className="sm:col-span-2 pt-2">
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editId ? 'Update Event' : 'Schedule Event'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <DataTableShell
          columns={[
            {
              key: 'coverImage',
              label: 'Cover',
              render: (r) => (
                <div className="h-10 w-16 rounded bg-slate-100 border overflow-hidden">
                  {r.coverImage ? (
                    <img src={r.coverImage} alt={r.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-slate-200" />
                  )}
                </div>
              ),
            },
            { key: 'title', label: 'Event Title' },
            { 
              key: 'location', 
              label: 'Location/Temple', 
              render: (r) => <span>{r.temple?.name || r.location}</span> 
            },
            {
              key: 'startsAt',
              label: 'Starts At',
              render: (r) => <span>{new Date(r.startsAt).toLocaleString('en-IN')}</span>,
            },
            {
              key: 'isLive',
              label: 'Broadcast',
              render: (r) => (
                <Badge variant={r.isLive ? 'success' : 'secondary'}>
                  {r.isLive ? '🔴 LIVE' : 'Offline'}
                </Badge>
              ),
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (r) => (
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 text-green-600"
                    onClick={() => setNotifyEventId(r.id)}
                    title="Send Notifications (CSV)"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-blue-600"
                    onClick={() => startEdit(r)}
                    title="Edit Event"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={() => handleDelete(r.id)}
                    title="Delete Event"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ),
            },
          ]}
          rows={events}
        />
      )}

      {/* Notification Modal */}
      <Dialog open={!!notifyEventId} onOpenChange={(open) => !open && setNotifyEventId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send WhatsApp/Email Notifications</DialogTitle>
            <DialogDescription>
              Upload a CSV file containing columns like "Name", "Phone", "Email". We will dispatch notifications to all valid rows.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendNotifications} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Upload Contact CSV File</Label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 text-sm font-medium gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  {notifyFile ? notifyFile.name : 'Select .csv file'}
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => setNotifyFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Custom Message Template (Optional)</Label>
              <Textarea
                placeholder="e.g. Hello {Name}, join us for the LIVE aarti today!"
                value={notifyMessage}
                onChange={(e) => setNotifyMessage(e.target.value)}
                rows={3}
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" disabled={!notifyFile || sendingNotify} className="bg-green-600 hover:bg-green-700 text-white">
                {sendingNotify ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {sendingNotify ? 'Dispatching...' : 'Dispatch Notifications'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
