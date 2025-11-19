import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

// GET /api/analytics - Get analytics for a trainer
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
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const metric = searchParams.get("metric")

    const where: any = { trainerId: trainer.id }
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }
    
    if (metric) {
      where.metric = metric
    }

    const analytics = await prisma.analytics.findMany({
      where,
      orderBy: { date: "desc" },
    })

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}

// POST /api/analytics - Create analytics entry
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
    const { date, metric, value, metadata } = body

    // Validation
    if (!date || !metric || value === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const analytics = await prisma.analytics.create({
      data: {
        trainerId: trainer.id,
        date: new Date(date),
        metric,
        value,
        metadata,
      },
    })

    return NextResponse.json({ analytics }, { status: 201 })
  } catch (error) {
    console.error("Error creating analytics:", error)
    return NextResponse.json(
      { error: "Failed to create analytics" },
      { status: 500 }
    )
  }
}

