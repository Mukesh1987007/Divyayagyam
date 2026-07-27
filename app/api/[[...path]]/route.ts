import { NextResponse, type NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

function cors(req: NextRequest, res: NextResponse) {
  const origin = req.headers.get('origin') || ''
  
  // Replace with actual production domains
  const ALLOWED_ORIGINS = [
    'https://divyayagyam.com',
    'https://www.divyayagyam.com',
    'http://localhost:3000'
  ]
  
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.headers.set('Access-Control-Allow-Origin', origin)
    res.headers.set('Access-Control-Allow-Credentials', 'true')
  } else if (!origin) {
    // For same-origin requests where origin header might be omitted
    res.headers.set('Access-Control-Allow-Origin', '*')
  }
  
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return res
}

export async function OPTIONS(request: NextRequest) {
  return cors(request, new NextResponse(null, { status: 200 }))
}

async function handleRoute(request: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await ctx.params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    // Health check
    if ((route === '/' || route === '/health') && method === 'GET') {
      return cors(request, NextResponse.json({
        ok: true,
        service: 'Divyayagyam API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      }))
    }

    // Current authenticated user
    if (route === '/me' && method === 'GET') {
      const user = await getCurrentUser().catch(() => null)
      if (!user) return cors(request, NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 }))
      return cors(request, NextResponse.json({ ok: true, data: user }))
    }

    // Public roles list (for admin UI dropdowns)
    if (route === '/roles' && method === 'GET') {
      try {
        const roles = await prisma.role.findMany({ orderBy: { name: 'asc' } })
        return cors(request, NextResponse.json({ ok: true, data: roles }))
      } catch (e: any) {
        return cors(request, NextResponse.json({ ok: true, data: [], note: 'DB unreachable', error: e?.message }))
      }
    }

    // Newsletter subscription
    if (route === '/newsletter' && method === 'POST') {
      const body = await request.json()
      if (!body?.email) return cors(request, NextResponse.json({ ok: false, error: 'email required' }, { status: 400 }))
      try {
        const row = await prisma.newsletter.upsert({
          where: { email: body.email },
          create: { email: body.email },
          update: { isActive: true },
        })
        return cors(request, NextResponse.json({ ok: true, data: row }))
      } catch (e: any) {
        return cors(request, NextResponse.json({ ok: false, error: e?.message }, { status: 500 }))
      }
    }

    // GET /newsletter (List subscribers for admin panel)
    if (route === '/newsletter' && method === 'GET') {
      try {
        const subs = await prisma.newsletter.findMany({
          orderBy: { subscribedAt: 'desc' },
        })
        return cors(request, NextResponse.json({ ok: true, data: subs }))
      } catch (e: any) {
        return cors(request, NextResponse.json({ ok: false, error: e?.message }, { status: 500 }))
      }
    }

    return cors(request, NextResponse.json({ ok: false, error: `Route ${route} not found` }, { status: 404 }))
  } catch (error: any) {
// console.error('API Error:', error) (removed for production)
    return cors(request, NextResponse.json({ ok: false, error: error?.message || 'Internal server error' }, { status: 500 }))
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
