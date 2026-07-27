import { NextRequest, NextResponse } from 'next/server'
import { uploadToSupabase } from '@/lib/supabase/storage-helpers'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ ok: false, error: 'No file uploaded' }, { status: 400 });
    }

    let buffer = Buffer.from(await file.arrayBuffer())
    let fileName = file.name
    let mimeType = file.type

    // We no longer convert on the server to avoid Vercel 500 errors with sharp.
    // Images are compressed on the client side using browser-image-compression.

    const uploadResult = await uploadToSupabase(buffer, fileName, mimeType)

    return NextResponse.json({
      ok: true,
      url: uploadResult.publicUrl,
      name: fileName,
      size: buffer.length,
    });
  } catch (err: any) {
    console.error('Upload API Error:', err)
    return NextResponse.json({ ok: false, error: err?.message || 'Upload failed' }, { status: 500 });
  }
}
