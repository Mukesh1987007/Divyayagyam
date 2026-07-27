'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PageHeader } from '@/components/admin/page-header'
import { KpiCard } from '@/components/admin/kpi-card'
import { DataTableShell } from '@/components/admin/data-table-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Package, AlertTriangle, FileSpreadsheet, Download, Upload, Trash2, Edit2, Loader2, Plus, Star } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

function ProductsManager() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get('tab') || 'all'

  const [products, setProducts] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [importing, setImporting] = useState(false)
  const [showImportForm, setShowImportForm] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)

  async function loadProducts() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/products')
      const data = await res.json()
      if (data.ok) {
        setProducts(data.data || [])
      }
    } catch {
      toast.error('Failed to load products list')
    } finally {
      setLoading(false)
    }
  }

  async function loadReviews() {
    try {
      setLoadingReviews(true)
      const res = await fetch('/api/admin/reviews')
      const data = await res.json()
      if (data.ok) {
        setReviews(data.data || [])
      }
    } catch {
      toast.error('Failed to load reviews')
    } finally {
      setLoadingReviews(false)
    }
  }

  useEffect(() => {
    loadProducts()
    if (activeTab === 'reviews') {
      loadReviews()
    }
  }, [activeTab])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setCsvFile(file)
      toast.success(`CSV selected: ${file.name}`)
    }
  }

  async function handleImport(e: React.FormEvent) {
    e.preventDefault()
    if (!csvFile) return

    setImporting(true)
    const formData = new FormData()
    formData.append('file', csvFile)

    try {
      const res = await fetch('/api/admin/products/csv', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.ok) {
        toast.success(data.message || 'CSV imported successfully!')
        setShowImportForm(false)
        setCsvFile(null)
        loadProducts()
      } else {
        toast.error(data.error || 'Import failed')
      }
    } catch {
      toast.error('Network error uploading CSV')
    } finally {
      setImporting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Product deleted successfully')
        loadProducts()
      } else {
        toast.error(data.error || 'Failed to delete')
      }
    } catch {
      toast.error('Network error deleting product')
    }
  }

  async function handleDeleteReview(id: string) {
    if (!confirm('Are you sure you want to remove this product review?')) return
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Review removed successfully')
        loadReviews()
      } else {
        toast.error(data.error || 'Failed to delete')
      }
    } catch {
      toast.error('Network error deleting review')
    }
  }

  function downloadTemplateCSV() {
    const csvContent = 'data:text/csv;charset=utf-8,name,slug,category,sku,shortDescription,description,price,salePrice,weight,stock\n5 Mukhi Rudraksha,5-mukhi-rudraksha,Prasad,RUD-5M-001,Pure 5 Mukhi Nepal Rudraksha,Blessed Nepalese 5 Mukhi bead,500,450,2.5,150\nPuja Samagri Kit,puja-samagri-kit,Samagri,KIT-SAM-002,Complete Puja Samagri Pack,Essential pack containing agarbatti matchbox kumkum,1200,999,500,50'
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'divyayagyam_product_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Product template CSV downloaded!')
  }

  // KPI aggregates
  const activeCount = products.filter(p => p.status === 'ACTIVE').length
  const lowStockCount = products.filter(p => p.stock < 10).length

  const tabs = [
    { label: 'All Products', value: 'all' },
    { label: 'Inventory', value: 'inventory' },
    { label: 'Reviews & Feedback', value: 'reviews' }
  ]

  const changeTab = (val: string) => {
    if (val === 'inventory') {
      router.push('/admin/products/inventory')
    } else {
      router.push(`/admin/products?tab=${val}`)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products & Samagri"
        description="Prasad, holy rudrakshas, divine samagri, and spiritual accessories."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Products' }]}
        action={activeTab === 'all' ? {
          label: showImportForm ? 'Cancel' : 'Bulk CSV Import',
          icon: FileSpreadsheet,
          onClick: () => setShowImportForm(!showImportForm),
        } : undefined}
        secondaryAction={{
          label: 'Add Product',
          href: '/admin/products/new',
        }}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard title="Total Products" value={products.length.toString()} icon={ShoppingBag} />
        <KpiCard title="Active Items" value={activeCount.toString()} icon={Package} iconClass="text-green-600" />
        <KpiCard title="Low Stock Alerts" value={lowStockCount.toString()} icon={AlertTriangle} iconClass="text-red-500 animate-pulse" />
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b pb-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => changeTab(t.value)}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all shrink-0 ${activeTab === t.value ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'all' && showImportForm && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" /> Import Products via Spreadsheet
            </CardTitle>
            <CardDescription>
              Upload a CSV file containing your product information. Automatically creates categories and maps inventory stock.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleImport} className="space-y-4 max-w-md">
              <div className="space-y-1">
                <Button type="button" variant="outline" size="sm" onClick={downloadTemplateCSV} className="gap-1.5">
                  <Download className="h-4 w-4" /> Download Template CSV
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="csvFileInput">Choose CSV File</Label>
                <Input
                  id="csvFileInput"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                  required
                />
                <p className="text-[10px] text-muted-foreground">Headers: name, slug, category, sku, shortDescription, description, price, salePrice, weight, stock</p>
              </div>

              <Button type="submit" disabled={importing}>
                {importing ? (
                  <span className="flex items-center justify-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing products…
                  </span>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" /> Start Import
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : activeTab === 'all' ? (
        <DataTableShell
          columns={[
            { key: 'name', label: 'Product Name' },
            { key: 'sku', label: 'SKU' },
            { key: 'category', label: 'Category' },
            { key: 'price', label: 'Price' },
            {
              key: 'stock',
              label: 'In Stock',
              render: (r) => (
                <Badge variant={r.stock < 10 ? 'destructive' : 'secondary'}>
                  {r.stock} left
                </Badge>
              ),
            },
            {
              key: 'status',
              label: 'Status',
              render: (r) => (
                <Badge
                  variant={r.status === 'ACTIVE' ? 'success' : 'secondary'}
                  className={r.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : ''}
                >
                  {r.status}
                </Badge>
              ),
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (r) => (
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" asChild>
                    <Link href={`/admin/products/new?id=${r.id}`}>
                      <Edit2 className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={() => handleDelete(r.id)}
                    title="Delete Product"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ),
            },
          ]}
          rows={products}
        />
      ) : activeTab === 'reviews' ? (
        loadingReviews ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <DataTableShell
            columns={[
              { key: 'product', label: 'Product' },
              { key: 'user', label: 'Devotee / Customer' },
              { key: 'rating', label: 'Rating' },
              { key: 'comment', label: 'Comment / Review' },
              { key: 'date', label: 'Date' },
              {
                key: 'actions',
                label: 'Actions',
                render: (r) => (
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => handleDeleteReview(r.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )
              }
            ]}
            rows={reviews}
            searchPlaceholder="Search reviews..."
          />
        )
      ) : null}
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    }>
      <ProductsManager />
    </Suspense>
  )
}
