import { NextRequest, NextResponse } from 'next/server'
import { deleteFromSupabase } from '@/lib/supabase/storage-helpers'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    const success = await deleteFromSupabase(url)

    return NextResponse.json({
      success,
    });
  } catch (error: any) {
// console.error('Delete API Error:', error) (removed for production)
    return NextResponse.json({ error: error.message || 'Delete failed' }, { status: 500 });
  }
}
