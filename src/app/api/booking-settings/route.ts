import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET - Fetch trainer's booking settings
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ id: userId }, { email: userId }] },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const settings = await prisma.bookingSettings.findUnique({
      where: { trainerId: user.id },
      include: {
        availability: {
          where: { isActive: true },
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
        blockedSlots: {
          where: {
            endTime: { gte: new Date() }, // Only future blocks
          },
          orderBy: { startTime: 'asc' },
        },
      },
    })

    return NextResponse.json({ success: true, settings })
  } catch (error: any) {
    console.error("Error fetching booking settings:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - Create booking settings
export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ id: userId }, { email: userId }] },
      select: { id: true, name: true, bio: true, image: true },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const body = await req.json()
    const {
      bookingSlug,
      displayName,
      bio,
      profilePhotoUrl,
      advanceBookingDays,
      minNoticeHours,
      bufferMinutes,
      sessionTypes,
      requirePayment,
      autoApprove,
    } = body

    // Check if slug is already taken
    const existingSlug = await prisma.bookingSettings.findFirst({
      where: { bookingSlug },
    })

    if (existingSlug && existingSlug.trainerId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Booking slug already taken" },
        { status: 400 }
      )
    }

    const settings = await prisma.bookingSettings.upsert({
      where: { trainerId: user.id },
      create: {
        trainerId: user.id,
        bookingSlug,
        displayName: displayName || user.name || "Trainer",
        bio: bio || user.bio || null,
        profilePhotoUrl: profilePhotoUrl || user.image || null,
        advanceBookingDays: advanceBookingDays || 30,
        minNoticeHours: minNoticeHours || 24,
        bufferMinutes: bufferMinutes || 15,
        sessionTypes: sessionTypes || [],
        requirePayment: requirePayment !== undefined ? requirePayment : true,
        autoApprove: autoApprove !== undefined ? autoApprove : true,
        isActive: true,
      },
      update: {
        bookingSlug,
        displayName: displayName || user.name || "Trainer",
        bio: bio || user.bio || null,
        profilePhotoUrl: profilePhotoUrl || user.image || null,
        advanceBookingDays: advanceBookingDays || 30,
        minNoticeHours: minNoticeHours || 24,
        bufferMinutes: bufferMinutes || 15,
        sessionTypes: sessionTypes || [],
        requirePayment: requirePayment !== undefined ? requirePayment : true,
        autoApprove: autoApprove !== undefined ? autoApprove : true,
      },
    })

    return NextResponse.json({ success: true, settings })
  } catch (error: any) {
    console.error("Error creating/updating booking settings:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PATCH - Update booking settings
export async function PATCH(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ id: userId }, { email: userId }] },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const body = await req.json()

    const settings = await prisma.bookingSettings.update({
      where: { trainerId: user.id },
      data: body,
    })

    return NextResponse.json({ success: true, settings })
  } catch (error: any) {
    console.error("Error updating booking settings:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}


