import { NextResponse, type NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

function cors(req: NextRequest, res: NextResponse) {
  const origin = req.headers.get('origin') || ''
  const ALLOWED_ORIGINS = ['https://divyayagyam.com', 'https://www.divyayagyam.com', 'http://localhost:3000']
  
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.headers.set('Access-Control-Allow-Origin', origin)
    res.headers.set('Access-Control-Allow-Credentials', 'true')
  } else if (!origin) {
    res.headers.set('Access-Control-Allow-Origin', '*')
  }
  
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return res
}

export async function OPTIONS(request: NextRequest) {
  return cors(request, new NextResponse(null, { status: 200 }))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body?.email) return cors(request, NextResponse.json({ ok: false, error: 'email required' }, { status: 400 }))
    
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

export async function GET(request: NextRequest) {
  try {
    const subs = await prisma.newsletter.findMany({
      orderBy: { subscribedAt: 'desc' },
    })
    return cors(request, NextResponse.json({ ok: true, data: subs }))
  } catch (e: any) {
    return cors(request, NextResponse.json({ ok: false, error: e?.message }, { status: 500 }))
  }
}
