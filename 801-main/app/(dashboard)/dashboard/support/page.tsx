import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import SupportClient from './client'
export const revalidate = 60; // ISR: Revalidate every 60s

export default async function SupportPage() {
  const user = await getCurrentUser()
  if (!user?.id) return null

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customer Support</h1>
        <p className="text-muted-foreground text-sm">Need help? Raise a complaint or support ticket.</p>
      </div>

      <SupportClient initialTickets={tickets} />
    </div>
  )
}

