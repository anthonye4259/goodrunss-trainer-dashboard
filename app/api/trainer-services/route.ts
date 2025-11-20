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

    // Get services from database
    const services = await prisma.trainer_services.findMany({
      where: {
        trainerId: trainer.id,
      },
      orderBy: {
        createdAt: "asc",
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

    // Delete existing services and create new ones
    await prisma.trainer_services.deleteMany({
      where: { trainerId: trainer.id },
    })

    if (services.length > 0) {
      await prisma.trainer_services.createMany({
        data: services.map((service: any) => ({
          id: service.id || crypto.randomUUID(),
          trainerId: trainer.id,
          name: service.name,
          description: service.description || null,
          price: service.price,
          duration: service.duration,
          isActive: service.isActive ?? true,
          currency: service.currency || "USD",
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      })
    }

    return NextResponse.json({
      success: true,
      message: "Services saved to database",
      services,
    })
  } catch (error) {
    console.error("Error saving services:", error)
    return NextResponse.json(
      { error: "Failed to save services" },
      { status: 500 }
    )
  }
}

