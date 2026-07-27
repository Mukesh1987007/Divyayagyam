import { NextRequest, NextResponse } from 'next/server'
import { getRazorpay } from '@/lib/razorpay'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getSetting } from '@/lib/settings'

function cors(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return res
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 200 }))
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      amountInRupees,
      paymentType = 'donation',
      referenceId,
      description,
      customer,
      notes,
    } = body || {}

    if (!amountInRupees || typeof amountInRupees !== 'number' || amountInRupees <= 0) {
      return cors(NextResponse.json({ ok: false, error: 'Invalid amount' }, { status: 400 }))
    }
    if (amountInRupees < 1) {
      return cors(NextResponse.json({ ok: false, error: 'Minimum ₹1 required' }, { status: 400 }))
    }

    const amountInPaise = Math.round(amountInRupees * 100)
    const receipt = `dvj_${paymentType}_${Date.now()}`.slice(0, 40)

    // Optional: attach user (works even if unauth for donations/testing)
    const user = await getCurrentUser().catch(() => null)

    const razorpay = await getRazorpay()
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: {
        paymentType,
        referenceId: referenceId ?? '',
        userId: user?.id ?? 'guest',
        description: description ?? '',
        ...(notes || {}),
      },
    })

    // Persist Payment record (best-effort — skip if DB unreachable)
    let paymentId: string | null = null
    try {
      if (user) {
        const record = await prisma.payment.create({
          data: {
            userId: user.id,
            amount: amountInRupees,
            currency: 'INR',
            gateway: 'RAZORPAY',
            gatewayOrderId: order.id,
            status: 'PENDING',
            metadata: { paymentType, referenceId, description, receipt, customer, notes },
          },
        })
        paymentId = record.id
      }
    } catch (dbErr: any) {
// console.warn('[create-order] DB persistence skipped:', dbErr?.message) (removed for production)
    }

    const rzpKeyId = (await getSetting('secret.razorpay_key_id')) || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID

    return cors(NextResponse.json({
      ok: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      razorpayKeyId: rzpKeyId,
      paymentId,
      customer: {
        name: customer?.name || user?.fullName || '',
        email: customer?.email || user?.email || '',
        contact: customer?.contact || '',
      },
    }))
  } catch (err: any) {
// console.error('[create-order] error:', err) (removed for production)
    return cors(NextResponse.json({
      ok: false,
      error: err?.error?.description || err?.message || 'Failed to create order',
    }, { status: 500 }))
  }
}
