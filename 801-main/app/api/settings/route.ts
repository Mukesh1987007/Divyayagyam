import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminSession } from '@/lib/admin-session'

export async function GET() {
  try {
    const user = await getAdminSession()
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Load settings from database
    const dbSettingsList = await prisma.websiteSetting.findMany()
    const dbSettingsMap: Record<string, any> = {}
    dbSettingsList.forEach(s => {
      dbSettingsMap[s.key] = s.value
    })

    // Check system status
    const status: Record<string, { configured: boolean; healthy: boolean; details?: string }> = {
      database: { configured: false, healthy: false },
      supabase: { configured: false, healthy: false },
      razorpay: { configured: false, healthy: false },
      openai: { configured: false, healthy: false },
    }

    // 1. Database check
    try {
      await prisma.$queryRaw`SELECT 1`
      status.database = { configured: true, healthy: true, details: 'Connected to PostgreSQL database successfully.' }
    } catch (e: any) {
      status.database = { configured: true, healthy: false, details: e?.message || 'Failed to connect to database' }
    }

    // Helper to get runtime value (db setting or env)
    const getSetting = (key: string, envName: string) => {
      return dbSettingsMap[key] || process.env[envName] || ''
    }

    // 2. Supabase check
    const sbUrl = getSetting('secret.supabase_url', 'NEXT_PUBLIC_SUPABASE_URL')
    const sbKey = getSetting('secret.supabase_anon_key', 'NEXT_PUBLIC_SUPABASE_ANON_KEY')
    if (sbUrl && sbKey) {
      try {
        const response = await fetch(`${sbUrl}/auth/v1/settings`, {
          headers: { apiKey: sbKey }
        })
        if (response.ok) {
          status.supabase = { configured: true, healthy: true, details: 'Supabase URL & Anon Key are valid and reachable.' }
        } else {
          status.supabase = { configured: true, healthy: false, details: `Supabase returned status code ${response.status}` }
        }
      } catch (e: any) {
        status.supabase = { configured: true, healthy: false, details: e?.message || 'Error connecting to Supabase' }
      }
    } else {
      status.supabase = { configured: false, healthy: false, details: 'Supabase URL or Anon Key is missing.' }
    }

    // 3. Razorpay check
    const rzKeyId = getSetting('secret.razorpay_key_id', 'RAZORPAY_KEY_ID')
    const rzKeySecret = getSetting('secret.razorpay_key_secret', 'RAZORPAY_KEY_SECRET')
    if (rzKeyId && rzKeySecret) {
      try {
        const auth = Buffer.from(`${rzKeyId}:${rzKeySecret}`).toString('base64')
        const response = await fetch('https://api.razorpay.com/v1/payments', {
          headers: { Authorization: `Basic ${auth}` }
        })
        if (response.status === 200 || response.status === 400 || response.status === 401) {
          if (response.status === 401) {
            status.razorpay = { configured: true, healthy: false, details: 'Razorpay credentials invalid.' }
          } else {
            status.razorpay = { configured: true, healthy: true, details: 'Razorpay API is active.' }
          }
        } else {
          status.razorpay = { configured: true, healthy: false, details: `Razorpay API returned status: ${response.status}` }
        }
      } catch (e: any) {
        status.razorpay = { configured: true, healthy: false, details: e?.message || 'Error connecting to Razorpay' }
      }
    } else {
      status.razorpay = { configured: false, healthy: false, details: 'Razorpay Key ID or Secret is missing.' }
    }

    // 4. OpenAI check
    const openaiKey = getSetting('secret.openai_api_key', 'OPENAI_API_KEY')
    if (openaiKey) {
      if (openaiKey.startsWith('sk-')) {
        status.openai = { configured: true, healthy: true, details: 'OpenAI API Key is configured.' }
      } else {
        status.openai = { configured: true, healthy: false, details: 'OpenAI API Key format is invalid (should start with sk-).' }
      }
    } else {
      status.openai = { configured: false, healthy: false, details: 'OpenAI API Key is missing.' }
    }

    return NextResponse.json({
      ok: true,
      data: {
        settings: dbSettingsMap,
        status,
        envKeys: {
          supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          supabase_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          supabase_service_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          openai_api_key: !!process.env.OPENAI_API_KEY,
          razorpay_key_id: !!process.env.RAZORPAY_KEY_ID,
          razorpay_key_secret: !!process.env.RAZORPAY_KEY_SECRET,
        }
      }
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAdminSession()
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json()
    const { settings } = body

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ ok: false, error: 'Settings object is required' }, { status: 400 });
    }

    const results: any[] = []
    for (const [key, value] of Object.entries(settings)) {
      const result = await prisma.websiteSetting.upsert({
        where: { key },
        create: {
          key,
          value: value as any,
          group: key.startsWith('secret.') ? 'secrets' : 'general',
        },
        update: {
          value: value as any,
        }
      })
      results.push(result)
    }

    return NextResponse.json({ ok: true, data: results });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
