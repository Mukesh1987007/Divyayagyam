'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/admin/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Send, FileSpreadsheet, Download, CheckCircle2, Megaphone, HelpCircle } from 'lucide-react'

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'csv' | 'direct'>('direct')
  
  // CSV tab states
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [result, setResult] = useState<any>(null)

  // Direct Broadcast states
  const [broadcastType, setBroadcastType] = useState('PUJA')
  const [broadcastChannels, setBroadcastChannels] = useState('both')
  const [broadcastTitle, setBroadcastTitle] = useState('')
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [broadcasting, setBroadcasting] = useState(false)
  const [broadcastResult, setBroadcastResult] = useState<any>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setCsvFile(file)
      toast.success(`CSV file selected: ${file.name}`)
    }
  }

  async function handleBulkSend(e: React.FormEvent) {
    e.preventDefault()
    if (!csvFile) {
      toast.error('Please upload a CSV file first')
      return
    }

    setSending(true)
    setResult(null)

    const formData = new FormData()
    formData.append('file', csvFile)
    formData.append('message', message)

    try {
      const res = await fetch('/api/admin/notifications/csv', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Bulk notifications sent successfully!')
        setResult(data)
        setCsvFile(null)
        setMessage('')
      } else {
        toast.error(data.error || 'Failed to dispatch notifications')
      }
    } catch {
      toast.error('Network error uploading CSV')
    } finally {
      setSending(false)
    }
  }

  async function handleDirectBroadcast(e: React.FormEvent) {
    e.preventDefault()
    if (!broadcastTitle || !broadcastMessage) {
      toast.error('Please enter Title and Message')
      return
    }

    setBroadcasting(true)
    setBroadcastResult(null)

    try {
      const res = await fetch('/api/admin/notifications/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: broadcastType,
          channels: broadcastChannels,
          title: broadcastTitle,
          message: broadcastMessage
        })
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Direct Broadcast completed!')
        setBroadcastResult(data)
        setBroadcastTitle('')
        setBroadcastMessage('')
      } else {
        toast.error(data.error || 'Broadcast failed')
      }
    } catch {
      toast.error('Network error executing broadcast')
    } finally {
      setBroadcasting(false)
    }
  }

  function downloadSampleCSV() {
    const csvContent = 'data:text/csv;charset=utf-8,name,email,phone,message\nRahul Sharma,rahul@example.com,+919587171984,Jai Shri Ram {name}! Your Somwar Puja starts in 1 hour.\nAnjali Verma,anjali@example.com,+918888888888,Namaste {name}! Receive your prasad updates here.'
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'divyayagyam_notification_sample.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Sample CSV downloaded!')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Spiritual Broadcast Center"
        description="Notify all devotee customers instantly on Email, WhatsApp and SMS about new pujas, upcoming offers or festivals."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Notifications' }]}
      />

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b pb-1">
        <button
          onClick={() => setActiveTab('direct')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${activeTab === 'direct' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500'}`}
        >
          Direct Broadcast (सीधे सबको भेजें)
        </button>
        <button
          onClick={() => setActiveTab('csv')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${activeTab === 'csv' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500'}`}
        >
          Bulk CSV Import (लिस्ट अपलोड करें)
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {activeTab === 'direct' ? (
          <Card className="border-2 border-primary/20 rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
                <Megaphone className="h-5 w-5 text-orange-600" /> WhatsApp & Email Broadcast
              </CardTitle>
              <CardDescription className="text-xs">
                Select category and notification channel. The message will go to all registered devotees automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDirectBroadcast} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Broadcast Event / Type</Label>
                    <Select value={broadcastType} onValueChange={setBroadcastType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUJA">Upcoming Puja (आगामी पूजा)</SelectItem>
                        <SelectItem value="PRODUCT">New Product (नया उत्पाद)</SelectItem>
                        <SelectItem value="OFFER">Special Offer (विशेष छूट)</SelectItem>
                        <SelectItem value="FESTIVAL">Festival Alert (त्योहार)</SelectItem>
                        <SelectItem value="GENERAL">General Announcement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Channels</Label>
                    <Select value={broadcastChannels} onValueChange={setBroadcastChannels}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both">Email & WhatsApp (दोनों पर)</SelectItem>
                        <SelectItem value="email">Email Only (केवल ईमेल)</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp Only (केवल व्हाट्सएप)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bTitle">Broadcast Title / Subject</Label>
                  <Input
                    id="bTitle"
                    placeholder="e.g. Sawan Somwar Special Rudrabhishek Booking Live!"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bMsg">Message Content</Label>
                  <Textarea
                    id="bMsg"
                    placeholder="Enter the broadcast message to send..."
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    required
                    rows={5}
                  />
                </div>

                <Button type="submit" disabled={broadcasting} className="w-full bg-orange-600 hover:bg-orange-700">
                  {broadcasting ? (
                    <span className="flex items-center justify-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Broadcasting to everyone…
                    </span>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Send Broadcast to All Customers
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-primary/20 rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
                <FileSpreadsheet className="h-5 w-5 text-primary" /> Bulk Send via CSV Upload
              </CardTitle>
              <CardDescription className="text-xs">
                Upload a custom CSV contact list for targeted client updates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBulkSend} className="space-y-4">
                <div className="space-y-2">
                  <Label>1. Download Sample Layout</Label>
                  <div>
                    <Button type="button" variant="outline" size="sm" onClick={downloadSampleCSV} className="gap-1.5 rounded-xl">
                      <Download className="h-4 w-4" /> Download Sample CSV
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="csvFile">2. Upload Contact CSV File</Label>
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                    required
                  />
                  <p className="text-[10px] text-muted-foreground">Required columns: name, email, phone, message</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">3. Default Template Message (Fallback)</Label>
                  <Textarea
                    id="message"
                    placeholder="Use variables like {name} in the message text. This message will be sent if the CSV row does not contain a custom message."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button type="submit" disabled={sending} className="w-full bg-slate-900 hover:bg-slate-800">
                  {sending ? (
                    <span className="flex items-center justify-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending CSV alerts…
                    </span>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Dispatch Bulk Notifications
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">Dispatch Logs & Console Reports</CardTitle>
            <CardDescription className="text-xs">Verify delivery counts and recipient logs in real-time.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {broadcastResult && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs flex gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Broadcast Success!</span>
                    <span className="block mt-1">{broadcastResult.message}</span>
                  </div>
                </div>
                
                {broadcastResult.details?.recipients && (
                  <div className="border rounded-xl p-3 bg-slate-50 space-y-2 max-h-80 overflow-y-auto">
                    <span className="font-bold text-[10px] text-slate-600 block uppercase">Recipients Dispatch Queue:</span>
                    {broadcastResult.details.recipients.map((rec: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-[10px] border-b pb-1">
                        <div>
                          <span className="font-bold text-slate-700">{rec.name}</span>
                          <span className="text-slate-500 block">{rec.email}</span>
                        </div>
                        <Badge className="bg-green-600 text-white font-mono">{rec.phone}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {result && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs flex gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">CSV Dispatch Success!</span>
                    <span className="block mt-1">{result.message}</span>
                  </div>
                </div>

                {result.details?.recipients && (
                  <div className="border rounded-xl p-3 bg-slate-50 space-y-2 max-h-80 overflow-y-auto">
                    <span className="font-bold text-[10px] text-slate-600 block uppercase">Recipients Dispatch Queue:</span>
                    {result.details.recipients.map((rec: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-[10px] border-b pb-1">
                        <div>
                          <span className="font-bold text-slate-700">{rec.name}</span>
                          <span className="text-slate-500 block">{rec.email}</span>
                        </div>
                        <Badge className="bg-green-600 text-white font-mono">{rec.phone}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!result && !broadcastResult && (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                <HelpCircle className="h-10 w-10 opacity-30 mb-2" />
                <span className="text-xs">No broadcast has been dispatched yet.</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
