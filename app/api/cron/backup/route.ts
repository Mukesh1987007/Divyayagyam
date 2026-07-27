import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import AdmZip from 'adm-zip'
import fs from 'fs/promises'
import path from 'path'
import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET_NAME = 'backups'

export async function GET(req: NextRequest) {
  try {
    // Basic authorization check - Vercel sends an authorization header for cron jobs
    const authHeader = req.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== 'Bearer ${}') {
      return new Response('Unauthorized', { status: 401 })
    }

    // Check if autoBackup is enabled in the database
    const settingRecord = await prisma.websiteSetting.findUnique({ where: { key: 'auto_backup' } })
    if (settingRecord?.value !== 'true') {
      return NextResponse.json({ ok: true, message: 'Auto backup is disabled. Skipping.' });
    }

    const supabase = await createAdminClient()
    
    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    if (!buckets?.find(b => b.name === BUCKET_NAME)) {
      await supabase.storage.createBucket(BUCKET_NAME, { public: false })
    }
    
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)
    const zipName = `backup_divyayagyam_${timestamp}.zip`

    // 1. INTROSPECT DATABASE & DUMP ALL TABLES
    const tables: any[] = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE '_prisma_migrations';
    `)

    const dbDump: Record<string, any[]> = {}
    for (const t of tables) {
      const name = t.table_name
      try {
        const rows: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "${name}"`)
        dbDump[name] = rows
      } catch (e: any) {
// console.warn(`[cron backup] Failed to dump table ${name}:`, e.message) (removed for production)
      }
    }

    // 2. READ CUSTOMIZATIONS (if available locally, otherwise empty)
    let customizations = {}
    try {
      const custFile = path.join(process.cwd(), 'lib', 'data', 'customizations.json')
      const raw = await fs.readFile(custFile, 'utf-8')
      customizations = JSON.parse(raw)
    } catch {}

    // 3. CREATE ZIP ARCHIVE
    const zip = new AdmZip()
    zip.addFile('database_dump.json', Buffer.from(JSON.stringify(dbDump, null, 2), 'utf-8'))
    zip.addFile('customizations.json', Buffer.from(JSON.stringify(customizations, null, 2), 'utf-8'))
    zip.addFile('metadata.json', Buffer.from(JSON.stringify({
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      platform: 'DivyaYagyam',
      type: 'cron_auto'
    }, null, 2), 'utf-8'))

    const zipBuffer = zip.toBuffer()

    // 4. UPLOAD TO SUPABASE STORAGE
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(zipName, zipBuffer, {
        contentType: 'application/zip',
        upsert: true
      })

    if (uploadError) throw uploadError

    return NextResponse.json({
      ok: true,
      message: 'Cron backup completed successfully',
      filename: zipName,
      size: zipBuffer.length
    });
  } catch (err: any) {
// console.error('[cron backup error]', err) (removed for production)
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
