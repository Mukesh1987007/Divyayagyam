'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/admin/page-header'
import { KpiCard } from '@/components/admin/kpi-card'
import { DataTableShell } from '@/components/admin/data-table-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { HeartHandshake, TrendingUp, Wallet, Star, Key, MessageSquare, Trash2, Loader2, Edit2, Plus } from 'lucide-react'
import { toast } from 'sonner'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  
  // Forms & Modal states
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeUser, setActiveUser] = useState<any>(null)
  const [actionType, setActionType] = useState<'password' | 'whatsapp' | 'create' | 'edit' | null>(null)

  // Fields state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  async function loadCustomers() {
    try {
      const res = await fetch('/api/admin/customers')
      const data = await res.json()
      if (data.ok) {
        setCustomers(data.data || [])
      }
    } catch {
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  function startEdit(user: any) {
    setActiveUser(user)
    setActionType('edit')
    setName(user.name)
    setEmail(user.email)
    setPhone(user.phone === 'Not Configured' ? '' : user.phone)
    setShowAddForm(true)
  }

  function startCreate() {
    setActiveUser(null)
    setActionType('create')
    setName('')
    setEmail('')
    setPhone('')
    setPassword('')
    setShowAddForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setActing(true)

    try {
      const payload: Record<string, any> = {
        action: actionType,
        name,
        email,
        phone,
      }

      if (actionType === 'create') {
        payload.newPassword = password
      } else if (actionType === 'edit') {
        payload.action = 'update'
        payload.userId = activeUser.id
      }

      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.ok) {
        toast.success(data.message || 'Operation successful!')
        setShowAddForm(false)
        setActionType(null)
        loadCustomers()
      } else {
        toast.error(data.error || 'Operation failed')
      }
    } catch {
      toast.error('Network error during operation')
    } finally {
      setActing(false)
    }
  }

  async function handleActionClick(user: any, type: 'password' | 'whatsapp') {
    setActiveUser(user)
    setActionType(type)
    setPassword('')
    setPhone('')
  }

  async function handlePasswordOrWhatsappSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!activeUser || !actionType) return

    setActing(true)
    try {
      if (actionType === 'whatsapp') {
        let phoneNum = activeUser.phone || ''
        // Clean the phone number (remove spaces, +, -, etc. for wa.me)
        phoneNum = phoneNum.replace(/\D/g, '')
        // Assume Indian number if no country code provided and it's 10 digits
        if (phoneNum.length === 10) {
          phoneNum = '91' + phoneNum
        }
        
        const message = phone // the message is stored in the 'phone' state variable in this form
        if (!message) {
           toast.error('Message body is required')
           setActing(false)
           return
        }

        const whatsappUrl = `https://wa.me/${phoneNum}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank')
        
        toast.success(`Opening WhatsApp for ${activeUser.name}...`)
        setActionType(null)
        setActiveUser(null)
        return
      }

      const payload: Record<string, any> = {
        action: actionType,
        userId: activeUser.id,
      }
      if (actionType === 'password') payload.newPassword = password

      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.ok) {
        toast.success(data.message || 'Success!')
        setActionType(null)
        setActiveUser(null)
      } else {
        toast.error(data.error || 'Failed')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setActing(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to permanently remove this customer from both the database and Supabase Auth?')) return
    try {
      const res = await fetch(`/api/admin/customers?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Customer deleted successfully')
        loadCustomers()
      } else {
        toast.error(data.error || 'Delete failed')
      }
    } catch {
      toast.error('Network error deleting customer')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registered Devotees"
        description="View platform metrics and perform customer admin operations (Reset Password, Send WhatsApp Alerts, Remove Accounts)."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Customers' }]}
        action={{
          label: showAddForm ? 'Cancel' : 'Add Devotee',
          icon: Plus,
          onClick: showAddForm ? () => setShowAddForm(false) : startCreate,
        }}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Customers" value={customers.length.toString()} icon={HeartHandshake} />
        <KpiCard title="Active Segments" value="1" icon={TrendingUp} />
        <KpiCard title="Wallet Balance" value="₹0" icon={Wallet} />
        <KpiCard title="Top Rewarded" value="0" icon={Star} />
      </div>

      {showAddForm && (actionType === 'create' || actionType === 'edit') && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {actionType === 'create' ? <Plus className="h-5 w-5 text-primary" /> : <Edit2 className="h-5 w-5 text-primary" />}
              {actionType === 'create' ? 'Create New Devotee Profile' : 'Edit Devotee Profile Details'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 max-w-2xl">
              <div className="space-y-2">
                <Label htmlFor="custName">Devotee Full Name *</Label>
                <Input id="custName" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custEmail">Email Address *</Label>
                <Input id="custEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custPhone">WhatsApp Number *</Label>
                <Input id="custPhone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="e.g. +919587171984" />
              </div>
              {actionType === 'create' && (
                <div className="space-y-2">
                  <Label htmlFor="custPass">Account Password *</Label>
                  <Input id="custPass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Minimum 6 characters" />
                </div>
              )}
              <div className="sm:col-span-2 pt-2">
                <Button type="submit" disabled={acting}>
                  {acting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {actionType === 'create' ? 'Register Devotee' : 'Save Profiles Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeUser && (actionType === 'password' || actionType === 'whatsapp') && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {actionType === 'password' ? <Key className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
              {actionType === 'password' ? 'Reset Devotee Password' : 'Send WhatsApp Alert'}
            </CardTitle>
            <CardDescription>
              Performing operation on: <span className="font-semibold text-foreground">{activeUser.name}</span> ({activeUser.email})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordOrWhatsappSubmit} className="space-y-4 max-w-md">
              {actionType === 'password' && (
                <div className="space-y-2">
                  <Label htmlFor="passInput">Enter New Password</Label>
                  <Input
                    id="passInput"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              )}

              {actionType === 'whatsapp' && (
                <div className="space-y-2">
                  <Label htmlFor="msgInput">WhatsApp Message Body</Label>
                  <Input
                    id="msgInput"
                    placeholder="e.g. Jai Shri Krishna! Use coupon CODE108 for 10% off."
                    value={phone} // borrowing state variable
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={acting}>
                  {acting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm
                </Button>
                <Button type="button" variant="outline" onClick={() => { setActionType(null); setActiveUser(null) }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTableShell
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'WhatsApp / Phone' },
            { key: 'bookings', label: 'Bookings' },
            { key: 'orders', label: 'Orders' },
            {
              key: 'actions',
              label: 'Admin Actions',
              render: (r) => (
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2 text-xs flex gap-1"
                    onClick={() => startEdit(r)}
                  >
                    <Edit2 className="h-3 w-3" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2 text-xs flex gap-1"
                    onClick={() => handleActionClick(r, 'password')}
                  >
                    <Key className="h-3 w-3" /> Password
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2 text-xs flex gap-1 text-green-700 hover:text-green-800"
                    disabled={r.phone === 'Not Configured'}
                    onClick={() => handleActionClick(r, 'whatsapp')}
                  >
                    <MessageSquare className="h-3 w-3" /> WhatsApp
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={() => handleDelete(r.id)}
                    title="Delete Account"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ),
            },
          ]}
          rows={customers}
        />
      )}
    </div>
  )
}
