import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminSession } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    // Check Postgres
    let pgStatus = 'healthy'
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch {
      pgStatus = 'not-connected'
    }

    // Check Supabase Auth
    let supaAuthStatus = 'healthy'
    let supaStorageStatus = 'healthy'
    try {
      const supabase = await createAdminClient()
      const { error: authErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 })
      if (authErr) supaAuthStatus = 'error'

      const { error: storageErr } = await supabase.storage.listBuckets()
      if (storageErr) supaStorageStatus = 'error'
    } catch {
      supaAuthStatus = 'error'
      supaStorageStatus = 'error'
    }

    return NextResponse.json({
      ok: true,
      services: {
        postgres: pgStatus,
        supabaseAuth: supaAuthStatus,
        supabaseStorage: supaStorageStatus,
        nextjs: 'healthy'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to get system health' }, { status: 500 });
  }
}
