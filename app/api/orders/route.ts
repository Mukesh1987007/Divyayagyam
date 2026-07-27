import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getSetting } from '@/lib/settings'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser().catch(() => null)
    if (!user) {
      return NextResponse.json({ ok: false, error: 'You must be logged in to place an order' }, { status: 401 });
    }


    const body = await req.json()
    const { items = [], shippingAddress, notes, couponCode } = body

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ ok: false, error: 'Cart is empty or invalid' }, { status: 400 });
    }


    if (!shippingAddress?.name || !shippingAddress?.phone || !shippingAddress?.pincode) {
      return NextResponse.json({ ok: false, error: 'Incomplete shipping address' }, { status: 400 });
    }

    // 1. Secure Price Calculation from DB
    const productIds = items.filter((i: any) => !i.id.startsWith('puja-') && !i.id.startsWith('addon-')).map((i: any) => i.id)
    const products = productIds.length > 0 ? await prisma.product.findMany({
      where: { id: { in: productIds } }
    }) : []
    const bhaktiSevaOfferings = await prisma.bhaktiSevaOffering.findMany({
       where: { isActive: true }
    })

    let subtotal = 0
    const orderItemsData: any[] = []

    for (const item of items) {
       let price = 0
       let name = item.name || 'Unknown Item'
       let productId: string | null = null

       if (item.id.startsWith('puja-')) {
          const parts = item.id.split('-')
          const pujaId = parts.slice(1, parts.length - 1).join('-') // Handle dashes in uuid
          const pkgId = parts[parts.length - 1]
          
          if (pujaId && pkgId) {
             const puja = await prisma.puja.findUnique({ where: { id: pujaId }, include: { packages: true } })
             if (puja) {
                const pkg = puja.packages.find(p => p.id === pkgId)
                if (pkg) { price = Number(pkg.price) }
                else if (pkgId === '1' || pkgId.includes('base')) price = Number(puja.price)
                else if (pkgId === '2') price = Number(puja.price) * 1.5
                else if (pkgId === '3') price = Number(puja.price) * 2.5
                else price = Number(item.price) // fallback
             } else { price = Number(item.price) }
          } else { price = Number(item.price) }
       } 
       else if (item.id.startsWith('addon-')) {
          const addonPrices: Record<string, number> = {
             'addon-courier': 99
          }
          if (item.id === 'addon-dakshina') {
             price = Math.max(0, Number(item.price) || 0) // Allow dynamic dakshina
          } else if (item.id.startsWith('addon-bhaktiSeva-')) {
             const offeringId = item.id.replace('addon-bhaktiSeva-', '')
             const offering = bhaktiSevaOfferings.find(o => o.id === offeringId)
             if (offering) {
                price = Number(offering.price)
             } else {
                price = Number(item.price) // fallback
             }
          } else {
             price = addonPrices[item.id] || Number(item.price)
          }
       } 
       else {
          const product = products.find((p: any) => p.id === item.id)
          if (!product) throw new Error('Product mismatch')
          price = Number((product as any).salePrice || product.price) || 0
          name = product.name
          productId = product.id
       }

       const quantity = Number(item.quantity)
       if (isNaN(quantity) || quantity <= 0) throw new Error(`Invalid quantity for ${item.id}`)
       
       const itemTotal = price * quantity
       subtotal += itemTotal
       orderItemsData.push({ productId, name, price, quantity, total: itemTotal })
    }


    let discountAmount = 0
    let validCouponId: string | null = null

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.trim().toUpperCase() } })
      if (coupon && coupon.isActive) {
        // Validate
        let isValid = true
        if (coupon.startsAt && new Date() < coupon.startsAt) isValid = false
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) isValid = false
        if (coupon.minAmount && subtotal < Number(coupon.minAmount)) isValid = false
        
        if (isValid) {
          validCouponId = coupon.id
          const val = Number(coupon.discountValue)
          if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = (subtotal * val) / 100
            if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
              discountAmount = Number(coupon.maxDiscount)
            }
          } else {
            discountAmount = val
          }
          if (discountAmount > subtotal) discountAmount = subtotal
        }
      }
    }

    const total = Math.max(0, subtotal - discountAmount)


    // 2. Save Address
    const savedAddress = await prisma.address.create({
      data: {
        userId: user.id,
        type: 'SHIPPING',
        fullName: shippingAddress.name,
        phone: shippingAddress.phone,
        line1: shippingAddress.street || shippingAddress.line1 || '',
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        country: 'India',
        isDefault: false
      }
    })

    // 3. Create Order
    const orderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000)
    const dbOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        subtotal,
        tax: 0,
        shipping: 0,
        discount: discountAmount,
        total,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        couponId: validCouponId,
        notes: notes || null,
        shippingAddressId: savedAddress.id,
        items: { create: orderItemsData }
      }
    })

    if (validCouponId) {
      await prisma.coupon.update({
        where: { id: validCouponId },
        data: { usedCount: { increment: 1 } }
      }).catch(e => console.error('[Coupon] Failed to increment usedCount:', e))
    }

    // 4. Try Razorpay — fallback gracefully if keys missing
    try {
      const { getRazorpay } = await import('@/lib/razorpay')
      const razorpay = await getRazorpay()
      const amountInPaise = Math.round(total * 100)
      const rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: dbOrder.id,
        notes: { paymentType: 'product_order', orderId: dbOrder.id, userId: user.id }
      })

      await prisma.payment.create({
        data: {
          userId: user.id,
          amount: total,
          currency: 'INR',
          gateway: 'RAZORPAY',
          gatewayOrderId: rzpOrder.id,
          status: 'PENDING',
          metadata: { paymentType: 'product_order', orderId: dbOrder.id }
        }
      }).catch(e => console.error('[Orders] Failed to create payment record:', e.message))

      const rzpKeyId = (await getSetting('secret.razorpay_key_id')) || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID

      return NextResponse.json({
        ok: true,
        mode: 'razorpay',
        paymentData: {
          orderId: rzpOrder.id,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          receipt: rzpOrder.receipt,
          razorpayKeyId: rzpKeyId
        }
      });
    } catch (rzpErr: any) {
      // Razorpay not configured — save order and notify admin via COD
// console.error('[Orders] Razorpay unavailable, falling back to manual:', rzpErr?.message) (removed for production)
      return NextResponse.json({
        ok: true,
        mode: 'manual',
        orderId: dbOrder.id,
        orderNumber: dbOrder.orderNumber,
        total,
        message: 'आपका ऑर्डर सफलतापूर्वक दर्ज हो गया है! हमारी टीम जल्द ही आपसे संपर्क करेगी।'
      });
    }
  } catch (err: any) {
// console.error('[API_ORDERS_ERROR]', err) (removed for production)
    return NextResponse.json({ ok: false, error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

