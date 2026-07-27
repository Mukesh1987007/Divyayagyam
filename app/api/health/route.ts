import { NextResponse, type NextRequest } from 'next/server'

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
  return cors(request, NextResponse.json({
    ok: true,
    service: 'Divyayagyam API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  }))
}
