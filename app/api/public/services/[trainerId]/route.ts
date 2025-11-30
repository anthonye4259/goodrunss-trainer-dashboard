import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trainerId: string }> }
) {
  try {
    const { trainerId } = await params
    
    // Fetch trainer's services from database
    const services = await prisma.trainerService.findMany({
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

    // Delete existing services
    await prisma.trainerService.deleteMany({
      where: { trainerId },
    })

    // Create new services
    if (services.length > 0) {
      await prisma.trainerService.createMany({
        data: services.map((service: any) => ({
          id: crypto.randomUUID(),
          trainerId,
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

    return NextResponse.json({
      success: true,
      message: "Services saved successfully",
    })
  } catch (error) {
    console.error("Error saving services:", error)
    return NextResponse.json(
      { error: "Failed to save services" },
      { status: 500 }
    )
  }
}
