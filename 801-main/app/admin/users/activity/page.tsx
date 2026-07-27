'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/admin/page-header'
import { DataTableShell } from '@/components/admin/data-table-shell'
import { Loader2 } from 'lucide-react'

export default function UserActivityPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/audit-logs')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setLogs(data.data || [])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Login History & Activity"
        description="Audit trail of user logins and admin actions."
        breadcrumbs={[{ label: 'Users', href: '/admin/users' }, { label: 'Activity' }]}
      />
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <DataTableShell
          columns={[
            { key: 'user', label: 'User' },
            { key: 'action', label: 'Action' },
            { key: 'ip', label: 'IP Address' },
            { key: 'ua', label: 'Device / User Agent' },
            { key: 'time', label: 'Time' },
          ]}
          rows={logs}
          searchPlaceholder="Search logs by action or user…"
        />
      )}
    </div>
  )
}
