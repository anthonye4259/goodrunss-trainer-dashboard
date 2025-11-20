import { NextRequest, NextResponse } from "next/server"
import { getOrCreateUser } from "@/lib/get-or-create-user"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/send-email"

// GET /api/marketing - List all marketing campaigns
export async function GET(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Marketing campaigns stored as simple records (we'd normally have a campaigns table)
    // For now, return mock structure that can be extended
    return NextResponse.json({
      success: true,
      campaigns: [],
      templates: [
        {
          id: 'welcome',
          name: 'Welcome Series',
          description: 'Automated welcome emails for new clients',
          type: 'EMAIL'
        },
        {
          id: 'reengagement',
          name: 'Re-engagement Campaign',
          description: 'Win back inactive clients',
          type: 'EMAIL'
        },
        {
          id: 'promotion',
          name: 'Seasonal Promotion',
          description: 'Holiday/seasonal special offers',
          type: 'EMAIL'
        },
        {
          id: 'social_challenge',
          name: 'Social Media Challenge',
          description: '30-day fitness challenge content',
          type: 'SOCIAL'
        }
      ],
      total: 0
    })
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    )
  }
}

// POST /api/marketing - Create and send marketing campaign
export async function POST(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { 
      name, 
      type, 
      subject, 
      message, 
      audience, 
      scheduleAt 
    } = body

    if (!name || !type || !message) {
      return NextResponse.json(
        { error: "Name, type, and message required" },
        { status: 400 }
      )
    }

    // Get target audience
    let clients: any[] = []

    if (audience === 'all') {
      clients = await prisma.clients.findMany({
        where: { trainerId: trainer.id }
      })
    } else if (audience === 'active') {
      // Clients with sessions in last 30 days
      const recentDate = new Date()
      recentDate.setDate(recentDate.getDate() - 30)

      const recentSessions = await prisma.trainer_sessions.findMany({
        where: {
          trainerId: trainer.id,
          scheduledAt: { gte: recentDate }
        }
      })

      const activeClientIds = new Set(recentSessions.map(s => s.clientId))

      clients = await prisma.clients.findMany({
        where: {
          trainerId: trainer.id,
          id: { in: Array.from(activeClientIds) }
        }
      })
    } else if (audience === 'inactive') {
      // Clients with no sessions in last 30 days
      const recentDate = new Date()
      recentDate.setDate(recentDate.getDate() - 30)

      const allClients = await prisma.clients.findMany({
        where: { trainerId: trainer.id }
      })

      const recentSessions = await prisma.trainer_sessions.findMany({
        where: {
          trainerId: trainer.id,
          scheduledAt: { gte: recentDate }
        }
      })

      const activeClientIds = new Set(recentSessions.map(s => s.clientId))
      clients = allClients.filter(c => !activeClientIds.has(c.id))
    }

    // Send campaign
    let sent = 0
    let failed = 0

    for (const client of clients) {
      if (type === 'EMAIL' && client.email) {
        try {
          const personalizedMessage = message
            .replace('[NAME]', client.name || 'there')
            .replace('[TRAINER]', trainer.name || 'Your Trainer')

          await sendEmail({
            to: client.email,
            subject: subject || `Message from ${trainer.name}`,
            html: `<div style="max-width: 600px; margin: 0 auto;">${personalizedMessage}</div>`,
            text: personalizedMessage.replace(/<[^>]*>/g, '')
          })

          sent++
        } catch (e) {
          failed++
        }
      } else if (type === 'SMS' && client.phone) {
        // Would integrate with Twilio here
        console.log(`[SMS to ${client.phone}] ${message}`)
        sent++
      }
    }

    return NextResponse.json({
      success: true,
      message: "Campaign sent",
      campaign: {
        name,
        type,
        audience,
        sent,
        failed,
        total: clients.length
      }
    })
  } catch (error) {
    console.error("Error creating campaign:", error)
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    )
  }
}

// GET /api/marketing/analytics - Campaign analytics
export async function PATCH(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Would track opens, clicks, conversions
    // For now, return placeholder analytics

    return NextResponse.json({
      success: true,
      analytics: {
        totalCampaigns: 0,
        totalSent: 0,
        avgOpenRate: 0,
        avgClickRate: 0,
        conversions: 0
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
