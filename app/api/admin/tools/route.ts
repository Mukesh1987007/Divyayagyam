import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (id) {
      const tool = await prisma.spiritualTool.findUnique({ where: { id } })
      return NextResponse.json({ ok: true, data: tool })
    }

    const tools = await prisma.spiritualTool.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ ok: true, data: tools })
  } catch (error: any) {
    console.error('Tools GET error:', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, slug, description, isFree, price, trialDays, thumbnail, htmlCode, cssCode, jsCode, isActive } = body

    let finalSlug = slug;
    const existing = await prisma.spiritualTool.findUnique({ where: { slug } })
    if (existing) {
      finalSlug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const tool = await prisma.spiritualTool.create({
      data: {
        name,
        slug: finalSlug,
        description,
        isFree,
        price,
        trialDays: trialDays || 0,
        thumbnail,
        htmlCode,
        cssCode,
        jsCode,
        isActive
      }
    })

    return NextResponse.json({ ok: true, data: tool })
  } catch (error: any) {
    console.error('Tools POST error:', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ ok: false, error: 'Missing ID' }, { status: 400 })

    const body = await req.json()
    
    let finalSlug = body.slug;
    if (finalSlug) {
      const existing = await prisma.spiritualTool.findFirst({
        where: { slug: finalSlug, NOT: { id } }
      })
      if (existing) {
        finalSlug = `${finalSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
        body.slug = finalSlug;
      }
    }

    const tool = await prisma.spiritualTool.update({
      where: { id },
      data: body
    })

    return NextResponse.json({ ok: true, data: tool })
  } catch (error: any) {
    console.error('Tools PUT error:', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ ok: false, error: 'Missing ID' }, { status: 400 })

    await prisma.spiritualTool.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Tools DELETE error:', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
