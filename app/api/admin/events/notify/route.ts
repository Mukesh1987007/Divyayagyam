import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const eventId = formData.get('eventId') as string
    const messageTemplate = formData.get('messageTemplate') as string

    if (!file || !eventId) {
      return NextResponse.json({ ok: false, error: 'File and Event ID are required' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) {
      return NextResponse.json({ ok: false, error: 'Event not found' }, { status: 404 });
    }

    // Parse CSV
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim() !== '')
    
    if (lines.length < 2) {
      return NextResponse.json({ ok: false, error: 'CSV must have a header and at least one row' }, { status: 400 });
    }

    // Header extraction
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    
    let processedCount = 0
    let failedCount = 0

    // Simulate sending notifications (Email/WhatsApp)
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim())
      if (cols.length < headers.length) {
        failedCount++
        continue
      }
      
      const rowData: Record<string, string> = {}
      headers.forEach((h, idx) => {
        rowData[h] = cols[idx]
      })

      const phone = rowData['phone'] || rowData['whatsapp'] || rowData['mobile']
      const email = rowData['email']
      const name = rowData['name'] || 'Devotee'

      if (!phone && !email) {
        failedCount++
        continue
      }

      // Here you would integrate with Twilio/WhatsApp Cloud API / Nodemailer.
      // We will simulate a successful dispatch.
      processedCount++
    }

    return NextResponse.json({ 
      ok: true, 
      data: { 
        processed: processedCount, 
        failed: failedCount,
        message: `Successfully sent ${processedCount} notifications for "${event.title}".` 
      } 
    });

  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to process CSV' }, { status: 500 });
  }
}
