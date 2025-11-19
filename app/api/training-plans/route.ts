import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

// GET /api/training-plans - List all workout plans for a trainer
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

    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get("clientId")
    const status = searchParams.get("status")

    const where: any = { trainerId: trainer.id }
    if (clientId) where.clientId = clientId
    if (status) where.status = status

    const plans = await prisma.workoutPlan.findMany({
      where,
      include: {
        _count: {
          select: {
            workouts: true,
            progressUpdates: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ plans })
  } catch (error) {
    console.error("Error fetching training plans:", error)
    return NextResponse.json(
      { error: "Failed to fetch training plans" },
      { status: 500 }
    )
  }
}

// POST /api/training-plans - Create a new workout plan
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
      clientId,
      name,
      description,
      goal,
      duration,
      difficulty,
      clientGoals,
      fitnessLevel,
      availableTime,
      sessionsPerWeek,
      equipment,
      injuries,
      preferences,
      isTemplate,
    } = body

    // Validation
    if (!clientId || !name || !goal || !duration || !difficulty || !fitnessLevel || !availableTime || !sessionsPerWeek) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const totalSessions = duration * sessionsPerWeek

    const plan = await prisma.workoutPlan.create({
      data: {
        trainerId: trainer.id,
        clientId,
        name,
        description,
        goal,
        duration,
        difficulty,
        clientGoals: clientGoals || {},
        fitnessLevel,
        availableTime,
        sessionsPerWeek,
        equipment: equipment || [],
        injuries: injuries || [],
        preferences,
        totalSessions,
        isTemplate: isTemplate || false,
      },
    })

    return NextResponse.json({ plan }, { status: 201 })
  } catch (error) {
    console.error("Error creating training plan:", error)
    return NextResponse.json(
      { error: "Failed to create training plan" },
      { status: 500 }
    )
  }
}

