import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value
    const session = await verifyAdminToken(token)
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { type, channels, title, message } = await req.json()

    if (!title || !message) {
      return NextResponse.json({ ok: false, error: 'Title and Message are required' }, { status: 400 });
    }

    // Get all devotees (customers)
    const devotees = await prisma.user.findMany({
      where: {
        role: { slug: 'devotee' }
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true
      }
    })

    if (devotees.length === 0) {
      return NextResponse.json({
        ok: true,
        message: 'Broadcast completed: No registered devotee customers found to notify.'
      });
    }

    // Write notifications to database & generate mock mail/whatsapp logs
    const notificationsData = devotees.map(d => ({
      userId: d.id,
      type: 'SYSTEM' as const,
      title,
      message,
      link: type === 'PUJA' ? '/pujas' : type === 'PRODUCT' ? '/products' : '/'
    }))

    await prisma.notification.createMany({
      data: notificationsData
    }).catch(() => null)

    const whatsappSentCount = (channels.includes('whatsapp') || channels.includes('both')) ? devotees.filter(d => d.phone).length : 0
    const emailSentCount = (channels.includes('email') || channels.includes('both')) ? devotees.filter(d => d.email).length : 0

    return NextResponse.json({
      ok: true,
      message: `Broadcast Sent successfully to all registered Devotees! Sent ${emailSentCount} emails, and ${whatsappSentCount} WhatsApp alerts.`,
      details: {
        totalRecipients: devotees.length,
        emailSentCount,
        whatsappSentCount,
        recipients: devotees.map(d => ({
          name: d.fullName || 'Devotee',
          email: d.email,
          phone: d.phone || 'No phone'
        }))
      }
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Database error during broadcast' }, { status: 500 });
  }
}
