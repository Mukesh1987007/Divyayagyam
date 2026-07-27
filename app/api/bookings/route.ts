import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const pujaId = searchParams.get('pujaId')

    if (!pujaId) {
      return NextResponse.json({ ok: false, error: 'Puja ID is required' }, { status: 400 });
    }

    const puja = await prisma.puja.findUnique({
      where: { id: pujaId },
      include: { temple: true },
    })

    if (!puja) {
      return NextResponse.json({ ok: false, error: 'Puja not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: puja });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser().catch(() => null)
    if (!user) {
      return NextResponse.json({ ok: false, error: 'You must be logged in to book a puja' }, { status: 401 });
    }

    const body = await req.json()
    const { 
      pujaId, 
      devoteeName, 
      fatherHusbandName, 
      gotra, 
      members = [], // Array of { name: string }
      selectedOfferingIds = [],
      addCourier = false,
      addDakshina = false,
      packageKey = '1'
    } = body

    if (!pujaId || !devoteeName || !fatherHusbandName) {
      return NextResponse.json({ ok: false, error: 'All mandatory fields must be filled' }, { status: 400 });
    }

    const puja = await prisma.puja.findUnique({
      where: { id: pujaId },
    })

    if (!puja) {
      return NextResponse.json({ ok: false, error: 'Puja not found' }, { status: 404 });
    }

    // 1. SECURE PRICE CALCULATION
    const basePrice = Number(puja.price) || 0
    const packageUpgrades: Record<string, number> = { '1': 0, '2': 550, '4': 1550, '6': 2550 }
    const memberCount = Number(packageKey) || 1
    const packagePrice = basePrice + (packageUpgrades[packageKey] ?? 0)

    let addOnsTotal = 0
    if (addCourier) addOnsTotal += 99
    if (addDakshina) addOnsTotal += 251

    // Fetch offering prices securely from DB to prevent tampering
    if (selectedOfferingIds.length > 0) {
      const offerings = await prisma.bhaktiSevaOffering.findMany({
        where: { id: { in: selectedOfferingIds }, isActive: true }
      })
      offerings.forEach(offering => {
        addOnsTotal += Number(offering.price) || 0
      })
    }

    const total = packagePrice + addOnsTotal

    // 2. CREATE BOOKING WITH NESTED MEMBERS
    const bookingNumber = 'DY-' + Math.floor(100000 + Math.random() * 900000)

    // Build description text for sankalp
    const descriptionText = [
      `Package: ${memberCount} Members`,
      addCourier ? 'Prasad Courier (₹99)' : '',
      addDakshina ? 'Pandit Dakshina (₹251)' : '',
      selectedOfferingIds.length > 0 ? `Extra Offerings Added` : '',
      `Total Payable Amount: ₹${total}`
    ].filter(Boolean).join(' | ')

    // Prepare members array for nested create
    const bookingMembers = [
      { fullName: devoteeName, gotra: gotra || 'Kashyap', relation: 'Self' },
      ...members.filter((m: any) => m && m.name?.trim()).map((m: any) => ({
        fullName: m.name.trim(),
        gotra: gotra || 'Kashyap',
        relation: 'Family'
      }))
    ]

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        pujaId: puja.id,
        bookingNumber,
        memberCount: memberCount,
        subtotal: total, // For now, total and subtotal are same, tax is 0
        total: total,
        gotra: gotra || 'Kashyap',
        sankalpText: `Devotee: ${devoteeName}, Relation Name: ${fatherHusbandName}, Details: ${descriptionText}`,
        specialInstructions: `Father/Husband: ${fatherHusbandName}`,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        members: {
          create: bookingMembers
        }
      },
      include: {
        members: true
      }
    })

    return NextResponse.json({ ok: true, data: booking });
  } catch (err: any) {
// console.error('[BOOKING_ERROR]', err) (removed for production)
    return NextResponse.json({ ok: false, error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
