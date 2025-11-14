import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET - Fetch trainer info and session types (PUBLIC - no auth required)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Fetch trainer's booking settings
    const settings = await prisma.bookingSettings.findUnique({
      where: { bookingSlug: slug, isActive: true },
      include: {
        trainer: {
          select: {
            name: true,
            bio: true,
            image: true,
            specialties: true,
            rating: true,
            totalSessions: true,
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

    return NextResponse.json({
      success: true,
      trainer: {
        name: settings.trainer.name,
        bio: settings.trainer.bio,
        image: settings.trainer.image,
        specialties: settings.trainer.specialties,
        rating: settings.trainer.rating,
        totalSessions: settings.trainer.totalSessions,
        displayName: settings.displayName,
        profilePhoto: settings.profilePhotoUrl || settings.trainer.image,
        bioText: settings.bio || settings.trainer.bio,
      },
      sessionTypes: settings.sessionTypes,
      settings: {
        minNoticeHours: settings.minNoticeHours,
        advanceBookingDays: settings.advanceBookingDays,
        requirePayment: settings.requirePayment,
      },
    })
  } catch (error: any) {
    console.error("Error fetching trainer info:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}


