import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trainerId: string }> }
) {
  try {
    const { trainerId } = await params
    
    // Get services from database
    const services = await prisma.trainer_services.findMany({
      where: {
        trainerId,
        isActive: true,
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ trainerId: string }> }
) {
  try {
    const { trainerId } = await params
    const { services } = await request.json()

    if (!services || !Array.isArray(services)) {
      return NextResponse.json(
        { error: "Invalid services data" },
        { status: 400 }
      )
    }

    // Delete existing services and create new ones (upsert)
    await prisma.trainer_services.deleteMany({
      where: { trainerId },
    })

    await prisma.trainer_services.createMany({
      data: services.map((service: any) => ({
        id: service.id || crypto.randomUUID(),
        trainerId,
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

    return NextResponse.json({
      success: true,
      message: "Services saved to database",
    })
  } catch (error) {
    console.error("Error saving data:", error)
    return NextResponse.json(
      { error: "Failed to save data" },
      { status: 500 }
    )
  }
}
