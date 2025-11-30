import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOrCreateUser } from "@/lib/get-or-create-user"

// GET /api/reports - Generate comprehensive reports
export async function GET(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()

    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const reportType = searchParams.get('type') || 'summary' // summary, financial, clients, sessions
    const range = searchParams.get('range') || '30'
    const format = searchParams.get('format') || 'json' // json, csv, pdf
    const rangeInDays = parseInt(range)

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - rangeInDays)
    const endDate = new Date()

    let reportData: any = {}

    switch (reportType) {
      case 'financial':
        reportData = await generateFinancialReport(trainer.id, startDate, endDate)
        break

      case 'clients':
        reportData = await generateClientReport(trainer.id, startDate, endDate)
        break

      case 'sessions':
        reportData = await generateSessionReport(trainer.id, startDate, endDate)
        break

      case 'summary':
      default:
        reportData = await generateSummaryReport(trainer.id, startDate, endDate)
        break
    }

    // Format response based on requested format
    if (format === 'csv') {
      const csv = convertToCSV(reportData)
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${reportType}_report_${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    if (format === 'pdf') {
      // TODO: Implement PDF generation with lib/services/pdf-generator.ts
      return NextResponse.json({
        success: false,
        message: 'PDF export coming soon'
      })
    }

    return NextResponse.json({
      success: true,
      report: reportData,
      meta: {
        type: reportType,
        range: rangeInDays,
        startDate,
        endDate,
        generatedAt: new Date()
      }
    })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    )
  }
}

// FINANCIAL REPORT
async function generateFinancialReport(trainerId: string, startDate: Date, endDate: Date) {
  const payments = await prisma.payment.findMany({
    where: {
      trainerId,
      createdAt: { gte: startDate, lte: endDate }
    },
    include: {
      clients: {
        select: { name: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const totalRevenue = payments
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const pendingRevenue = payments
    .filter(p => p.status === 'PENDING')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  // Overdue = PENDING for more than 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const overdueRevenue = payments
    .filter(p => p.status === 'PENDING' && p.createdAt < thirtyDaysAgo)
    .reduce((sum, p) => sum + Number(p.amount), 0)

  // Revenue by method
  const revenueByMethod = payments
    .filter(p => p.status === 'COMPLETED')
    .reduce((acc: any, p) => {
      const method = p.method || 'UNKNOWN'
      acc[method] = (acc[method] || 0) + Number(p.amount)
      return acc
    }, {})

  // Top paying clients
  const clientRevenue = new Map<string, { name: string; email: string | null; total: number }>()
  payments
    .filter(p => p.status === 'COMPLETED')
    .forEach(p => {
      const clientId = p.clientId
      if (clientId) {
        const existing = clientRevenue.get(clientId) || {
          name: p.client?.name || 'Unknown',
          email: p.client?.email || null,
          total: 0
        }
        existing.total += Number(p.amount)
        clientRevenue.set(clientId, existing)
      }
    })

  const topPayingClients = Array.from(clientRevenue.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  return {
    summary: {
      totalRevenue,
      pendingRevenue,
      overdueRevenue,
      totalPayments: payments.length,
      completedPayments: payments.filter(p => p.status === 'COMPLETED').length,
      pendingPayments: payments.filter(p => p.status === 'PENDING').length
    },
    revenueByMethod,
    topPayingClients,
    transactions: payments.map(p => ({
      id: p.id,
      date: p.createdAt,
      client: p.client?.name || 'Unknown',
      email: p.client?.email,
      amount: p.amount,
      method: p.method,
      status: p.status,
      description: p.description,
      paidAt: p.paidAt
    }))
  }
}

// CLIENT REPORT
async function generateClientReport(trainerId: string, startDate: Date, endDate: Date) {
  const clients = await prisma.client.findMany({
    where: { trainerId },
    include: {
      sessions: {
        where: { scheduledAt: { gte: startDate, lte: endDate } }
      },
      payments: {
        where: { createdAt: { gte: startDate, lte: endDate } }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const newClients = clients.filter(c =>
    c.createdAt >= startDate && c.createdAt <= endDate
  )

  const activeClients = clients.filter(c =>
    c.sessions.some(s => s.scheduledAt >= startDate)
  )

  const inactiveClients = clients.filter(c =>
    !c.sessions.some(s => s.scheduledAt >= startDate)
  )

  const clientList = clients.map(client => {
    const sessionCount = client.sessions.length
    const totalRevenue = client.payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + Number(p.amount), 0)

    const lastSession = client.sessions
      .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime())[0]

    const daysSinceLastSession = lastSession
      ? Math.floor((Date.now() - lastSession.scheduledAt.getTime()) / (1000 * 60 * 60 * 24))
      : null

    return {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      joinedDate: client.createdAt,
      sessionCount,
      totalRevenue,
      lastSessionDate: lastSession?.scheduledAt || null,
      daysSinceLastSession,
      status: daysSinceLastSession === null ? 'Never Booked' :
        daysSinceLastSession <= 7 ? 'Active' :
          daysSinceLastSession <= 30 ? 'Recent' :
            'At Risk'
    }
  })

  return {
    summary: {
      totalClients: clients.length,
      newClients: newClients.length,
      activeClients: activeClients.length,
      inactiveClients: inactiveClients.length
    },
    clientList
  }
}

// SESSION REPORT
async function generateSessionReport(trainerId: string, startDate: Date, endDate: Date) {
  const sessions = await prisma.trainerSession.findMany({
    where: {
      trainerId,
      scheduledAt: { gte: startDate, lte: endDate }
    },
    include: {
      clients: {
        select: { name: true, email: true }
      }
    },
    orderBy: { scheduledAt: 'desc' }
  })

  const totalSessions = sessions.length
  const completedSessions = sessions.filter(s => s.status === 'COMPLETED')
  const cancelledSessions = sessions.filter(s => s.status === 'CANCELLED')
  const noShowSessions = sessions.filter(s => s.status === 'NO_SHOW')

  const completionRate = totalSessions > 0
    ? Math.round((completedSessions.length / totalSessions) * 100)
    : 0

  const cancellationRate = totalSessions > 0
    ? Math.round((cancelledSessions.length / totalSessions) * 100)
    : 0

  const noShowRate = totalSessions > 0
    ? Math.round((noShowSessions.length / totalSessions) * 100)
    : 0

  // Sessions by type
  const sessionsByType = sessions.reduce((acc: any, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1
    return acc
  }, {})

  // Sessions by day of week
  const sessionsByDay = sessions.reduce((acc: any, s) => {
    const day = s.scheduledAt.toLocaleDateString('en-US', { weekday: 'long' })
    acc[day] = (acc[day] || 0) + 1
    return acc
  }, {})

  // Peak hours
  const sessionsByHour = sessions.reduce((acc: any, s) => {
    const hour = s.scheduledAt.getHours()
    acc[hour] = (acc[hour] || 0) + 1
    return acc
  }, {})

  const peakHour = Object.entries(sessionsByHour)
    .sort(([, a]: any, [, b]: any) => b - a)[0]

  return {
    summary: {
      totalSessions,
      completedSessions: completedSessions.length,
      cancelledSessions: cancelledSessions.length,
      noShowSessions: noShowSessions.length,
      completionRate,
      cancellationRate,
      noShowRate
    },
    sessionsByType,
    sessionsByDay,
    peakHour: peakHour ? `${peakHour[0]}:00` : null,
    sessionList: sessions.map(s => ({
      id: s.id,
      title: s.title,
      client: s.client?.name || 'Unknown',
      email: s.client?.email,
      date: s.scheduledAt,
      duration: s.duration,
      type: s.type,
      status: s.status,
      bookedFrom: s.bookedFrom,
      notes: s.notes
    }))
  }
}

// SUMMARY REPORT (combines all)
async function generateSummaryReport(trainerId: string, startDate: Date, endDate: Date) {
  const [financial, clients, sessions] = await Promise.all([
    generateFinancialReport(trainerId, startDate, endDate),
    generateClientReport(trainerId, startDate, endDate),
    generateSessionReport(trainerId, startDate, endDate)
  ])

  return {
    financial: financial.summary,
    client: clients.summary,
    sessions: sessions.summary,
    topClients: financial.topPayingClients.slice(0, 5),
    upcomingHighlights: {
      // Could add upcoming sessions, pending payments, etc.
    }
  }
}

// Convert data to CSV format
function convertToCSV(data: any): string {
  // Simple CSV conversion
  const lines: string[] = []

  if (data.transactions) {
    lines.push('Date,Client,Email,Amount,Method,Status,Description')
    data.transactions.forEach((t: any) => {
      lines.push(`${t.date},${t.client},${t.email || ''},${t.amount},${t.method},${t.status},"${t.description || ''}"`)
    })
  } else if (data.clientList) {
    lines.push('Name,Email,Phone,Joined,Sessions,Revenue,Last Session,Days Since,Status')
    data.clientList.forEach((c: any) => {
      lines.push(`${c.name},${c.email || ''},${c.phone || ''},${c.joinedDate},${c.sessionCount},${c.totalRevenue},${c.lastSessionDate || ''},${c.daysSinceLastSession || ''},${c.status}`)
    })
  } else if (data.sessionList) {
    lines.push('Title,Client,Email,Date,Duration,Type,Status,Booked From')
    data.sessionList.forEach((s: any) => {
      lines.push(`"${s.title}",${s.client},${s.email || ''},${s.date},${s.duration},${s.type},${s.status},${s.bookedFrom || ''}`)
    })
  }

  return lines.join('\n')
}
