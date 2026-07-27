import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Clock, FileText } from 'lucide-react'
import Link from 'next/link'
export const revalidate = 60; // ISR: Revalidate every 60s

export default async function BookingsPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: {
      puja: true,
      temple: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground text-sm">View and track your scheduled pujas and rituals.</p>
      </div>

      {bookings.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="font-semibold text-lg">No Bookings Yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
            You haven't booked any online pujas or rituals yet. Browse our sacred list to book your first sankalp.
          </p>
          <Link
            href="/pujas"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Explore Pujas
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        #{booking.bookingNumber}
                      </span>
                      <Badge variant={booking.status === 'COMPLETED' ? 'success' : booking.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                        {booking.status}
                      </Badge>
                      <Badge variant="outline">
                        Payment: {booking.paymentStatus}
                      </Badge>
                    </div>
                    <h2 className="text-lg font-bold pt-1">{booking.puja.name}</h2>
                    {booking.temple && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {booking.temple.name}, {booking.temple.city}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 items-center md:text-right">
                    <div className="space-y-1 md:text-right w-full md:w-auto">
                      <p className="text-xs text-muted-foreground">Amount Paid</p>
                      <p className="text-lg font-extrabold text-primary">₹{Number(booking.total).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/40 mt-4 pt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 text-sm">
                  {booking.scheduledAt && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>
                        Scheduled: {new Date(booking.scheduledAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                  {booking.gotra && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-semibold text-xs bg-accent/10 text-accent px-2 py-0.5 rounded">
                        Gotra: {booking.gotra}
                      </span>
                    </div>
                  )}
                  {booking.pdfUrl && (
                    <a
                      href={booking.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      Download Receipt
                    </a>
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
