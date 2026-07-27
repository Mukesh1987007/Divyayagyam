import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET_NAME = 'backups'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const filename = searchParams.get('filename')
    if (!filename) {
      return NextResponse.json({ ok: false, error: 'Missing filename parameter' }, { status: 400 });
    }

    const supabase = await createAdminClient()
    
    // Download the file from Supabase Storage
    const { data: fileBuffer, error } = await supabase.storage.from(BUCKET_NAME).download(filename)
    
    if (error) {
      throw error
    }

    if (!fileBuffer) {
      throw new Error('File not found')
    }

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
