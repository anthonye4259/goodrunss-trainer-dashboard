import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

// GET /api/group-classes - List all group classes for a trainer
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const trainer = await prisma.users.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 })
    }

    const classes = await prisma.groupClass.findMany({
      where: { trainerId: trainer.id },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ classes })
  } catch (error) {
    console.error("Error fetching group classes:", error)
    return NextResponse.json(
      { error: "Failed to fetch group classes" },
      { status: 500 }
    )
  }
}

// POST /api/group-classes - Create a new group class
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const trainer = await prisma.users.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 })
    }

    const body = await req.json()
    const {
      name,
      description,
      sport,
      level,
      dayOfWeek,
      startTime,
      duration,
      specificDate,
      maxParticipants,
      minParticipants,
      pricePerPerson,
      currency,
      location,
      meetingLink,
      isRecurring,
    } = body

    // Validation
    if (!name || !sport || !duration || !maxParticipants || !pricePerPerson) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const groupClass = await prisma.groupClass.create({
      data: {
        trainerId: trainer.id,
        name,
        description,
        sport,
        level,
        dayOfWeek,
        startTime,
        duration,
        specificDate: specificDate ? new Date(specificDate) : null,
        maxParticipants,
        minParticipants: minParticipants || 1,
        pricePerPerson,
        currency: currency || "USD",
        location,
        meetingLink,
        isRecurring: isRecurring || false,
      },
    })

    return NextResponse.json({ class: groupClass }, { status: 201 })
  } catch (error) {
    console.error("Error creating group class:", error)
    return NextResponse.json(
      { error: "Failed to create group class" },
      { status: 500 }
    )
  }
}

