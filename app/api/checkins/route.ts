import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

// GET /api/checkins - List all check-ins for a trainer
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

    const where: any = { trainerId: trainer.id }
    if (clientId) {
      where.clientId = clientId
    }

    const checkins = await prisma.clientCheckIn.findMany({
      where,
      orderBy: { checkInDate: "desc" },
    })

    return NextResponse.json({ checkins })
  } catch (error) {
    console.error("Error fetching check-ins:", error)
    return NextResponse.json(
      { error: "Failed to fetch check-ins" },
      { status: 500 }
    )
  }
}

// POST /api/checkins - Create a new check-in
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
      checkInType,
      weight,
      bodyFat,
      muscleMass,
      measurements,
      performanceData,
      energyLevel,
      motivation,
      overallFeeling,
      goalsProgress,
      clientNotes,
      trainerNotes,
      progressPhotos,
      nextCheckInDate,
      actionItems,
    } = body

    // Validation
    if (!clientId || !checkInType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const checkin = await prisma.clientCheckIn.create({
      data: {
        trainerId: trainer.id,
        clientId,
        checkInType,
        weight,
        bodyFat,
        muscleMass,
        measurements,
        performanceData,
        energyLevel,
        motivation,
        overallFeeling,
        goalsProgress,
        clientNotes,
        trainerNotes,
        progressPhotos: progressPhotos || [],
        nextCheckInDate: nextCheckInDate ? new Date(nextCheckInDate) : null,
        actionItems: actionItems || [],
      },
    })

    return NextResponse.json({ checkin }, { status: 201 })
  } catch (error) {
    console.error("Error creating check-in:", error)
    return NextResponse.json(
      { error: "Failed to create check-in" },
      { status: 500 }
    )
  }
}

