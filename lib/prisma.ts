import fs from 'fs'
import path from 'path'

// 1. Ensure DATABASE_URL and DIRECT_URL are populated in process.env before Prisma Client initializes
function initEnv() {
  if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) {
    try {
      const cwd = process.cwd()
      const envPaths = [path.join(cwd, '.env.local'), path.join(cwd, '.env')]
      for (const envPath of envPaths) {
        if (fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, 'utf-8')
          const dbMatch = content.match(/^DATABASE_URL=["']?([^"'\r\n]+)["']?/m)
          const dirMatch = content.match(/^DIRECT_URL=["']?([^"'\r\n]+)["']?/m)
          if (dbMatch && dbMatch[1] && !process.env.DATABASE_URL) {
            process.env.DATABASE_URL = dbMatch[1].trim()
          }
          if (dirMatch && dirMatch[1] && !process.env.DIRECT_URL) {
            process.env.DIRECT_URL = dirMatch[1].trim()
          }
        }
      }
    } catch (e) {
      // Ignore file system errors
    }
  }
}

initEnv()

import { PrismaClient } from '@prisma/client'

// Singleton pattern — always cache in globalThis to prevent connection pool exhaustion
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const resolvedDbUrl = process.env.DATABASE_URL?.trim()

const basePrisma = new PrismaClient({
  datasources: {
    db: {
      url: resolvedDbUrl || 'postgresql://postgres.ctbhiqkgzgmjicvcgsxa:Prakashanandji.24@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require',
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