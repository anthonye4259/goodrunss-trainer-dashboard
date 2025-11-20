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
      },
    })

    if (!trainer || !trainer.isAvailable) {
      return NextResponse.json(
        { error: "Trainer not found or unavailable" },
        { status: 404 }
      )
    }

    // Get services from database
    let services = await prisma.trainer_services.findMany({
      where: {
        trainerId,
        isActive: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    // If no services, provide fallback
    if (services.length === 0) {
      services = [
        {
          id: "default-1",
          trainerId,
          name: "1-on-1 Training Session",
          duration: 60,
          price: trainer.hourlyRate || 100,
          description: "Personalized training session focused on your goals",
          isActive: true,
          currency: "USD",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "default-2",
          trainerId,
          name: "30-Min Consultation",
          duration: 30,
          price: (trainer.hourlyRate || 100) / 2,
          description: "Quick consultation to discuss your fitness goals",
          isActive: true,
          currency: "USD",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as any
    }

    // Use first specialty as sport type, or default
    const sportType = trainer.specialties?.[0] || "PERSONAL_TRAINING"

    return NextResponse.json({
      success: true,
      trainer,
      services,
      sportType,
    })
  } catch (error) {
    console.error("Error fetching trainer:", error)
    return NextResponse.json(
      { error: "Failed to fetch trainer" },
      { status: 500 }
    )
  }
}

