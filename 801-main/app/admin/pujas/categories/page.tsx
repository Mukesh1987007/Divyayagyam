'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/admin/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Trash2, Edit2, Plus, Loader2 } from 'lucide-react'

interface PujaCategory {
  id: string
  name: string
  slug: string
  description?: string
}

export default function PujaCategoriesPage() {
  const [categories, setCategories] = useState<PujaCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/puja-categories')
      const data = await res.json()
      if (data.ok) {
        setCategories(data.data || [])
      } else {
        toast.error(data.error || 'Failed to load categories')
      }
    } catch {
      toast.error('Network error loading categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Auto-slugify name
  useEffect(() => {
    if (!editingId) {
      setSlug(name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))
    }
  }, [name, editingId])

  // Save Category (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Category Name is required')
      return
    }

    try {
      setSaving(true)
      const payload = {
        name,
        slug: slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
        description
      }

      const url = editingId ? `/api/admin/puja-categories?id=${editingId}` : '/api/admin/puja-categories'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (data.ok) {
        toast.success(editingId ? 'Category updated successfully!' : 'Category created successfully!')
        setName('')
        setSlug('')
        setDescription('')
        setEditingId(null)
        fetchCategories()
      } else {
        toast.error(data.error || 'Failed to save category')
      }
    } catch {
      toast.error('Network error saving category')
    } finally {
      setSaving(false)
    }
  }

  // Edit category trigger
  const handleEdit = (cat: PujaCategory) => {
    setEditingId(cat.id)
    setName(cat.name)
    setSlug(cat.slug)
    setDescription(cat.description || '')
  }

  // Delete category
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const res = await fetch(`/api/admin/puja-categories?id=${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Category deleted successfully')
        fetchCategories()
      } else {
        toast.error(data.error || 'Failed to delete category')
      }
    } catch {
      toast.error('Network error deleting category')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Puja Categories"
        description="Organize pujas into categories and sub-categories."
        breadcrumbs={[{ label: 'Pujas', href: '/admin/pujas' }, { label: 'Categories' }]}
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Form panel */}
        <Card className="md:col-span-1 h-fit">
          <CardContent className="p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingId ? 'Edit Category' : 'Add New Category'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label>Category Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shiva Pujas"
                />
              </div>

              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. shiva-pujas"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : editingId ? 'Update' : 'Add'}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null)
                      setName('')
                      setSlug('')
                      setDescription('')
                    }}
                  >
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
            <h3 className="text-base font-bold text-slate-900 mb-4">Categories List</h3>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
              </div>
            ) : categories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">No categories found. Create one above.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b text-muted-foreground font-medium text-xs bg-slate-50/50">
                      <th className="p-3">Name</th>
                      <th className="p-3">Slug</th>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-3 font-semibold text-slate-900">{cat.name}</td>
                        <td className="p-3 text-xs text-muted-foreground">{cat.slug}</td>
                        <td className="p-3 text-xs text-muted-foreground max-w-[200px] truncate">{cat.description || '—'}</td>
                        <td className="p-3 text-right space-x-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-700" onClick={() => handleEdit(cat)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700" onClick={() => handleDelete(cat.id)}>
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
