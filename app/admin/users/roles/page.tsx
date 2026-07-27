'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/admin/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShieldCheck, ShieldAlert, Loader2, Plus, Edit, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const PERMISSION_GROUPS = [
  { title: 'Temple & Puja', permissions: ['temple.*', 'puja.*'], description: 'Manage temples, pujas, slots and pujari schedules.' },
  { title: 'Bookings', permissions: ['booking.*'], description: 'View and update devotees booking details.' },
  { title: 'Store & Products', permissions: ['product.*', 'order.*'], description: 'Manage product listing, store orders, inventory and shipping.' },
  { title: 'Content & CMS', permissions: ['blog.*', 'gallery.*', 'testimonial.*', 'event.*', 'media.*', 'cms.*', 'seo.*'], description: 'Manage blogs, sliders, events and gallery images.' },
  { title: 'Finance & Payments', permissions: ['payment.*', 'bhaktiSeva.*', 'report.*', 'analytics.*'], description: 'Access payments details, refunds, and bhaktiSeva logs.' },
  { title: 'Customer Support', permissions: ['support.*'], description: 'View customer contact tickets and feedback.' },
  { title: 'User Management', permissions: ['user.*', 'security.read'], description: 'Manage customers and other user profiles.' },
  { title: 'Marketing & Settings', permissions: ['marketing.*', 'notification.*', 'storage.*', 'settings.*'], description: 'Create discount codes, offers, push alerts and configure main settings.' }
]

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog & Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function loadData() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/users/roles')
      const data = await res.json()
      if (data.ok) {
        setRoles(data.roles)
      }
    } catch (err) {
      toast.error('Failed to load roles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function startCreate() {
    setEditingRoleId(null)
    setIsEditing(false)
    setName('')
    setDescription('')
    setSelectedPermissions([])
    setIsDialogOpen(true)
  }

  function startEdit(role: any) {
    if (role.slug === 'super_admin') {
      toast.error('Super Admin role cannot be edited')
      return
    }
    setEditingRoleId(role.id)
    setIsEditing(true)
    setName(role.name)
    setDescription(role.description || '')
    
    // Map existing permissions of role
    if (role.permissions) {
      const existingPerms = role.permissions.map((p: any) => p.permission.slug)
      setSelectedPermissions(existingPerms)
    } else {
      setSelectedPermissions([])
    }
    
    setIsDialogOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name) {
      toast.error('Role name is required')
      return
    }

    try {
      setIsSubmitting(true)
      const url = '/api/admin/users/roles'
      const method = isEditing ? 'PATCH' : 'POST'
      
      const payload: any = {
        name,
        description,
        selectedPermissions
      }

      if (isEditing) {
        payload.id = editingRoleId
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.ok) {
        toast.success(isEditing ? 'Role updated successfully!' : 'Role created successfully!')
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
        title="Roles & Permissions"
        description="Manage built-in and custom roles. Assign granular permissions to control access across the platform."
        breadcrumbs={[{ label: 'Users', href: '/admin/users' }, { label: 'Roles' }]}
        action={{ 
          label: 'Create Role', 
          icon: Plus,
          onClick: startCreate 
        }}
      />

      {/* CREATE / EDIT ROLE DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Role' : 'Create Custom Role'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Modify the role name, description, and permissions.' : 'Create a new template role with specific access rights.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Role Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. VIP Manager" required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description of this role" />
              </div>
            </div>

            {/* Custom Granular Rights Section */}
            <div className="space-y-3 border-t pt-4">
              <Label className="text-sm font-semibold flex items-center gap-1.5"><Shield className="h-4 w-4 text-primary" /> Assign Rights / Modules Access</Label>
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
              {isEditing ? 'Save Role Settings' : 'Create Role'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => {
            const isSuperAdmin = role.slug === 'super_admin'
            const perms = role.permissions?.map((p: any) => p.permission.slug) || []
            
            return (
              <Card key={role.id} className={isSuperAdmin ? 'border-amber-200 bg-amber-50/10' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {isSuperAdmin ? <ShieldAlert className="h-5 w-5 text-amber-500" /> : <ShieldCheck className="h-4 w-4 text-primary" />}
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {role.name}
                          {role.isSystem && <Badge variant="secondary" className="text-[9px] h-4 px-1">System</Badge>}
                        </CardTitle>
                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{role.description}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3 text-xs border-b pb-2">
                    <span className="text-muted-foreground">Active Users:</span>
                    <span className="font-semibold">{role._count?.users || 0}</span>
                  </div>
                  <p className="text-[10px] font-medium uppercase mb-2 text-slate-500">Assigned Permissions</p>
                  <div className="flex flex-wrap gap-1 min-h-[40px]">
                    {perms.includes('*') ? (
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[10px]">ALL Access 🌟</Badge>
                    ) : perms.length > 0 ? (
                      <>
                        {perms.slice(0, 5).map((p: string) => (
                          <Badge key={p} variant="outline" className="text-[9px] bg-slate-50">{p}</Badge>
                        ))}
                        {perms.length > 5 && (
                          <Badge variant="secondary" className="text-[9px]">+{perms.length - 5}</Badge>
                        )}
                      </>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">No permissions assigned</span>
                    )}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button 
                      variant={isSuperAdmin ? "ghost" : "outline"}
                      size="sm"
                      className={isSuperAdmin ? "opacity-50 cursor-not-allowed" : ""}
                      onClick={() => !isSuperAdmin && startEdit(role)}
                      disabled={isSuperAdmin}
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" /> Edit Role
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
