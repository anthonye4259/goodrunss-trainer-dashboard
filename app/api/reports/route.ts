import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

// GET /api/reports - List all reports for a trainer
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
    const reportType = searchParams.get("reportType")

    const where: any = { trainerId: trainer.id }
    if (reportType) {
      where.reportType = reportType
    }

    const reports = await prisma.businessReport.findMany({
      where,
      orderBy: { generatedAt: "desc" },
    })

    return NextResponse.json({ reports })
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    )
  }
}

// POST /api/reports - Generate a new report
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
    const { reportType, reportName, periodStart, periodEnd } = body

    // Validation
    if (!reportType || !reportName || !periodStart || !periodEnd) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Generate report data based on type
    let reportData: any = {}
    let summary: any = {}

    if (reportType === "revenue") {
      // Get payments for period
      const payments = await prisma.payment.findMany({
        where: {
          trainerId: trainer.id,
          createdAt: {
            gte: new Date(periodStart),
            lte: new Date(periodEnd),
          },
          status: "COMPLETED",
        },
      })

      const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
      const avgTransaction = totalRevenue / payments.length || 0

      reportData = {
        totalRevenue,
        transactionCount: payments.length,
        avgTransaction,
        payments,
      }

      summary = {
        totalRevenue,
        transactionCount: payments.length,
        avgTransaction,
      }
    } else if (reportType === "sessions") {
      // Get sessions for period
      const sessions = await prisma.trainerSession.findMany({
        where: {
          trainerId: trainer.id,
          scheduledAt: {
            gte: new Date(periodStart),
            lte: new Date(periodEnd),
          },
        },
      })

      const completedSessions = sessions.filter((s) => s.status === "COMPLETED")
      const cancelledSessions = sessions.filter((s) => s.status === "CANCELLED")

      reportData = {
        totalSessions: sessions.length,
        completedSessions: completedSessions.length,
        cancelledSessions: cancelledSessions.length,
        completionRate:
          (completedSessions.length / sessions.length) * 100 || 0,
        sessions,
      }

      summary = {
        totalSessions: sessions.length,
        completedSessions: completedSessions.length,
        completionRate:
          (completedSessions.length / sessions.length) * 100 || 0,
      }
    } else if (reportType === "clients") {
      // Get client metrics
      const clients = await prisma.client.findMany({
        where: {
          trainerId: trainer.id,
          createdAt: {
            gte: new Date(periodStart),
            lte: new Date(periodEnd),
          },
        },
      })

      reportData = {
        totalClients: clients.length,
        clients,
      }

      summary = {
        totalClients: clients.length,
      }
    }

    const report = await prisma.businessReport.create({
      data: {
        trainerId: trainer.id,
        reportType,
        reportName,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        reportData,
        summary,
        generatedBy: "trainer",
      },
    })

    return NextResponse.json({ report }, { status: 201 })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    )
  }
}

