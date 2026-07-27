'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/admin/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Trash2, Edit2, Loader2, CalendarClock } from 'lucide-react'

interface PujaTimeSlot {
  id: string
  pujaId: string
  date: string
  startTime: string
  endTime: string
  capacity: number
  booked: number
  isActive: boolean
  puja?: { name: string }
}

interface PujaRef {
  id: string
  name: string
}

export default function PujaSlotsPage() {
  const [slots, setSlots] = useState<PujaTimeSlot[]>([])
  const [pujas, setPujas] = useState<PujaRef[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form states
  const [pujaId, setPujaId] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [capacity, setCapacity] = useState('10')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [slotsRes, pujasRes] = await Promise.all([
        fetch('/api/admin/puja-slots'),
        fetch('/api/admin/pujas')
      ])
      
      const slotsData = await slotsRes.json()
      const pujasData = await pujasRes.json()
      
      if (slotsData.ok) setSlots(slotsData.data || [])
      if (pujasData.ok) setPujas(pujasData.pujas || [])
    } catch {
      toast.error('Network error loading data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pujaId || !date || !startTime || !endTime) {
      toast.error('All fields are required')
      return
    }

    try {
      setSaving(true)
      const payload = {
        pujaId,
        date,
        startTime,
        endTime,
        capacity: Number(capacity)
      }

      const url = editingId ? `/api/admin/puja-slots?id=${editingId}` : '/api/admin/puja-slots'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (data.ok) {
        toast.success(editingId ? 'Slot updated!' : 'Slot created!')
        resetForm()
        fetchData()
      } else {
        toast.error(data.error || 'Failed to save slot')
      }
    } catch {
      toast.error('Network error saving slot')
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setPujaId('')
    setDate('')
    setStartTime('')
    setEndTime('')
    setCapacity('10')
  }

  const handleEdit = (slot: PujaTimeSlot) => {
    setEditingId(slot.id)
    setPujaId(slot.pujaId)
    setDate(new Date(slot.date).toISOString().split('T')[0])
    setStartTime(slot.startTime)
    setEndTime(slot.endTime)
    setCapacity(slot.capacity.toString())
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this slot?')) return

    try {
      const res = await fetch(`/api/admin/puja-slots?id=${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Slot deleted')
        fetchData()
      } else {
        toast.error(data.error || 'Failed to delete slot')
      }
    } catch {
      toast.error('Network error deleting slot')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Puja Time Slots"
        description="Manage capacity and availability for scheduled pujas."
        breadcrumbs={[{ label: 'Pujas', href: '/admin/pujas' }, { label: 'Slots' }]}
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Form panel */}
        <Card className="md:col-span-1 h-fit">
          <CardContent className="p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingId ? 'Edit Time Slot' : 'Add Time Slot'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label>Select Puja *</Label>
                <Select value={pujaId} onValueChange={setPujaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a puja..." />
                  </SelectTrigger>
                  <SelectContent>
                    {pujas.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time *</Label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time *</Label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Max Capacity</Label>
                <Input
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : editingId ? 'Update Slot' : 'Add Slot'}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* List panel */}
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-orange-600" />
              Scheduled Slots
            </h3>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">No time slots found. Create one above.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b text-muted-foreground font-medium text-xs bg-slate-50/50">
                      <th className="p-3">Puja</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Time</th>
                      <th className="p-3 text-center">Capacity</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {slots.map((slot) => (
                      <tr key={slot.id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-3 font-semibold text-slate-900">{slot.puja?.name}</td>
                        <td className="p-3 text-xs text-muted-foreground">{new Date(slot.date).toLocaleDateString()}</td>
                        <td className="p-3 text-xs font-mono text-orange-600">{slot.startTime} - {slot.endTime}</td>
                        <td className="p-3 text-xs text-center text-slate-600">
                          {slot.booked} / {slot.capacity}
                        </td>
                        <td className="p-3 text-right space-x-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-700" onClick={() => handleEdit(slot)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700" onClick={() => handleDelete(slot.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
