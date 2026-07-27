import { PrismaClient } from '@prisma/client'
import { prisma } from './prisma'

/**
 * Executes a database query with automatic retry logic for transient errors.
 * This prevents the application from crashing when the DB drops a connection or is busy.
 */
export async function withPrismaHeal<T>(
  queryFn: (client: PrismaClient) => Promise<T>,
  options = { retries: 3, delayMs: 1000 }
): Promise<T> {
  // Prisma retry logic is now handled globally in lib/prisma.ts via $extends.
  // This is just a pass-through to avoid double-retrying.
  return await queryFn(prisma)
}

/**
 * Translates Prisma error codes into human-readable, safe messages without leaking DB internals.
 */
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
