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
        publicMetadata: true,
      },
    })

    if (!trainer || !trainer.isAvailable) {
      return NextResponse.json(
        { error: "Trainer not found or unavailable" },
        { status: 404 }
      )
    }

    // Fetch services from our simple storage endpoint
    let services = []
    try {
      const servicesRes = await fetch(
        `${request.nextUrl.origin}/api/public/services/${trainerId}`
      )
      if (servicesRes.ok) {
        const data = await servicesRes.json()
        services = data.services || []
      }
    } catch (error) {
      console.error("Error loading services:", error)
    }

    // If no services, provide fallback
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
      ]
    }

    // Get sport type from metadata for terminology
    const sportType = (trainer.publicMetadata as any)?.sportType || "PERSONAL_TRAINING"

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

