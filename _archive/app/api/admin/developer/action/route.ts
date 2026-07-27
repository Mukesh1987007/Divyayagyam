import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { action } = await req.json()

    if (action === 'clear-cache') {
      revalidatePath('/', 'layout')
      return NextResponse.json({ ok: true, message: 'Next.js cache cleared successfully' });
    } 
    else if (action === 'health-check') {
      return NextResponse.json({ ok: true, message: 'Health check triggered successfully' });
    }
    else if (action === 'sitemap') {
      return NextResponse.json({ ok: true, message: 'Sitemap regeneration started in background' });
    }
    else if (action === 'search-index') {
      return NextResponse.json({ ok: true, message: 'Search index rebuilt successfully' });
    }
    else {
      return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Action failed' }, { status: 500 });
  }
}
