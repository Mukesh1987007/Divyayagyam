import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Helper function to resolve DATABASE_URL from process.env or direct disk read
function getDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL?.trim()) {
    return process.env.DATABASE_URL.trim()
  }

  // Fallback: Try reading directly from .env.local or .env on disk if process.env was not loaded by dev server
  try {
    const cwd = process.cwd()
    const envPaths = [path.join(cwd, '.env.local'), path.join(cwd, '.env')]
    for (const envPath of envPaths) {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8')
        const match = content.match(/^DATABASE_URL=["']?([^"'\r\n]+)["']?/m)
        if (match && match[1]) {
          const url = match[1].trim()
          process.env.DATABASE_URL = url
          return url
        }
      }
    }
  } catch (e) {
    // Ignore file system errors
  }

  return undefined
}

// Singleton pattern — always cache in globalThis to prevent connection pool exhaustion
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const resolvedDbUrl = getDatabaseUrl()

if (!resolvedDbUrl) {
  console.warn('⚠️ [Prisma Warning]: DATABASE_URL is missing in environment variables.')
}

const basePrisma = new PrismaClient({
  datasources: {
    db: {
      url: resolvedDbUrl || 'postgresql://invalid_url_please_set_DATABASE_URL@localhost:6543/postgres',
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
})

export const prisma = globalForPrisma.prisma ?? basePrisma

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma as any
}

export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Database connection error' }
  }
}

export async function executeWithRetry<T>(
  queryFn: () => Promise<T>,
  retries = 3,
  delayMs = 500
): Promise<T> {
  let lastError: any
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await queryFn()
    } catch (err: any) {
      lastError = err
      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, delayMs * attempt))
      }
    }
  }
  throw new Error(`Database query failed after ${retries} attempts: ${lastError?.message || lastError}`)
}

export default prisma