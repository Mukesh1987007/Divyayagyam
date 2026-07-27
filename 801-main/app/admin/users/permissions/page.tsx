"use client"

import { PageHeader } from '@/components/admin/page-header'
import { DataTableShell } from '@/components/admin/data-table-shell'
import { Badge } from '@/components/ui/badge'
import { DEFAULT_PERMISSIONS } from '@/lib/rbac'

export default function PermissionsPage() {
  const set = new Set<string>()
  Object.values(DEFAULT_PERMISSIONS).forEach((arr) => arr.forEach((p) => set.add(p)))
  const rows = Array.from(set).sort().map((p) => {
    const [resource, action] = p.split('.')
    return { key: p, permission: p, resource, action }
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Permissions"
        description={`${rows.length} granular permissions across the platform.`}
        breadcrumbs={[{ label: 'Users', href: '/admin/users' }, { label: 'Permissions' }]}
      />
      <DataTableShell
        columns={[
          { key: 'permission', label: 'Permission', render: (r) => <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{r.permission}</code> },
          { key: 'resource', label: 'Resource', render: (r) => <Badge variant="outline">{r.resource}</Badge> },
          { key: 'action', label: 'Action' },
        ]}
        rows={rows}
        searchPlaceholder="Search permissions…"
      />
    </div>
  )
}
