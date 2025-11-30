import { NextRequest, NextResponse } from "next/server"
import { getOrCreateUser } from "@/lib/get-or-create-user"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/send-email"

// GET /api/retention - Get comprehensive retention analytics
export async function GET(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || '30' // Days

    const daysAgo = parseInt(period)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo)

    // Get all clients
    const allClients = await prisma.client.findMany({
      where: { trainerId: trainer.id }
    })

    // Get recent sessions
    const recentSessions = await prisma.trainerSession.findMany({
      where: {
        trainerId: trainer.id,
        scheduledAt: { gte: cutoffDate },
        status: { in: ['COMPLETED', 'SCHEDULED', 'CONFIRMED'] }
      }
    })

    // Calculate client activity
    const clientActivity = new Map<string, { lastSession: Date; sessionCount: number }>()

    for (const session of recentSessions) {
      if (!session.clientId) continue // Skip sessions without client

      const existing = clientActivity.get(session.clientId)
      if (!existing || session.scheduledAt > existing.lastSession) {
        clientActivity.set(session.clientId, {
          lastSession: session.scheduledAt,
          sessionCount: (existing?.sessionCount || 0) + 1
        })
      }
    }

    // Categorize clients
    const activeClients: any[] = []
    const atRiskClients: any[] = []
    const inactiveClients: any[] = []
    const churnedClients: any[] = []

    const now = new Date()

    for (const client of allClients) {
      const activity = clientActivity.get(client.id)

      if (!activity) {
        // Never had a session in this period
        churnedClients.push({
          ...client,
          status: 'CHURNED',
          daysSinceLastSession: null,
          risk: 'CRITICAL'
        })
      } else {
        const daysSince = Math.floor((now.getTime() - activity.lastSession.getTime()) / (1000 * 60 * 60 * 24))

        if (daysSince <= 7) {
          activeClients.push({
            ...client,
            status: 'ACTIVE',
            daysSinceLastSession: daysSince,
            sessionCount: activity.sessionCount,
            risk: 'LOW'
          })
        } else if (daysSince <= 14) {
          atRiskClients.push({
            ...client,
            status: 'AT_RISK',
            daysSinceLastSession: daysSince,
            sessionCount: activity.sessionCount,
            risk: 'MEDIUM'
          })
        } else if (daysSince <= 30) {
          inactiveClients.push({
            ...client,
            status: 'INACTIVE',
            daysSinceLastSession: daysSince,
            sessionCount: activity.sessionCount,
            risk: 'HIGH'
          })
        } else {
          churnedClients.push({
            ...client,
            status: 'CHURNED',
            daysSinceLastSession: daysSince,
            sessionCount: activity.sessionCount,
            risk: 'CRITICAL'
          })
        }
      }
    }

    // Calculate retention rate
    const totalClients = allClients.length
    const retainedClients = activeClients.length + atRiskClients.length
    const retentionRate = totalClients > 0 ? (retainedClients / totalClients) * 100 : 0
    const churnRate = totalClients > 0 ? (churnedClients.length / totalClients) * 100 : 0

    // Calculate engagement metrics
    const avgSessionsPerClient = totalClients > 0
      ? recentSessions.length / totalClients
      : 0

    // Generate recommendations
    const recommendations: any[] = []

    if (atRiskClients.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        type: 'RE_ENGAGE',
        title: `Re-engage ${atRiskClients.length} at-risk clients`,
        action: 'Send personalized check-in messages',
        client: atRiskClients.slice(0, 5).map(c => c.name)
      })
    }

    if (churnedClients.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        type: 'WIN_BACK',
        title: `Win back ${churnedClients.length} churned clients`,
        action: 'Send special comeback offer',
        client: churnedClients.slice(0, 5).map(c => c.name)
      })
    }

    if (retentionRate < 60) {
      recommendations.push({
        priority: 'CRITICAL',
        type: 'STRATEGY',
        title: 'Retention rate below 60%',
        action: 'Review pricing, service quality, and client satisfaction'
      })
    }

    return NextResponse.json({
      success: true,
      retention: {
        period: daysAgo,
        retentionRate: Math.round(retentionRate),
        churnRate: Math.round(churnRate),
        avgSessionsPerClient: Math.round(avgSessionsPerClient * 10) / 10
      },
      clients: {
        total: totalClients,
        active: activeClients.length,
        atRisk: atRiskClients.length,
        inactive: inactiveClients.length,
        churned: churnedClients.length
      },
      lists: {
        active: activeClients,
        atRisk: atRiskClients,
        inactive: inactiveClients,
        churned: churnedClients
      },
      recommendations
    })
  } catch (error) {
    console.error("Error fetching retention:", error)
    return NextResponse.json(
      { error: "Failed to fetch retention" },
      { status: 500 }
    )
  }
}

// POST /api/retention - Send re-engagement campaign
export async function POST(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { clientIds, message, subject, offerType } = body

    if (!clientIds || clientIds.length === 0) {
      return NextResponse.json(
        { error: "Client IDs required" },
        { status: 400 }
      )
    }

    const clients = await prisma.client.findMany({
      where: {
        id: { in: clientIds },
        trainerId: trainer.id
      }
    })

    let sent = 0
    const defaultSubject = subject || "We Miss You! 💪"
    const defaultMessage = message || `Hi [NAME]! We noticed it's been a while since your last session. We'd love to see you back!`

    for (const client of clients) {
      if (client.email) {
        const personalizedMessage = defaultMessage.replace('[NAME]', client.name || 'there')

        let offerText = ''
        if (offerType === '25_OFF') {
          offerText = '<p><strong>🎁 Special Offer: 25% off your next 3 sessions!</strong></p>'
        } else if (offerType === 'FREE_SESSION') {
          offerText = '<p><strong>🎁 Special Offer: Your next session is on us!</strong></p>'
        }

        await sendEmail({
          to: client.email,
          subject: defaultSubject,
          html: `<h2>${defaultSubject}</h2><p>${personalizedMessage}</p>${offerText}<p>Reply to this email or book directly to get back on track!</p><p>Best,<br>${trainer.name}</p>`,
          text: `${personalizedMessage}\n\n${offerText ? 'Special offer included! ' : ''}Reply to get back on track!`
        })

        sent++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Re-engagement campaign sent to ${sent} clients`,
      sent
    })
  } catch (error) {
    console.error("Error sending retention campaign:", error)
    return NextResponse.json(
      { error: "Failed to send retention campaign" },
      { status: 500 }
    )
  }
}
