import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

// GET /api/waitlist - List waitlist entries for a trainer
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

    const waitlist = await prisma.bookingWaitlist.findMany({
      where,
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    })

    return NextResponse.json({ waitlist })
  } catch (error) {
    console.error("Error fetching waitlist:", error)
    return NextResponse.json(
      { error: "Failed to fetch waitlist" },
      { status: 500 }
    )
  }
}

// POST /api/waitlist - Add to waitlist
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
      playerId,
      playerEmail,
      playerPhone,
      desiredDate,
      desiredTimeSlot,
      sessionType,
      duration,
      notes,
      priority,
    } = body

    // Validation
    if (!playerId || !playerEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const waitlistEntry = await prisma.bookingWaitlist.create({
      data: {
        trainerId: trainer.id,
        playerId,
        playerEmail,
        playerPhone,
        desiredDate: desiredDate ? new Date(desiredDate) : null,
        desiredTimeSlot,
        sessionType,
        duration: duration || 60,
        notes,
        priority: priority || 0,
      },
    })

    return NextResponse.json({ waitlist: waitlistEntry }, { status: 201 })
  } catch (error) {
    console.error("Error adding to waitlist:", error)
    return NextResponse.json(
      { error: "Failed to add to waitlist" },
      { status: 500 }
    )
  }
}

