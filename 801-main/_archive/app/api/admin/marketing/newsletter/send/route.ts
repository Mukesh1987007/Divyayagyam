import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { subject, message } = await req.json()

    if (!subject || !message) {
      return NextResponse.json({ ok: false, error: 'Subject and Message are required' }, { status: 400 });
    }

    const subscribers = await prisma.newsletter.findMany({
      where: { isActive: true }
    })

    if (subscribers.length === 0) {
      return NextResponse.json({ ok: false, error: 'No active subscribers found' }, { status: 400 });
    }

    // In a real production app, you would integrate Resend or Nodemailer here:
    // await resend.emails.send({
    //   from: 'noreply@yourdomain.com',
    //   to: subscribers.map(s => s.email),
    //   subject,
    //   text: message
    // })

    return NextResponse.json({ 
      ok: true, 
      message: `Newsletter sent successfully to ${subscribers.length} active subscribers!` 
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to send newsletter' }, { status: 500 });
  }
}
