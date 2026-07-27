'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/admin/page-header'
import { KpiCard } from '@/components/admin/kpi-card'
import { DataTableShell } from '@/components/admin/data-table-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, AlertTriangle, TrendingDown, FileSpreadsheet, Download, Upload, Loader2, Save, X } from 'lucide-react'
import { toast } from 'sonner'

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [showImportForm, setShowImportForm] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)

  // Quick edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQty, setEditQty] = useState('')
  const [editWarehouse, setEditWarehouse] = useState('')

  async function loadInventory() {
    try {
      const res = await fetch('/api/admin/inventory')
      const data = await res.json()
      if (data.ok) {
        setInventory(data.data || [])
      }
    } catch {
      toast.error('Failed to load inventory levels')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [])

  function startEditing(item: any) {
    setEditingId(item.id)
    setEditQty(item.quantity.toString())
    setEditWarehouse(item.warehouse)
  }

  async function saveStock(id: string) {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          quantity: Number(editQty),
          warehouse: editWarehouse,
        }),
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Stock levels updated!')
        setEditingId(null)
        loadInventory()
      } else {
        toast.error(data.error || 'Failed to save updates')
      }
    } catch {
      toast.error('Network error updating stock')
    } finally {
      setSaving(false)
    }
  }

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
      const res = await fetch('/api/admin/inventory/csv', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.ok) {
        toast.success(data.message || 'Inventory updated successfully!')
        setShowImportForm(false)
        setCsvFile(null)
        loadInventory()
      } else {
        toast.error(data.error || 'Import failed')
      }
    } catch {
      toast.error('Network error uploading CSV')
    } finally {
      setImporting(false)
    }
  }

  function downloadTemplateCSV() {
    // Generate simple sample csv
    const sample = 'data:text/csv;charset=utf-8,sku,quantity,warehouse\nRUD-5M-001,250,Main Warehouse\nKIT-SAM-002,15,Delhi Hub\nIDL-GAN-003,5,Mumbai Store'
    const encodedUri = encodeURI(sample)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'divyayagyam_inventory_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Inventory template CSV downloaded!')
  }

  // KPI Calculations
  const lowStockCount = inventory.filter((i) => i.quantity > 0 && i.quantity < 10).length
  const oosCount = inventory.filter((i) => i.quantity === 0).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory & Stock Allocation"
        description="Verify and edit stock levels across all active product SKUs. Bulk load updates via spreadsheet imports."
        breadcrumbs={[{ label: 'Products', href: '/admin/products' }, { label: 'Inventory' }]}
        action={{
          label: showImportForm ? 'Cancel' : 'Bulk CSV Update',
          icon: FileSpreadsheet,
          onClick: () => setShowImportForm(!showImportForm),
        }}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard title="Total SKUs" value={inventory.length.toString()} icon={Package} />
        <KpiCard title="Low Stock (<10)" value={lowStockCount.toString()} icon={TrendingDown} iconClass="text-orange-500" />
        <KpiCard title="Out of Stock" value={oosCount.toString()} icon={AlertTriangle} iconClass="text-red-500 animate-pulse" />
      </div>

      {showImportForm && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" /> Bulk Update Stock levels via CSV
            </CardTitle>
            <CardDescription>
              Upload a CSV spreadsheet with updated stock numbers to sync items instantly. Unknown SKUs will be safely skipped.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleImport} className="space-y-4 max-w-md">
              <div className="space-y-1">
                <Button type="button" variant="outline" size="sm" onClick={downloadTemplateCSV} className="gap-1.5">
                  <Download className="h-4 w-4" /> Download Sample CSV
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
                <p className="text-[10px] text-muted-foreground">Required columns: sku, quantity, warehouse</p>
              </div>

              <Button type="submit" disabled={importing}>
                {importing ? (
                  <span className="flex items-center justify-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating Stock…
                  </span>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" /> Start Stock Sync
                  </>
                )}
              </Button>
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
            {
              key: 'sku',
              label: 'SKU',
              render: (r) => (
                <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded border">
                  {r.sku}
                </code>
              ),
            },
            { key: 'product', label: 'Holy Item / Product' },
            {
              key: 'quantity',
              label: 'Quantity (Stock)',
              render: (r) => (
                <div className="flex items-center gap-2">
                  {editingId === r.id ? (
                    <Input
                      type="number"
                      value={editQty}
                      onChange={(e) => setEditQty(e.target.value)}
                      className="w-20 h-8 text-xs font-semibold"
                    />
                  ) : (
                    <Badge variant={r.quantity === 0 ? 'destructive' : r.quantity < 10 ? 'outline' : 'secondary'}>
                      {r.quantity} available
                    </Badge>
                  )}
                </div>
              ),
            },
            { key: 'reserved', label: 'Reserved / Booked' },
            {
              key: 'warehouse',
              label: 'Warehouse Node',
              render: (r) => (
                <div>
                  {editingId === r.id ? (
                    <Input
                      value={editWarehouse}
                      onChange={(e) => setEditWarehouse(e.target.value)}
                      className="w-40 h-8 text-xs"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">{r.warehouse}</span>
                  )}
                </div>
              ),
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (r) => (
                <div>
                  {editingId === r.id ? (
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 text-green-600 hover:text-green-700"
                        onClick={() => saveStock(r.id)}
                        disabled={saving}
                      >
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 text-red-500"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2.5 text-xs"
                      onClick={() => startEditing(r)}
                    >
                      Quick Edit
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
          rows={inventory}
        />
      )}
    </div>
  )
}
