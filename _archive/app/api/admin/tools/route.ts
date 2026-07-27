import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const tools = await prisma.spiritualTool.findMany({
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ ok: true, data: tools });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, slug, description, isFree, price, trialDays, isActive, htmlCode, cssCode, jsCode, thumbnail } = await req.json()

    if (!name) {
      return NextResponse.json({ ok: false, error: 'Name is required' }, { status: 400 });
    }

    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const tool = await prisma.spiritualTool.upsert({
      where: { slug: finalSlug },
      create: {
        name,
        slug: finalSlug,
        description,
        isFree: isFree !== undefined ? !!isFree : true,
        price: price ? Number(price) : 0,
        trialDays: trialDays ? Number(trialDays) : 0,
        isActive: isActive !== undefined ? !!isActive : true,
        htmlCode,
        cssCode,
        jsCode,
        thumbnail,
      },
      update: {
        name,
        description,
        isFree: isFree !== undefined ? !!isFree : true,
        price: price ? Number(price) : 0,
        trialDays: trialDays ? Number(trialDays) : 0,
        isActive: isActive !== undefined ? !!isActive : true,
        htmlCode,
        cssCode,
        jsCode,
        thumbnail,
      },
    })

    return NextResponse.json({ ok: true, data: tool });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID is required' }, { status: 400 });
    }

    await prisma.spiritualTool.delete({
      where: { id },
    })

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err.code === 'P2003') {
      return NextResponse.json({ ok: false, error: 'Cannot delete: This item has linked records.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
