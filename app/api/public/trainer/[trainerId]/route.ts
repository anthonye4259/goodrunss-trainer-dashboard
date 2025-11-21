import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trainerId: string }> }
) {
  try {
    const { trainerId } = await params

    const trainer = await prisma.users.findUnique({
      where: { id: trainerId },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        specialties: true,
        hourlyRate: true,
        image: true,
        location: true,
        isAvailable: true,
        sportType: true,
      },
    })

    if (!trainer || !trainer.isAvailable) {
      return NextResponse.json(
        { error: "Trainer not found or unavailable" },
        { status: 404 }
      )
    }

    // Fetch real services from database
    let services = await prisma.trainer_services.findMany({
      where: {
        trainerId,
        isActive: true,
      },
      orderBy: {
        price: 'asc',
      },
      select: {
        id: true,
        name: true,
        description: true,
        duration: true,
        price: true,
      },
    })

    // If no services exist, provide default fallback
    if (services.length === 0) {
      services = [
        {
          id: "default-1",
          name: "1-on-1 Training Session",
          duration: 60,
          price: trainer.hourlyRate || 100,
          description: "Personalized training session focused on your goals",
        },
        {
          id: "default-2",
          name: "30-Min Consultation",
          duration: 30,
          price: (trainer.hourlyRate || 100) / 2,
          description: "Quick consultation to discuss your fitness goals",
        },
      ] as any
    }

    // Use sportType from database, or first specialty, or default
    const sportType = trainer.sportType || trainer.specialties?.[0] || "PERSONAL_TRAINING"

    return NextResponse.json({
      success: true,
      trainer: {
        ...trainer,
        sportType,
      },
      services,
    })
  } catch (error) {
    console.error("Error fetching trainer:", error)
    return NextResponse.json(
      { error: "Failed to fetch trainer" },
      { status: 500 }
    )
  }
}
