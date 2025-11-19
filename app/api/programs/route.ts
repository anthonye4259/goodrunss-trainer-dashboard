import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

// GET /api/programs - List all programs for a trainer
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get trainer from database
    const trainer = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 })
    }

    const programs = await prisma.trainingProgram.findMany({
      where: { trainerId: trainer.id },
      include: {
        _count: {
          select: { enrolledClients: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ programs })
  } catch (error) {
    console.error("Error fetching programs:", error)
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 }
    )
  }
}

// POST /api/programs - Create a new program
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const trainer = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 })
    }

    const body = await req.json()
    const {
      name,
      description,
      duration,
      sport,
      level,
      sessionsPerWeek,
      programGoals,
      syllabus,
      milestones,
      price,
      currency,
      isTemplate,
    } = body

    // Validation
    if (!name || !duration || !sport || !level || !sessionsPerWeek) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const totalSessions = duration * sessionsPerWeek

    const program = await prisma.trainingProgram.create({
      data: {
        trainerId: trainer.id,
        name,
        description,
        duration,
        sport,
        level,
        sessionsPerWeek,
        totalSessions,
        programGoals: programGoals || [],
        syllabus,
        milestones,
        price,
        currency: currency || "USD",
        isTemplate: isTemplate || false,
        status: "draft",
      },
    })

    return NextResponse.json({ program }, { status: 201 })
  } catch (error) {
    console.error("Error creating program:", error)
    return NextResponse.json(
      { error: "Failed to create program" },
      { status: 500 }
    )
  }
}

