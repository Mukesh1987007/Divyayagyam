import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/lib/prisma'

import { getSetting } from '@/lib/settings'

function cors(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return res
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 200 }))
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      paymentId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body || {}

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return cors(NextResponse.json({ ok: false, error: 'Missing verification fields' }, { status: 400 }))
    }

    const secret = await getSetting('secret.razorpay_key_secret', 'RAZORPAY_KEY_SECRET')
    if (!secret) {
      return cors(NextResponse.json({ ok: false, error: 'RAZORPAY_KEY_SECRET not configured' }, { status: 500 }))
    }

    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    const isValid = expected === razorpay_signature

    // Best-effort DB update
    try {
      if (paymentId) {
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: isValid ? 'SUCCESS' : 'FAILED',
            gatewayRef: razorpay_payment_id,
            paidAt: isValid ? new Date() : null,
            metadata: { verified: isValid, razorpay_order_id, razorpay_payment_id, razorpay_signature },
          },
        })
      } else {
        await prisma.payment.updateMany({
          where: { gatewayOrderId: razorpay_order_id },
          data: {
            status: isValid ? 'SUCCESS' : 'FAILED',
            gatewayRef: razorpay_payment_id,
            paidAt: isValid ? new Date() : null,
          },
        })
      }
    } catch (dbErr: any) {
// console.warn('[verify] DB update skipped:', dbErr?.message) (removed for production)
    }

    if (!isValid) {
      return cors(NextResponse.json({ ok: false, verified: false, error: 'Invalid signature' }, { status: 400 }))
    }

    return cors(NextResponse.json({
      ok: true,
      verified: true,
      razorpay_payment_id,
      razorpay_order_id,
    }))
  } catch (err: any) {
// console.error('[verify] error:', err) (removed for production)
    return cors(NextResponse.json({ ok: false, error: err?.message || 'Verification failed' }, { status: 500 }))
  }
}
