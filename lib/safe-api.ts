import { NextRequest, NextResponse } from 'next/server'

export function translatePrismaError(err: any): string {
  if (!err || typeof err !== 'object') return 'An unexpected database error occurred.'

  switch (err.code) {
    case 'P2002':
      return 'This record already exists. Please use different unique details (e.g., email or name).'
    case 'P2003':
      return 'Operation failed because it references a related record that does not exist.'
    case 'P2025':
      return 'The record you are trying to update or delete could not be found.'
    case 'P2024':
    case 'P1001':
    case 'P1008':
      return 'The database is currently busy or unreachable. Please try again in a few moments.'
    default:
      if (err.message && err.message.includes('PrismaClientKnownRequestError')) {
        return 'A database constraint was violated.'
      }
      return 'An internal database error occurred.'
  }
}

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
