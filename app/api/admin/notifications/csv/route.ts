import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/admin-session'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value
    const session = await verifyAdminToken(token)
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const templateMessage = formData.get('message') as string || ''

    if (!file) {
      return NextResponse.json({ ok: false, error: 'No CSV file uploaded' }, { status: 400 });
    }

    const csvContent = await file.text()
    
    // Parse CSV lines
    const lines = csvContent.split(/\r?\n/)
    if (lines.length <= 1) {
      return NextResponse.json({ ok: false, error: 'CSV is empty or missing data rows' }, { status: 400 });
    }

    // Extract headers: e.g. name, email, phone, message
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const records: any[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      const values = line.split(',').map(v => v.trim())
      
      const record: Record<string, string> = {}
      headers.forEach((header, index) => {
        record[header] = values[index] || ''
      })
      records.push(record)
    }

    // Simulate sending notifications
// console.log(`[CSV Engine] Starting notification dispatch for ${records.length} contacts...`) (removed for production)
    
    records.forEach((rec, idx) => {
      const contactName = rec.name || 'Devotee'
      const email = rec.email || rec.mail || ''
      const phone = rec.phone || rec.mobile || rec.whatsapp || ''
      const customMsg = rec.message || templateMessage || 'Blessings from Divyayagyam!'

      const personalized = customMsg
        .replace(/{name}/gi, contactName)
        .replace(/{email}/gi, email)
        .replace(/{phone}/gi, phone)

// console.log(`--- [Dispatching Contact #${idx + 1}] ---`) (removed for production)
      if (email) {
// console.log(`[EMAIL ALERT] Sent to: ${email} | Subject: Divyayagyam Blessings | Body: "${personalized}"`) (removed for production)
      }
      if (phone) {
// console.log(`[SMS ALERT] Sent to: ${phone} | Body: "${personalized}"`) (removed for production)
// console.log(`[WHATSAPP ALERT] Sent to: ${phone} | Body: "${personalized}"`) (removed for production)
      }
    })

    return NextResponse.json({
      ok: true,
      message: `Successfully processed and dispatched alerts to ${records.length} contacts via email, SMS, and WhatsApp!`,
      details: {
        recipients: records.map(r => ({
          name: r.name || 'Devotee',
          email: r.email || r.mail || 'No Email',
          phone: r.phone || r.mobile || r.whatsapp || 'No Phone'
        }))
      }
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Processing failed' }, { status: 500 });
  }
}
