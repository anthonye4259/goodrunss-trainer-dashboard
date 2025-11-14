import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET - Fetch trainer's availability
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

    const settings = await prisma.bookingSettings.findFirst({
      where: { trainerId: user.id },
      select: { id: true },
    })

    if (!settings) {
      return NextResponse.json(
        { success: false, error: "Booking settings not found. Create settings first." },
        { status: 404 }
      )
    }

    const availability = await prisma.trainerAvailability.findMany({
      where: { settingsId: settings.id },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })

    return NextResponse.json({ success: true, availability })
  } catch (error: any) {
    console.error("Error fetching availability:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - Add availability slot
export async function POST(req: Request) {
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

    const settings = await prisma.bookingSettings.findFirst({
      where: { trainerId: user.id },
      select: { id: true },
    })

    if (!settings) {
      return NextResponse.json(
        { success: false, error: "Booking settings not found. Create settings first." },
        { status: 404 }
      )
    }

    const body = await req.json()
    const { dayOfWeek, startTime, endTime, isActive } = body

    // Validate inputs
    if (dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: "dayOfWeek, startTime, and endTime are required" },
        { status: 400 }
      )
    }

    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json(
        { success: false, error: "dayOfWeek must be between 0 (Sunday) and 6 (Saturday)" },
        { status: 400 }
      )
    }

    const slot = await prisma.trainerAvailability.create({
      data: {
        settingsId: settings.id,
        dayOfWeek,
        startTime,
        endTime,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json({ success: true, slot })
  } catch (error: any) {
    console.error("Error adding availability slot:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE - Remove availability slot
export async function DELETE(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const slotId = searchParams.get("id")

    if (!slotId) {
      return NextResponse.json({ success: false, error: "Slot ID is required" }, { status: 400 })
    }

    // Verify ownership
    const user = await prisma.user.findFirst({
      where: { OR: [{ id: userId }, { email: userId }] },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const settings = await prisma.bookingSettings.findFirst({
      where: { trainerId: user.id },
      select: { id: true },
    })

    if (!settings) {
      return NextResponse.json({ success: false, error: "Booking settings not found" }, { status: 404 })
    }

    const slot = await prisma.trainerAvailability.findFirst({
      where: {
        id: slotId,
        settingsId: settings.id,
      },
    })

    if (!slot) {
      return NextResponse.json(
        { success: false, error: "Slot not found or unauthorized" },
        { status: 404 }
      )
    }

    await prisma.trainerAvailability.delete({
      where: { id: slotId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting availability slot:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}


