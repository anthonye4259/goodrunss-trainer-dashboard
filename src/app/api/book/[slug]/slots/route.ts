import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Helper to check if a time slot is blocked
function isSlotBlocked(
  slotStart: Date,
  slotEnd: Date,
  blockedSlots: any[],
  existingBookings: any[]
): boolean {
  // Check blocked slots
  for (const block of blockedSlots) {
    const blockStart = new Date(block.startTime)
    const blockEnd = new Date(block.endTime)
    
    if (
      (slotStart >= blockStart && slotStart < blockEnd) ||
      (slotEnd > blockStart && slotEnd <= blockEnd) ||
      (slotStart <= blockStart && slotEnd >= blockEnd)
    ) {
      return true
    }
  }
  
  // Check existing bookings
  for (const booking of existingBookings) {
    const bookingStart = new Date(booking.startTime)
    const bookingEnd = new Date(booking.endTime)
    
    if (
      (slotStart >= bookingStart && slotStart < bookingEnd) ||
      (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
      (slotStart <= bookingStart && slotEnd >= bookingEnd)
    ) {
      return true
    }
  }
  
  return false
}

// GET - Fetch available time slots for a trainer (PUBLIC)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(req.url)
    const sessionTypeId = searchParams.get("sessionTypeId")
    const startDate = searchParams.get("startDate") // Optional: YYYY-MM-DD
    const endDate = searchParams.get("endDate") // Optional: YYYY-MM-DD

    // Fetch trainer's booking settings
    const settings = await prisma.bookingSettings.findUnique({
      where: { bookingSlug: slug, isActive: true },
      include: {
        availability: {
          where: { isActive: true },
        },
        blockedSlots: {
          where: {
            endTime: { gte: new Date() },
          },
        },
        trainer: {
          select: {
            name: true,
            bio: true,
            image: true,
            specialties: true,
          },
        },
      },
    })

    if (!settings) {
      return NextResponse.json(
        { success: false, error: "Trainer not found or booking not active" },
        { status: 404 }
      )
    }

    // Find the session type
    const sessionTypes = settings.sessionTypes as any[]
    const sessionType = sessionTypes.find((st: any) => st.id === sessionTypeId)

    if (!sessionType) {
      return NextResponse.json(
        { success: false, error: "Session type not found" },
        { status: 404 }
      )
    }

    const duration = sessionType.duration // in minutes

    // Calculate date range
    const now = new Date()
    const minDate = new Date(now.getTime() + settings.minNoticeHours * 60 * 60 * 1000)
    const maxDate = new Date(now.getTime() + settings.advanceBookingDays * 24 * 60 * 60 * 1000)

    const rangeStart = startDate ? new Date(startDate) : minDate
    const rangeEnd = endDate ? new Date(endDate) : maxDate

    // Fetch existing bookings in this range
    const existingBookings = await prisma.publicBooking.findMany({
      where: {
        settingsId: settings.id,
        startTime: { gte: rangeStart, lte: rangeEnd },
        status: { in: ['pending', 'confirmed'] },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    })

    // Generate available slots
    const slots: any[] = []
    const currentDate = new Date(rangeStart)
    currentDate.setHours(0, 0, 0, 0)

    while (currentDate <= rangeEnd) {
      const dayOfWeek = currentDate.getDay()
      
      // Find availability for this day
      const dayAvailability = settings.availability.filter((av: any) => av.dayOfWeek === dayOfWeek)

      for (const avail of dayAvailability) {
        const [startHour, startMinute] = avail.startTime.split(':').map(Number)
        const [endHour, endMinute] = avail.endTime.split(':').map(Number)

        const slotDate = new Date(currentDate)
        slotDate.setHours(startHour, startMinute, 0, 0)

        const endTime = new Date(currentDate)
        endTime.setHours(endHour, endMinute, 0, 0)

        // Generate slots for this availability block
        while (slotDate.getTime() + duration * 60 * 1000 <= endTime.getTime()) {
          const slotEnd = new Date(slotDate.getTime() + duration * 60 * 1000)

          // Check if slot is in the future and meets minimum notice
          if (slotDate >= minDate) {
            // Check if slot is not blocked
            if (!isSlotBlocked(slotDate, slotEnd, settings.blockedSlots, existingBookings)) {
              slots.push({
                startTime: slotDate.toISOString(),
                endTime: slotEnd.toISOString(),
                available: true,
              })
            }
          }

          // Move to next slot (with buffer)
          slotDate.setMinutes(slotDate.getMinutes() + duration + settings.bufferMinutes)
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return NextResponse.json({
      success: true,
      trainer: {
        name: settings.trainer.name,
        bio: settings.trainer.bio,
        image: settings.trainer.image,
        specialties: settings.trainer.specialties,
        displayName: settings.displayName,
        profilePhoto: settings.profilePhotoUrl,
      },
      sessionType,
      slots,
      settings: {
        minNoticeHours: settings.minNoticeHours,
        advanceBookingDays: settings.advanceBookingDays,
        requirePayment: settings.requirePayment,
      },
    })
  } catch (error: any) {
    console.error("Error fetching available slots:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}


