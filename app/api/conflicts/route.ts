import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

// GET /api/conflicts - Get scheduling conflicts for a trainer
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")

    const where: any = { trainerId: trainer.id }
    if (status) {
      where.status = status
    }

    const conflicts = await prisma.schedulingConflict.findMany({
      where,
      orderBy: { detectedAt: "desc" },
    })

    return NextResponse.json({ conflicts })
  } catch (error) {
    console.error("Error fetching conflicts:", error)
    return NextResponse.json(
      { error: "Failed to fetch conflicts" },
      { status: 500 }
    )
  }
}

// POST /api/conflicts - Create a conflict entry
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
      sessionId,
      clientId,
      originalTime,
      conflictType,
      conflictSource,
      severity,
      conflictReason,
      suggestedSlots,
    } = body

    // Validation
    if (!sessionId || !clientId || !originalTime || !conflictType || !conflictReason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const conflict = await prisma.schedulingConflict.create({
      data: {
        trainerId: trainer.id,
        sessionId,
        clientId,
        originalTime: new Date(originalTime),
        conflictType,
        conflictSource,
        severity: severity || "medium",
        conflictReason,
        suggestedSlots,
      },
    })

    return NextResponse.json({ conflict }, { status: 201 })
  } catch (error) {
    console.error("Error creating conflict:", error)
    return NextResponse.json(
      { error: "Failed to create conflict" },
      { status: 500 }
    )
  }
}

