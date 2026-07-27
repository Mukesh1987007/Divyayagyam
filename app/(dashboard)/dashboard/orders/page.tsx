import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Calendar, Package } from 'lucide-react'
import Link from 'next/link'
export const revalidate = 60; // ISR: Revalidate every 60s

export default async function OrdersPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-muted-foreground text-sm">Track your purchases of sacred items and samagri.</p>
      </div>

      {orders.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="font-semibold text-lg">No Orders Yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
            You haven't ordered any spiritual products or puja samagri yet.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Browse Products
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        #{order.orderNumber}
                      </span>
                      <Badge variant={order.status === 'DELIVERED' ? 'success' : order.status === 'SHIPPED' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                      <Badge variant="outline">
                        Payment: {order.paymentStatus}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground pt-1 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Ordered: {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="space-y-1 md:text-right">
                    <p className="text-xs text-muted-foreground">Order Total</p>
                    <p className="text-lg font-extrabold text-primary">₹{Number(order.total).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="border-t border-border/40 mt-4 pt-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Items</h4>
                  <div className="divide-y divide-border/20">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>{item.name} <span className="text-muted-foreground text-xs">x{item.quantity}</span></span>
                        </div>
                        <span className="font-medium">₹{Number(item.total).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
