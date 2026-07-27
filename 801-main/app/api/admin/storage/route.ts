import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminSession } from '@/lib/admin-session'
import { ensureBucketExists } from '@/lib/supabase/storage-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const supabase = await createAdminClient()
    await ensureBucketExists()
    
    const { data: files, error } = await supabase.storage.from('images').list()
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const { data: { publicUrl: baseUrl } } = supabase.storage.from('images').getPublicUrl('')

    const formattedFiles = files.filter(f => f.name !== '.emptyFolderPlaceholder').map(f => ({
      id: f.id,
      name: f.name,
      url: `${baseUrl}${f.name}`,
      size: f.metadata?.size || 0,
      createdAt: f.created_at
    }))

    return NextResponse.json({ ok: true, data: formattedFiles });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to list storage' }, { status: 500 });
  }
}
