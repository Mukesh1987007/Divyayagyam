import { PageHeader } from '@/components/admin/page-header'
import { AdminTabs } from '@/components/admin/admin-tabs'
import { DataTableShell } from '@/components/admin/data-table-shell'
export const revalidate = 60; // ISR: Revalidate every 60s

export default function BlogCommentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Blog Comments" description="Moderate comments across all posts."
        breadcrumbs={[{ label: 'Blog', href: '/admin/blog' }, { label: 'Comments' }]} />
      <AdminTabs tabs={[{ label: 'All' }, { label: 'Pending', value: 'pending' }, { label: 'Approved', value: 'approved' }, { label: 'Spam', value: 'spam' }]} />
      <DataTableShell
        columns={[
          { key: 'user', label: 'User' }, { key: 'comment', label: 'Comment' },
          { key: 'post', label: 'Post' }, { key: 'status', label: 'Status' }, { key: 'date', label: 'Date' },
        ]}
        rows={[]}
      />
    </div>
  )
}
