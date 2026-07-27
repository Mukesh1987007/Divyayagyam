import { PrismaClient } from '@prisma/client'

// Singleton pattern — always cache in globalThis
// This prevents "too many connections" in both dev AND production (serverless)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
})

// Advanced Auto-Healer: Automatically wraps EVERY database query in the entire app.
// If the DB drops connection or is busy, it auto-retries. The developer doesn't have to think about it!
export const prisma = globalForPrisma.prisma ?? basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const retries = 3;
        const delayMs = 800;
        let lastError: any;
        
        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            return await query(args);
          } catch (err: any) {
            lastError = err;
            // P2024: Timeout, P1001: Can't reach DB, P1008: Operation Timeout, P2028: Transaction Error
            const isTransient = err?.code === 'P2024' || err?.code === 'P1001' || err?.code === 'P1008' || err?.code === 'P2028';
            
            if (isTransient && attempt < retries) {
// console.warn(`🛡️ [Auto-Heal] DB connection issue on ${model}.${operation}. Retrying in ${delayMs * attempt}ms...`); (removed for production)
              await new Promise(res => setTimeout(res, delayMs * attempt));
              continue;
            }
            throw err;
          }
        }
        throw lastError;
      }
    }
  }
}) as unknown as PrismaClient

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
