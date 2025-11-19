import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trainerId: string }> }
) {
  try {
    const { trainerId } = await params
    
    // Get services from user metadata/profile
    const user = await prisma.users.findUnique({
      where: { id: trainerId },
      select: { publicMetadata: true },
    })

    const services = (user?.publicMetadata as any)?.services || []

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

    // Store services in user metadata
    await prisma.users.update({
      where: { id: trainerId },
      data: {
        publicMetadata: {
          services,
        },
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Services saved",
    })
  } catch (error) {
    console.error("Error saving services:", error)
    return NextResponse.json(
      { error: "Failed to save services" },
      { status: 500 }
    )
  }
}
