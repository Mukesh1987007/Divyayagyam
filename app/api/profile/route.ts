import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const authUser = await getCurrentUser()
    if (!authUser) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch full user data including CustomerProfile
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: { customerProfile: true }
    })

    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      ok: true, 
      user: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        gotra: user.customerProfile?.gotra || '',
        createdAt: user.createdAt
      } 
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getCurrentUser()
    if (!authUser) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { fullName, phone, gotra, avatar } = await req.json()

    if (!fullName) {
      return NextResponse.json({ ok: false, error: 'Full name is required' }, { status: 400 });
    }

    // Update User
    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        fullName,
        phone: phone || null,
        avatar: avatar || null,
        // Upsert customer profile for gotra
        customerProfile: {
          upsert: {
            create: { gotra: gotra || null },
            update: { gotra: gotra || null }
          }
        }
      },
      include: { customerProfile: true }
    })

    return NextResponse.json({ 
      ok: true, 
      user: {
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        gotra: updatedUser.customerProfile?.gotra || ''
      }
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to update profile' }, { status: 500 });
  }
}
