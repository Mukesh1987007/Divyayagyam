import { PageHeader } from '@/components/admin/page-header'
import { DataTableShell } from '@/components/admin/data-table-shell'
export const revalidate = 60; // ISR: Revalidate every 60s

export default function CustomPagesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Custom Pages" description="Create arbitrary static/dynamic pages."
        breadcrumbs={[{ label: 'CMS', href: '/admin/cms' }, { label: 'Custom Pages' }]}
        action={{ label: 'New Page' }} />
      <DataTableShell
        columns={[
          { key: 'title', label: 'Title' }, { key: 'slug', label: 'Slug' },
          { key: 'status', label: 'Status' }, { key: 'updatedAt', label: 'Updated' },
        ]}
        rows={[]}
      />
    </div>
  )
}
