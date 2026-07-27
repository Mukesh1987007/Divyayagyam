import { NextResponse, type NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

function cors(req: NextRequest, res: NextResponse) {
  const origin = req.headers.get('origin') || ''
  const ALLOWED_ORIGINS = ['https://divyayagyam.com', 'https://www.divyayagyam.com', 'http://localhost:3000']
  
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.headers.set('Access-Control-Allow-Origin', origin)
    res.headers.set('Access-Control-Allow-Credentials', 'true')
  } else if (!origin) {
    res.headers.set('Access-Control-Allow-Origin', '*')
  }
  
  res.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return res
}

export async function OPTIONS(request: NextRequest) {
  return cors(request, new NextResponse(null, { status: 200 }))
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser().catch(() => null)
  if (!user) return cors(request, NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 }))
  return cors(request, NextResponse.json({ ok: true, data: user }))
}
