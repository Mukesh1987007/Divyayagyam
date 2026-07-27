'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/admin/page-header'
import { DataTableShell } from '@/components/admin/data-table-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Trash2, Edit2 } from 'lucide-react'

export default function ProductCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form fields
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

  async function loadCategories() {
    try {
      const res = await fetch('/api/admin/product-categories')
      const data = await res.json()
      if (data.ok) {
        setCategories(data.data || [])
      }
    } catch {
      toast.error('Failed to load product categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  // Auto slugify name
  useEffect(() => {
    if (!editingId) {
      setSlug(name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))
    }
  }, [name, editingId])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !slug.trim()) return

    setSaving(true)
    try {
      const res = await fetch('/api/admin/product-categories', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId || undefined,
          name,
          slug,
        }),
      })
      const data = await res.json()
      if (data.ok) {
        toast.success(editingId ? 'Category updated successfully!' : 'Category created successfully!')
        setShowAddForm(false)
        setEditingId(null)
        setName('')
        setSlug('')
        loadCategories()
      } else {
        toast.error(data.error || 'Failed to save category')
      }
    } catch {
      toast.error('Network error saving category')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this category?')) return
    try {
      const res = await fetch(`/api/admin/product-categories?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Category deleted successfully')
        loadCategories()
      } else {
        toast.error(data.error || 'Failed to delete')
      }
    } catch {
      toast.error('Network error deleting category')
    }
  }

  function handleEdit(cat: any) {
    setEditingId(cat.id)
    setName(cat.name)
    setSlug(cat.slug)
    setShowAddForm(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Categories"
        description="Create and organize categories for your product catalog."
        breadcrumbs={[{ label: 'Products', href: '/admin/products' }, { label: 'Categories' }]}
        action={{
          label: showAddForm ? 'Cancel' : 'Add Category',
          onClick: () => {
            setShowAddForm(!showAddForm)
            if (showAddForm) {
              setEditingId(null)
              setName('')
              setSlug('')
            }
          }
        }}
      />

      {showAddForm && (
        <Card className="max-w-md border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{editingId ? 'Edit Category' : 'Create New Category'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="catName">Category Name *</Label>
                <Input
                  id="catName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rudraksha Mala"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="catSlug">Slug (URL) *</Label>
                <Input
                  id="catSlug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="rudraksha-mala"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/95 text-white" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? 'Save Changes' : 'Create Category'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTableShell
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'slug', label: 'Slug' },
            {
              key: 'actions',
              label: 'Actions',
              render: (row: any) => (
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" className="h-8 w-8 text-blue-600" onClick={() => handleEdit(row)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDelete(row.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            }
          ]}
          rows={categories}
        />
      )}
    </div>
  )
}
