import { NextRequest, NextResponse } from 'next/server'
import { uploadToSupabase } from '@/lib/supabase/storage-helpers'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const uploadResult = await uploadToSupabase(buffer, file.name, file.type)

    return NextResponse.json({
      success: true,
      url: uploadResult.publicUrl,
      path: uploadResult.path,
    });
  } catch (error: any) {
// console.error('Upload API Error:', error) (removed for production)
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
