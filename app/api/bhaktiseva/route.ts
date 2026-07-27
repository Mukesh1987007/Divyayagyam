import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const offerings = await prisma.bhaktiSevaOffering.findMany({
      where: {
        isActive: true
      }
    })
    return NextResponse.json({ offerings })
  } catch (error) {
    console.error('Error fetching bhaktiSeva offerings:', error)
    return NextResponse.json({ offerings: [] }, { status: 500 })
  }
}
