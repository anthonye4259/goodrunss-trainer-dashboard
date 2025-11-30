import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOrCreateUser } from "@/lib/get-or-create-user"

// GET /api/analytics - Get comprehensive analytics for a trainer
export async function GET(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()

    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const range = searchParams.get('range') || '30' // days
    const rangeInDays = parseInt(range)

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - rangeInDays)

    // 1. REVENUE ANALYTICS
    const payments = await prisma.payment.findMany({
      where: {
        trainerId: trainer.id,
        createdAt: { gte: startDate },
        status: { in: ['COMPLETED', 'PENDING'] }
      }
    })

    const totalRevenue = payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + Number(p.amount), 0)

    const pendingRevenue = payments
      .filter(p => p.status === 'PENDING')
      .reduce((sum, p) => sum + Number(p.amount), 0)

    // Revenue by day for chart
    const revenueByDay = new Map<string, number>()
    payments
      .filter(p => p.status === 'COMPLETED')
      .forEach(payment => {
        const day = payment.createdAt.toISOString().split('T')[0]
        revenueByDay.set(day, (revenueByDay.get(day) || 0) + Number(payment.amount))
      })

    // 2. CLIENT ANALYTICS
    const clients = await prisma.client.findMany({
      where: { trainerId: trainer.id },
      include: {
        sessions: {
          where: { scheduledAt: { gte: startDate } }
        },
        payments: {
          where: { createdAt: { gte: startDate } }
        }
      }
    })

    const totalClients = clients.length
    const newClients = clients.filter(c => c.createdAt >= startDate).length

    // Active clients (had session in last 30 days)
    const activeClients = clients.filter(c =>
      c.sessions.some(s => s.scheduledAt >= startDate)
    ).length

    // Client retention rate
    const clientsWithRepeatBookings = clients.filter(c =>
      c.sessions.length > 1
    ).length
    const retentionRate = totalClients > 0
      ? Math.round((clientsWithRepeatBookings / totalClients) * 100)
      : 0

    // 3. SESSION ANALYTICS
    const sessions = await prisma.trainerSession.findMany({
      where: {
        trainerId: trainer.id,
        scheduledAt: { gte: startDate }
      }
    })

    const totalSessions = sessions.length
    const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length
    const cancelledSessions = sessions.filter(s => s.status === 'CANCELLED').length
    const upcomingSessions = sessions.filter(s =>
      s.status === 'SCHEDULED' && s.scheduledAt > new Date()
    ).length

    // Session completion rate
    const completionRate = totalSessions > 0
      ? Math.round((completedSessions / totalSessions) * 100)
      : 0

    // Average sessions per client
    const avgSessionsPerClient = totalClients > 0
      ? Math.round((totalSessions / totalClients) * 10) / 10
      : 0

    // Sessions by type
    const sessionsByType = sessions.reduce((acc: any, session) => {
      acc[session.type] = (acc[session.type] || 0) + 1
      return acc
    }, {})

    // 4. BOOKING SOURCE ANALYTICS
    const bookingsBySource = sessions.reduce((acc: any, session) => {
      const source = session.bookedFrom || 'UNKNOWN'
      acc[source] = (acc[source] || 0) + 1
      return acc
    }, {})

    // 5. TIME ANALYTICS
    const sessionsByDayOfWeek = sessions.reduce((acc: any, session) => {
      const day = session.scheduledAt.toLocaleDateString('en-US', { weekday: 'long' })
      acc[day] = (acc[day] || 0) + 1
      return acc
    }, {})

    const sessionsByHour = sessions.reduce((acc: any, session) => {
      const hour = session.scheduledAt.getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {})

    // 6. FINANCIAL METRICS
    const avgRevenuePerSession = completedSessions > 0
      ? Math.round((totalRevenue / completedSessions) * 100) / 100
      : 0

    const avgRevenuePerClient = activeClients > 0
      ? Math.round((totalRevenue / activeClients) * 100) / 100
      : 0

    // 7. TOP CLIENTS (by revenue)
    const topClients = clients
      .map(client => ({
        id: client.id,
        name: client.name,
        email: client.email,
        totalRevenue: client.payment
          .filter(p => p.status === 'COMPLETED')
          .reduce((sum, p) => sum + Number(p.amount), 0),
        sessionCount: client.sessions.length
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10)

    // 8. GROWTH METRICS (compare to previous period)
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - rangeInDays)

    const previousSessions = await prisma.trainerSession.count({
      where: {
        trainerId: trainer.id,
        scheduledAt: { gte: previousStartDate, lt: startDate }
      }
    })

    const previousPayments = await prisma.payment.findMany({
      where: {
        trainerId: trainer.id,
        createdAt: { gte: previousStartDate, lt: startDate },
        status: 'COMPLETED'
      }
    })

    const previousRevenue = previousPayments.reduce((sum, p) => sum + Number(p.amount), 0)

    const sessionGrowth = previousSessions > 0
      ? Math.round(((totalSessions - previousSessions) / previousSessions) * 100)
      : totalSessions > 0 ? 100 : 0

    const revenueGrowth = previousRevenue > 0
      ? Math.round(((totalRevenue - previousRevenue) / previousRevenue) * 100)
      : totalRevenue > 0 ? 100 : 0

    return NextResponse.json({
      success: true,
      analytics: {
        // Summary metrics
        summary: {
          totalRevenue,
          pendingRevenue,
          totalClients,
          newClients,
          activeClients,
          totalSessions,
          completedSessions,
          cancelledSessions,
          upcomingSessions,
          completionRate,
          retentionRate
        },

        // Financial metrics
        financial: {
          totalRevenue,
          pendingRevenue,
          avgRevenuePerSession,
          avgRevenuePerClient,
          revenueByDay: Array.from(revenueByDay.entries()).map(([date, amount]) => ({
            date,
            amount
          }))
        },

        // Client metrics
        clients: {
          total: totalClients,
          new: newClients,
          active: activeClients,
          retentionRate,
          avgSessionsPerClient,
          topClients
        },

        // Session metrics
        sessions: {
          total: totalSessions,
          completed: completedSessions,
          cancelled: cancelledSessions,
          upcoming: upcomingSessions,
          completionRate,
          byType: sessionsByType,
          bySource: bookingsBySource,
          byDayOfWeek: sessionsByDayOfWeek,
          byHour: sessionsByHour
        },

        // Growth metrics
        growth: {
          sessionGrowth,
          revenueGrowth,
          previousPeriod: {
            sessions: previousSessions,
            revenue: previousRevenue
          }
        },

        // Metadata
        meta: {
          rangeInDays,
          startDate,
          endDate: new Date(),
          generatedAt: new Date()
        }
      }
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
