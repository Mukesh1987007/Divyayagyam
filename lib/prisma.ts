import { PrismaClient } from '@prisma/client'

// Singleton pattern — always cache in globalThis
// This prevents "too many connections" in both dev AND production (serverless)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const dbUrl = process.env.DATABASE_URL?.trim()

const basePrisma = new PrismaClient(
  dbUrl
    ? {
        datasources: {
          db: { url: dbUrl },
        },
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
      }
    : {
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
      }
)

export const prisma = globalForPrisma.prisma ?? basePrisma

// Always cache — critical for serverless to avoid connection pool exhaustion
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