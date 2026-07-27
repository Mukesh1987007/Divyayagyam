import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { code, cartTotal } = await req.json()

    if (!code || typeof cartTotal !== 'number') {
      return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 })
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() }
    })

    if (!coupon) {
      return NextResponse.json({ ok: false, error: 'Invalid coupon code' }, { status: 400 })
    }

    // Validation checks
    if (coupon.startsAt && new Date() < coupon.startsAt) {
      return NextResponse.json({ ok: false, error: 'Coupon is not active yet' }, { status: 400 })
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ ok: false, error: 'Coupon usage limit reached' }, { status: 400 })
    }

    if (coupon.minAmount && cartTotal < Number(coupon.minAmount)) {
      return NextResponse.json({ ok: false, error: `Minimum cart amount of ₹${coupon.minAmount} required` }, { status: 400 })
    }

    // Calculate discount
    let discountAmount = 0
    const val = Number(coupon.discountValue)

    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (cartTotal * val) / 100
      if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
        discountAmount = Number(coupon.maxDiscount)
      }
    } else {
      // FIXED
      discountAmount = val
    }

    // Ensure we don't discount more than the cart total
    if (discountAmount > cartTotal) {
      discountAmount = cartTotal
    }

    return NextResponse.json({
      ok: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountAmount: Math.round(discountAmount)
      }
    })

  } catch (error: any) {
    console.error('Coupon validation error:', error)
    return NextResponse.json({ ok: false, error: 'Failed to validate coupon' }, { status: 500 })
  }
}
