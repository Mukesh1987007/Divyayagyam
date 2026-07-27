import { NextRequest, NextResponse } from 'next/server'
import { translatePrismaError } from './prisma-healer'

type ApiHandler = (req: NextRequest, params: any) => Promise<NextResponse>

/**
 * A wrapper for Next.js API routes that intercepts all errors and 
 * prevents the application from crashing. It returns safe, structured JSON.
 */
export function withSafeApi(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest, params: any) => {
    try {
      // Execute the actual API logic
      return await handler(req, params)
    } catch (error: any) {
// console.error(`[API Error] ${req.method} ${req.nextUrl.pathname}:`, error) (removed for production)

      // Handle Prisma Errors
      if (error && typeof error === 'object' && 'code' in error && (error.code as string).startsWith('P')) {
        const safeMessage = translatePrismaError(error)
        return NextResponse.json({ ok: false, error: safeMessage }, { status: 400 })
      }

      // Handle standard JS errors
      const message = error?.message || 'An unexpected error occurred while processing your request.'
      
      // If it's explicitly marked as an unauthorized error
      if (message.toLowerCase().includes('unauthorized') || message.toLowerCase().includes('jwt')) {
        return NextResponse.json({ ok: false, error: 'You must be logged in to perform this action.' }, { status: 401 })
      }

      // Default safe fallback (Internal Server Error)
      return NextResponse.json({ ok: false, error: message }, { status: 500 })
    }
  }
}
