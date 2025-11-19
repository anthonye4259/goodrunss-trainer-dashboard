import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

// GET /api/programs/[id] - Get a specific program
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const program = await prisma.trainingProgram.findFirst({
      where: {
        id: params.id,
        trainerId: trainer.id,
      },
      include: {
        enrolledClients: {
          include: {
            program: true,
          },
        },
      },
    })

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 })
    }

    return NextResponse.json({ program })
  } catch (error) {
    console.error("Error fetching program:", error)
    return NextResponse.json(
      { error: "Failed to fetch program" },
      { status: 500 }
    )
  }
}

// PATCH /api/programs/[id] - Update a program
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify ownership
    const existing = await prisma.trainingProgram.findFirst({
      where: {
        id: params.id,
        trainerId: trainer.id,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 })
    }

    const body = await req.json()
    
    // Calculate totalSessions if duration or sessionsPerWeek changed
    const totalSessions =
      body.duration && body.sessionsPerWeek
        ? body.duration * body.sessionsPerWeek
        : body.duration
        ? body.duration * existing.sessionsPerWeek
        : body.sessionsPerWeek
        ? existing.duration * body.sessionsPerWeek
        : existing.totalSessions

    const program = await prisma.trainingProgram.update({
      where: { id: params.id },
      data: {
        ...body,
        totalSessions,
      },
    })

    return NextResponse.json({ program })
  } catch (error) {
    console.error("Error updating program:", error)
    return NextResponse.json(
      { error: "Failed to update program" },
      { status: 500 }
    )
  }
}

// DELETE /api/programs/[id] - Delete a program
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify ownership
    const program = await prisma.trainingProgram.findFirst({
      where: {
        id: params.id,
        trainerId: trainer.id,
      },
    })

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 })
    }

    await prisma.trainingProgram.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting program:", error)
    return NextResponse.json(
      { error: "Failed to delete program" },
      { status: 500 }
    )
  }
}

