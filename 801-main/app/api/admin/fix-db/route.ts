import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "blogs" ALTER COLUMN "authorId" DROP NOT NULL;');
    await prisma.$executeRawUnsafe('ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "seoKeywords" TEXT;');
    return NextResponse.json({ success: true, message: "Database fixed! authorId is optional and seoKeywords is added." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
