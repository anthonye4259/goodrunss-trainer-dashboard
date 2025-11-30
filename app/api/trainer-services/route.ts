import { NextRequest, NextResponse } from "next/server"
import { getOrCreateUser } from "@/lib/get-or-create-user"
import { prisma } from "@/lib/prisma"

// GET /api/trainer-services - Get trainer's services
export async function GET(request: NextRequest) {
  try {
    const trainer = await getOrCreateUser()

    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch trainer's services from database
    const services = await prisma.trainerService.findMany({
      where: {
        trainerId: trainer.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      services,
    })
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    )
  }
}

// POST /api/trainer-services - Save trainer's services
export async function POST(request: NextRequest) {
  try {
    const trainer = await getOrCreateUser()

    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { services } = await request.json()

    if (!services || !Array.isArray(services)) {
      return NextResponse.json(
        { error: "Invalid services data" },
        { status: 400 }
      )
    }

    // Delete existing services
    await prisma.trainerService.deleteMany({
      where: { trainerId: trainer.id },
    })

    // Create new services
    if (services.length > 0) {
      await prisma.trainerService.createMany({
        data: services.map((service: any) => ({
          id: crypto.randomUUID(),
          trainerId: trainer.id,
          name: service.name,
          description: service.description || '',
          duration: service.duration || 60,
          price: service.price,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      })
    }

    // Fetch and return the updated services
    const updatedServices = await prisma.trainerService.findMany({
      where: { trainerId: trainer.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      message: "Services saved successfully",
      services: updatedServices,
    })
  } catch (error) {
    console.error("Error saving services:", error)
    return NextResponse.json(
      { error: "Failed to save services" },
      { status: 500 }
    )
  }
}
