'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/admin/page-header'
import { DataTableShell } from '@/components/admin/data-table-shell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ShieldAlert, ShieldCheck, Loader2, Plus, Ban, CheckCircle, Edit, Key, Shield } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const PERMISSION_GROUPS = [
  {
    title: 'Temple & Puja',
    permissions: ['temple.*', 'puja.*'],
    description: 'Manage temples, pujas, slots and pujari schedules.'
  },
  {
    title: 'Bookings',
    permissions: ['booking.*'],
    description: 'View and update devotees booking details.'
  },
  {
    title: 'Store & Products',
    permissions: ['product.*', 'order.*'],
    description: 'Manage product listing, store orders, inventory and shipping.'
  },
  {
    title: 'Content & CMS',
    permissions: ['blog.*', 'gallery.*', 'testimonial.*', 'event.*', 'media.*', 'cms.*', 'seo.*'],
    description: 'Manage blogs, sliders, events and gallery images.'
  },
  {
    title: 'Finance & Payments',
    permissions: ['payment.*', 'bhaktiSeva.*', 'report.*', 'analytics.*'],
    description: 'Access payments details, refunds, and bhaktiSeva logs.'
  },
  {
    title: 'Customer Support',
    permissions: ['support.*'],
    description: 'View customer contact tickets and feedback.'
  },
  {
    title: 'User Management',
    permissions: ['user.*', 'security.read'],
    description: 'Manage customers and other user profiles.'
  },
  {
    title: 'Marketing & Settings',
    permissions: ['marketing.*', 'notification.*', 'storage.*', 'settings.*'],
    description: 'Create discount codes, offers, push alerts and configure main settings.'
  }
]

export default function SubAdminsPage() {
  const [admins, setAdmins] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog & Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null)
  
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [roleId, setRoleId] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function loadData() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/users/admins')
      const data = await res.json()
      if (data.ok) {
        setAdmins(data.admins)
        setRoles(data.roles)
      }
    } catch (err) {
      toast.error('Failed to load sub-admins')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function startCreate() {
    setEditingAdminId(null)
    setIsEditing(false)
    setFullName('')
    setEmail('')
    setPassword('')
    setRoleId('')
    setSelectedPermissions([])
    setIsDialogOpen(true)
  }

  function startEdit(admin: any) {
    setEditingAdminId(admin.id)
    setIsEditing(true)
    setFullName(admin.fullName || '')
    setEmail(admin.email || '')
    setPassword('') // Password optional on update
    setRoleId(admin.roleId || '')
    
    // Map existing permissions of admin's role
    if (admin.role?.permissions) {
      const existingPerms = admin.role.permissions.map((p: any) => p.permission.slug)
      setSelectedPermissions(existingPerms)
    } else {
      setSelectedPermissions([])
    }
    
    setIsDialogOpen(true)
  }

  function handleRoleChange(selectedRoleId: string) {
    setRoleId(selectedRoleId)
    const matchedRole = roles.find(r => r.id === selectedRoleId)
    if (matchedRole) {
      const rolePerms = matchedRole.permissions.map((p: any) => p.permission.slug)
      setSelectedPermissions(rolePerms)
    } else {
      setSelectedPermissions([])
    }
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const newAction = currentStatus === 'SUSPENDED' ? 'activate' : 'suspend'
    const confirmMsg = newAction === 'suspend' 
      ? 'Are you sure you want to SUSPEND this admin? They will lose access immediately.'
      : 'Are you sure you want to RE-ACTIVATE this admin?'
      
    if (!confirm(confirmMsg)) return

    try {
      const res = await fetch('/api/admin/users/admins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: newAction })
      })
      const data = await res.json()
      if (data.ok) {
        toast.success(`Admin ${newAction}d successfully`)
        loadData()
      } else {
        toast.error(data.error || 'Failed to update status')
      }
    } catch (err) {
      toast.error('Network error')
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!email || (!password && !isEditing) || !roleId) {
      toast.error('Email, password, and role are required')
      return
    }

    try {
      setIsSubmitting(true)
      const url = '/api/admin/users/admins'
      const method = isEditing ? 'PATCH' : 'POST'
      
      const payload: any = {
        email,
        fullName,
        roleId,
        customPermissions: selectedPermissions
      }

      if (isEditing) {
        payload.id = editingAdminId
        payload.action = 'update'
      } else {
        payload.password = password
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.ok) {
        toast.success(isEditing ? 'Sub-Admin updated successfully!' : 'Sub-Admin created successfully!')
        setIsDialogOpen(false)
        loadData()
      } else {
        toast.error(data.error || 'Operation failed')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sub-Admins"
        description="Create and manage other administrators, assign their roles, and customize their modular rights."
        breadcrumbs={[{ label: 'Users', href: '/admin/users' }, { label: 'Sub-Admins' }]}
        action={{ 
          label: 'Create Admin', 
          icon: Plus,
          onClick: startCreate 
        }}
      />

      {/* CREATE / EDIT ADMIN DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Administrator Profile' : 'Create Sub-Admin'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Modify administrator details and override modular rights.' : 'Assign a template role and provide login credentials.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Rahul Sharma" required />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@domain.com" required />
              </div>
              <div className="space-y-2">
                <Label>Password {isEditing && '(Leave blank to keep current)'}</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label>Template Role (Authority Preset)</Label>
                <Select value={roleId} onValueChange={handleRoleChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Select Preset Role --" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name} ({r.slug})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Granular Rights Section */}
            <div className="space-y-3 border-t pt-4">
              <Label className="text-sm font-semibold flex items-center gap-1.5"><Shield className="h-4 w-4 text-primary" /> Customize Rights / Modules Access</Label>
              <div className="grid gap-4 sm:grid-cols-2 max-h-60 overflow-y-auto border p-3 rounded-md bg-slate-50/50">
                {PERMISSION_GROUPS.map(group => {
                  const isChecked = group.permissions.every(p => selectedPermissions.includes(p))
                  const isSomeChecked = !isChecked && group.permissions.some(p => selectedPermissions.includes(p))
                  
                  return (
                    <div key={group.title} className="flex items-start gap-2.5 p-2 rounded hover:bg-slate-200/50 transition-colors">
                      <input 
                        type="checkbox"
                        id={`perm-${group.title}`}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        checked={isChecked}
                        ref={(el) => {
                          if (el) el.indeterminate = isSomeChecked
                        }}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPermissions(prev => Array.from(new Set([...prev, ...group.permissions])))
                          } else {
                            setSelectedPermissions(prev => prev.filter(p => !group.permissions.includes(p)))
                          }
                        }}
                      />
                      <label htmlFor={`perm-${group.title}`} className="cursor-pointer">
                        <div className="text-xs font-bold text-slate-800">{group.title}</div>
                        <div className="text-[10px] text-muted-foreground leading-tight">{group.description}</div>
                      </label>
                    </div>
                  )
                })}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
              {isEditing ? 'Save Administrator Settings' : 'Create Administrator'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
        </div>
      ) : (
        <DataTableShell
          columns={[
            {
              key: 'name',
              label: 'Admin Details',
              render: (r) => (
                <div className="flex flex-col text-xs">
                  <span className="font-bold">{r.fullName || 'Unknown'}</span>
                  <span className="text-[10px] text-muted-foreground">{r.email}</span>
                </div>
              )
            },
            {
              key: 'role',
              label: 'Assigned Role',
              render: (r) => (
                <Badge variant="outline" className="font-mono text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                  {r.role?.name || 'No Role'}
                </Badge>
              )
            },
            {
              key: 'rights',
              label: 'Access Scope',
              render: (r) => {
                const slugs = r.role?.permissions?.map((p: any) => p.permission.slug) || []
                if (slugs.includes('*')) {
                  return <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[10px]">ALL Access 🌟</Badge>
                }
                const activeGroups = PERMISSION_GROUPS.filter(g => g.permissions.some(p => slugs.includes(p)))
                if (activeGroups.length === 0) return <span className="text-[10px] text-muted-foreground">None</span>
                return (
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {activeGroups.map(g => (
                      <span key={g.title} className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                        {g.title}
                      </span>
                    ))}
                  </div>
                )
              }
            },
            {
              key: 'status',
              label: 'Status',
              render: (r) => (
                <Badge variant={r.status === 'SUSPENDED' ? 'destructive' : 'success'}>
                  {r.status}
                </Badge>
              )
            },
            {
              key: 'actions',
              label: 'Access Control',
              render: (r) => (
                <div className="flex items-center gap-1.5">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 px-2.5 text-xs flex gap-1"
                    onClick={() => startEdit(r)}
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant={r.status === 'SUSPENDED' ? 'outline' : 'destructive'} 
                    className={r.status === 'SUSPENDED' ? 'text-green-600 border-green-200 hover:bg-green-50' : 'h-8 px-3'}
                    onClick={() => toggleStatus(r.id, r.status)}
                  >
                    {r.status === 'SUSPENDED' ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Re-Activate</>
                    ) : (
                      <><Ban className="h-3 w-3 mr-1" /> Suspend</>
                    )}
                  </Button>
                </div>
              )
            }
          ]}
          rows={admins}
          searchPlaceholder="Search admins by name or email..."
        />
      )}
    </div>
  )
}
