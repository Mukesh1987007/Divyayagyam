import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/lib/prisma'

// Razorpay webhook receiver. Configure this URL in Dashboard → Settings → Webhooks.
// Set `RAZORPAY_WEBHOOK_SECRET'env var to the secret you defined there.

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    if (!secret) {
// console.warn('[webhook] RAZORPAY_WEBHOOK_SECRET not configured — accepting without verification (unsafe for prod)') (removed for production)
    }

    const rawBody = await req.text()
    const receivedSignature =
      req.headers.get('x-razorpay-signature') ||
      req.headers.get('X-Razorpay-Signature') ||
      ''
    const eventId =
      req.headers.get('x-razorpay-event-id') ||
      req.headers.get('X-Razorpay-Event-Id') ||
      null

    if (secret) {
      const generated = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
      if (generated !== receivedSignature) {
        return NextResponse.json({ ok: false, error: 'Invalid signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody) as {
      event: string
      payload: { payment?: { entity: any }; order?: { entity: any }; refund?: { entity: any } }
    }

    const orderEntityId: string | undefined = event.payload?.order?.entity?.id
    const paymentEntity: any = event.payload?.payment?.entity
    const paymentEntityId: string | undefined = paymentEntity?.id

    let statusUpdate: string | null = null
    switch (event.event) {
      case 'payment.captured':
      case 'order.paid':
        statusUpdate = 'SUCCESS'
        break
      case 'payment.authorized':
        statusUpdate = 'PROCESSING'
        break
      case 'payment.failed':
        statusUpdate = 'FAILED'
        break
      case 'refund.processed':
      case 'refund.created':
        statusUpdate = 'REFUNDED'
        break
      default:
        statusUpdate = null
    }

    try {
      if (statusUpdate && (orderEntityId || paymentEntityId)) {
        const updatedPayment = await prisma.payment.updateMany({
          where: {
            OR: [
              orderEntityId ? { gatewayOrderId: orderEntityId } : undefined,
              paymentEntityId ? { gatewayRef: paymentEntityId } : undefined,
            ].filter(Boolean) as any,
          },
          data: {
            status: statusUpdate as any,
            gatewayRef: paymentEntityId ?? undefined,
            paidAt: statusUpdate === 'SUCCESS' ? new Date() : undefined,
            metadata: { webhookEvent: event.event, eventId, payload: event.payload },
          },
        })

        // Also fetch the payment to check if it's related to an order
        const paymentData = await prisma.payment.findFirst({
           where: { gatewayOrderId: orderEntityId }
        })
        
        if (paymentData && paymentData.metadata && typeof paymentData.metadata === 'object' && (paymentData.metadata as any).orderId) {
          const actualOrderId = (paymentData.metadata as any).orderId;
          
          await prisma.order.update({
            where: { id: actualOrderId },
            data: {
              paymentStatus: statusUpdate === 'SUCCESS' ? 'SUCCESS' : statusUpdate === 'FAILED' ? 'FAILED' : 'PENDING',
              status: statusUpdate === 'SUCCESS' ? 'PROCESSING' : 'PENDING'
            }
          })
        }
      }
    } catch (dbErr: any) {
// console.warn('[webhook] DB update skipped:', dbErr?.message) (removed for production)
    }

// console.log('[webhook] Handled event=${event.event} order=${orderEntityId} payment=${paymentEntityId}`) (removed for production)
    return NextResponse.json({ ok: true, event: event.event });
  } catch (err: any) {
// console.error('[webhook] error:', err) (removed for production)
    return NextResponse.json({ ok: false, error: err?.message || 'Webhook error' }, { status: 500 });
  }
}
