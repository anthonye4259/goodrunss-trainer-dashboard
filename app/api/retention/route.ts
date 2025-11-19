import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

// GET /api/retention - Get retention metrics for a trainer
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
    const periodType = searchParams.get("periodType") || "monthly"

    // Get retention metrics
    const metrics = await prisma.retentionMetrics.findMany({
      where: {
        trainerId: trainer.id,
        periodType,
      },
      orderBy: { periodStart: "desc" },
      take: 12, // Last 12 periods
    })

    // Get client retention profiles
    const profiles = await prisma.clientRetentionProfile.findMany({
      where: { trainerId: trainer.id },
      orderBy: { churnRisk: "desc" },
    })

    // Get at-risk clients
    const atRiskClients = profiles.filter((p) => p.churnRisk === "high")

    return NextResponse.json({
      metrics,
      profiles,
      atRiskClients,
      summary: {
        totalClients: profiles.length,
        highRisk: profiles.filter((p) => p.churnRisk === "high").length,
        mediumRisk: profiles.filter((p) => p.churnRisk === "medium").length,
        lowRisk: profiles.filter((p) => p.churnRisk === "low").length,
        avgEngagementScore:
          profiles.reduce((sum, p) => sum + p.engagementScore, 0) /
            profiles.length || 0,
      },
    })
  } catch (error) {
    console.error("Error fetching retention data:", error)
    return NextResponse.json(
      { error: "Failed to fetch retention data" },
      { status: 500 }
    )
  }
}

// POST /api/retention/calculate - Calculate retention metrics
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
    const { periodStart, periodEnd, periodType } = body

    if (!periodStart || !periodEnd || !periodType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Calculate metrics
    const startDate = new Date(periodStart)
    const endDate = new Date(periodEnd)

    // Get all clients at start of period
    const clientsAtStart = await prisma.client.findMany({
      where: {
        trainerId: trainer.id,
        createdAt: { lte: startDate },
      },
    })

    // Get new clients in period
    const newClients = await prisma.client.findMany({
      where: {
        trainerId: trainer.id,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // Get active clients (had session in period)
    const activeSessions = await prisma.trainerSession.findMany({
      where: {
        trainerId: trainer.id,
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: { clientId: true },
      distinct: ["clientId"],
    })

    const activeClientIds = new Set(
      activeSessions.map((s) => s.clientId).filter(Boolean)
    )

    const totalClients = clientsAtStart.length + newClients.length
    const activeClients = activeClientIds.size
    const retainedClients = clientsAtStart.filter((c) =>
      activeClientIds.has(c.id)
    ).length
    const churnedClients = clientsAtStart.length - retainedClients

    const retentionRate =
      clientsAtStart.length > 0
        ? (retainedClients / clientsAtStart.length) * 100
        : 0
    const churnRate = clientsAtStart.length > 0
      ? (churnedClients / clientsAtStart.length) * 100
      : 0
    const growthRate =
      clientsAtStart.length > 0
        ? (newClients.length / clientsAtStart.length) * 100
        : 0

    const metrics = await prisma.retentionMetrics.create({
      data: {
        trainerId: trainer.id,
        periodStart: startDate,
        periodEnd: endDate,
        periodType,
        totalClients,
        newClients: newClients.length,
        activeClients,
        churnedClients,
        retainedClients,
        retentionRate,
        churnRate,
        growthRate,
        avgSessionsPerClient: 0, // Calculate if needed
        avgRevenuePerClient: 0, // Calculate if needed
      },
    })

    return NextResponse.json({ metrics }, { status: 201 })
  } catch (error) {
    console.error("Error calculating retention:", error)
    return NextResponse.json(
      { error: "Failed to calculate retention" },
      { status: 500 }
    )
  }
}

