'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/admin/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Edit, Trash2, Code, ShieldAlert, Star } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

export default function ToolsListPage() {
  const [tools, setTools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTools = async () => {
    try {
      const res = await fetch('/api/admin/tools')
      const data = await res.json()
      if (data.ok) setTools(data.data || [])
    } catch (err) {
      toast.error('Failed to load tools')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTools()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tool?')) return
    try {
      const res = await fetch(`/api/admin/tools?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.ok) {
        toast.success('Tool deleted')
        fetchTools()
      } else {
        toast.error(data.error || 'Failed to delete')
      }
    } catch (err) {
      toast.error('Network error')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Tools Management" 
        description="Manage your custom HTML/JS tools or map React code components."
        action={{ label: "Add New Tool", href: "/admin/tools/new" }}
      />

      {loading ? (
        <div className="text-center py-10">Loading tools...</div>
      ) : tools.length === 0 ? (
        <Card className="text-center py-20 border-dashed">
          <CardContent>
            <div className="text-muted-foreground mb-4">No tools found.</div>
            <Button asChild variant="outline">
              <Link href="/admin/tools/new">Create your first tool</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Card key={tool.id} className="relative overflow-hidden group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
                    <Code className="h-6 w-6" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/tools/new?id=${tool.id}`}><Edit className="h-4 w-4" /></Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(tool.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-1 mb-4">
                  <h3 className="font-bold text-lg text-slate-800">{tool.name}</h3>
                  <p className="text-sm text-slate-500">Slug: {tool.slug}</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <Badge variant={tool.isActive ? 'default' : 'secondary'}>
                    {tool.isActive ? 'Active' : 'Draft'}
                  </Badge>
                  {tool.isFree ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Free Tool
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-100 flex items-center gap-1">
                      <Star className="h-3 w-3" /> Premium (Rs. {tool.price})
                    </Badge>
                  )}
                  {(!tool.htmlCode || tool.htmlCode.length < 10) && (
                     <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                       <Code className="h-3 w-3" /> Code Mapped
                     </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
