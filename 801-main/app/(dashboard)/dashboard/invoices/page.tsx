import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Download, Clock, CheckCircle } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
export const revalidate = 60; // ISR: Revalidate every 60s

export default async function InvoicesPage() {
  const user = await getCurrentUser()
  if (!user?.id) return null

  // Fetch all bookings and orders
  const [bookings, orders] = await Promise.all([
    prisma.booking.findMany({
      where: { userId: user.id },
      include: { puja: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })
  ])

  const allTransactions = [
    ...bookings.map(b => ({
      id: b.id,
      number: b.bookingNumber,
      title: `Puja Booking: ${b.puja?.name || 'Custom'}`,
      date: b.createdAt,
      amount: b.total,
      status: b.paymentStatus,
      type: 'BOOKING'
    })),
    ...orders.map(o => ({
      id: o.id,
      number: o.orderNumber,
      title: `Store Order`,
      date: o.createdAt,
      amount: o.total,
      status: o.paymentStatus,
      type: 'ORDER'
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">मेरी रसीदें (Invoices & Receipts)</h1>
        <p className="text-muted-foreground text-sm">Download your payment receipts or complete pending payments.</p>
      </div>

      <Card className="border-orange-100 shadow-sm">
        <CardHeader className="bg-orange-50/50 border-b border-orange-100 pb-4">
          <CardTitle className="text-orange-900 text-lg">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-0">
          {allTransactions.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {allTransactions.map((tx) => (
                <div key={tx.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">{tx.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        #{tx.number} • {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {tx.status === 'SUCCESS' ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 text-[10px]">
                            <CheckCircle className="mr-1 h-3 w-3" /> Paid (₹{Number(tx.amount)})
                          </Badge>
                        ) : tx.status === 'PENDING' ? (
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-[10px]">
                            <Clock className="mr-1 h-3 w-3" /> Pending (₹{Number(tx.amount)})
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">{tx.status}</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-2">
                    {tx.status === 'SUCCESS' ? (
                      <Button size="sm" variant="outline" className="w-full sm:w-auto border-orange-200 text-orange-700 hover:bg-orange-50 font-semibold" type="button">
                        <Download className="mr-2 h-4 w-4" /> Download Receipt
                      </Button>
                    ) : tx.status === 'PENDING' ? (
                      <Button size="sm" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold shadow-md shadow-green-600/20">
                        Pay ₹{Number(tx.amount)} Now
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <FileText className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="font-bold text-lg text-slate-700">No Transactions Found</h3>
              <p className="text-sm text-slate-500 max-w-sm mt-1">
                You haven't made any bookings or orders yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

