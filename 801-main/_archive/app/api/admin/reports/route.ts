import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'
// Cache response for 60 seconds to reduce DB load
export const revalidate = 60

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Run ALL queries in parallel with Promise.all for max speed
    const [
      bookingsCount,
      successfulBookings,
      ordersCount,
      completedOrders,
      devoteesCount,
      bookingAgg,
      orderAgg,
      bookingRefundAgg,
      orderRefundAgg,
      bookingTaxAgg,
      orderTaxAgg,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: { in: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] } } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: ['SHIPPED', 'DELIVERED'] } } }),
      prisma.user.count({ where: { role: { slug: 'devotee' } } }),

      // Revenue: all non-cancelled bookings
      prisma.booking.aggregate({
        _sum: { total: true },
        where: { status: { notIn: ['CANCELLED', 'REFUNDED'] } }
      }),
      // Revenue: all non-cancelled/returned orders
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { notIn: ['CANCELLED', 'RETURNED'] } }
      }),

      // Refunds
      prisma.booking.aggregate({
        _sum: { total: true },
        where: { status: 'REFUNDED' }
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: 'RETURNED' }
      }),

      // Tax
      prisma.booking.aggregate({
        _sum: { tax: true },
        where: { status: { notIn: ['CANCELLED', 'REFUNDED'] } }
      }),
      prisma.order.aggregate({
        _sum: { tax: true },
        where: { status: { notIn: ['CANCELLED', 'RETURNED'] } }
      }),
    ])

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const [recentBookings, recentOrders, recentLogs] = await Promise.all([
      prisma.booking.findMany({
        where: { createdAt: { gte: thirtyDaysAgo }, status: { notIn: ['CANCELLED', 'REFUNDED'] } },
        select: { total: true, createdAt: true }
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: thirtyDaysAgo }, status: { notIn: ['CANCELLED', 'RETURNED'] } },
        select: { total: true, createdAt: true }
      }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { fullName: true, email: true } } }
      })
    ])

    // Calculate daily revenue for the last 30 days
    const dailyRevenue = Array(30).fill(0)
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    const processItem = (item: { total: any, createdAt: Date }) => {
      const diffTime = Math.abs(today.getTime() - item.createdAt.getTime())
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays >= 0 && diffDays < 30) {
        // Reverse index: 29 is today, 0 is 30 days ago
        const idx = 29 - diffDays
        dailyRevenue[idx] += Number(item.total || 0)
      }
    }

    recentBookings.forEach(processItem)
    recentOrders.forEach(processItem)

    const totalRevenue = Number(bookingAgg._sum.total || 0) + Number(orderAgg._sum.total || 0)
    const totalTax = Number(bookingTaxAgg._sum.tax || 0) + Number(orderTaxAgg._sum.tax || 0)
    const totalRefunds = Number(bookingRefundAgg._sum.total || 0) + Number(orderRefundAgg._sum.total || 0)

    const stats = {
      totalRevenue: totalRevenue.toFixed(2),
      totalTax: totalTax.toFixed(2),
      totalRefunds: totalRefunds.toFixed(2),
      bookingsCount,
      successfulBookings,
      ordersCount,
      completedOrders,
      devoteesCount,
      dailyRevenue,
      recentLogs,
    }

    const response = NextResponse.json({ ok: true, stats })
    // Cache for 60 seconds on CDN/browser
    response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
    return response
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Database error generating reports' }, { status: 500 })
  }
}
