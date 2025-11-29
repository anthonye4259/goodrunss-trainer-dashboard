import { NextRequest, NextResponse } from "next/server"
import { getOrCreateUser } from "@/lib/get-or-create-user"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/send-email"

// GET /api/waitlist - Get waitlist entries for a trainer
export async function GET(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const statusFilter = searchParams.get('status') || 'WAITING'

    // Get waitlist entries (we'll store in trainer_sessions with title starting with "Waitlist:")
    const waitlistEntries = await prisma.trainer_sessions.findMany({
      where: {
        trainerId: trainer.id,
        title: { startsWith: 'Waitlist:' }
      },
      include: {
        clients: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc' // First come, first served
      }
    })

    // Filter by status from notes
    const filteredEntries = statusFilter === 'ALL' ? waitlistEntries : waitlistEntries.filter(e => {
      try {
        const notes = e.notes ? JSON.parse(e.notes) : {}
        return notes.waitlistStatus === statusFilter
      } catch (err) {
        return false
      }
    })

    // Organize by requested date/time
    const organized = filteredEntries.map(entry => {
      let waitlistStatus = 'WAITING'
      try {
        const notes = entry.notes ? JSON.parse(entry.notes) : {}
        waitlistStatus = notes.waitlistStatus || 'WAITING'
      } catch (e) {}

      return {
        id: entry.id,
        client: entry.clients,
        requestedDate: entry.scheduledAt,
        duration: entry.duration,
        notes: entry.notes,
        priority: entry.createdAt, // Earlier = higher priority
        status: waitlistStatus,
        createdAt: entry.createdAt
      }
    })

    return NextResponse.json({
      success: true,
      waitlist: organized,
      total: organized.length,
      byStatus: {
        waiting: organized.filter(e => e.status === 'WAITING').length,
        notified: organized.filter(e => e.status === 'NOTIFIED').length
      }
    })
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
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { clientId, requestedDate, requestedTime, duration, notes } = body

    if (!clientId || !requestedDate) {
      return NextResponse.json(
        { error: "clientId and requestedDate are required" },
        { status: 400 }
      )
    }

    // Get client info
    const client = await prisma.clients.findFirst({
      where: { id: clientId, trainerId: trainer.id }
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Create waitlist entry as a session with "Waitlist:" prefix
    const scheduledAt = requestedTime 
      ? new Date(`${requestedDate}T${requestedTime}:00`) 
      : new Date(requestedDate)

    const waitlistEntry = await prisma.trainer_sessions.create({
      data: {
        id: crypto.randomUUID(),
        trainerId: trainer.id,
        clientId,
        title: `Waitlist: ${client.name}`,
        description: notes || 'Waitlist entry',
        type: 'PERSONAL_TRAINING',
        duration: duration || 60,
        scheduledAt,
        status: 'SCHEDULED',
        location: null,
        notes: JSON.stringify({
          waitlistStatus: 'WAITING',
          originalNotes: notes || ''
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Notify client they've been added to waitlist
    if (client.email) {
      await sendEmail({
        to: client.email,
        subject: "You're on the Waitlist!",
        html: `<h2>Waitlist Confirmation</h2><p>Hi ${client.name}!</p><p>You've been added to the waitlist for ${scheduledAt.toLocaleDateString()} at ${scheduledAt.toLocaleTimeString()}.</p><p>We'll notify you as soon as a spot opens up!</p><p>${trainer.name}</p>`,
        text: `Hi ${client.name}! You've been added to the waitlist. We'll notify you when a spot opens up!`
      })
    }

    return NextResponse.json({
      success: true,
      message: "Added to waitlist",
      entry: waitlistEntry
    })
  } catch (error) {
    console.error("Error adding to waitlist:", error)
    return NextResponse.json(
      { error: "Failed to add to waitlist" },
      { status: 500 }
    )
  }
}

// PATCH /api/waitlist - Notify waitlist (when spot opens)
export async function PATCH(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { waitlistId, action } = body

    const entry = await prisma.trainer_sessions.findFirst({
      where: {
        id: waitlistId,
        trainerId: trainer.id,
        title: { startsWith: 'Waitlist:' }
      },
      include: {
        clients: true
      }
    })

    if (!entry) {
      return NextResponse.json({ error: "Waitlist entry not found" }, { status: 404 })
    }

    if (action === 'notify') {
      // Mark as notified in notes
      const currentNotes = entry.notes ? JSON.parse(entry.notes) : {}
      await prisma.trainer_sessions.update({
        where: { id: waitlistId },
        data: { 
          notes: JSON.stringify({ ...currentNotes, waitlistStatus: 'NOTIFIED' }), 
          updatedAt: new Date() 
        }
      })

      // Send notification email
      if (entry.clients?.email) {
        await sendEmail({
          to: entry.clients.email,
          subject: "A Spot Opened Up! 🎉",
          html: `<h2>Great News, ${entry.clients.name}!</h2><p>A spot has opened up for ${entry.scheduledAt.toLocaleDateString()} at ${entry.scheduledAt.toLocaleTimeString()}!</p><p>Reply to this email or contact us ASAP to confirm your booking.</p><p>${trainer.name}</p>`,
          text: `Great news! A spot opened up for ${entry.scheduledAt.toLocaleString()}. Contact us ASAP to book!`
        })
      }

      return NextResponse.json({
        success: true,
        message: "Client notified of opening",
        action: 'notified'
      })
    } else if (action === 'convert') {
      // Convert to actual booked session by removing "Waitlist:" prefix
      const newTitle = entry.title.replace('Waitlist: ', '')
      await prisma.trainer_sessions.update({
        where: { id: waitlistId },
        data: { 
          title: newTitle,
          status: 'SCHEDULED', 
          notes: null, // Clear waitlist metadata
          updatedAt: new Date() 
        }
      })

      // Send confirmation
      if (entry.clients?.email) {
        await sendEmail({
          to: entry.clients.email,
          subject: "Session Confirmed! ✅",
          html: `<h2>You're Booked, ${entry.clients.name}!</h2><p>Your session is confirmed for:</p><p><strong>${entry.scheduledAt.toLocaleString()}</strong></p><p>Duration: ${entry.duration} minutes</p><p>See you then!<br>${trainer.name}</p>`,
          text: `Session confirmed for ${entry.scheduledAt.toLocaleString()}. ${entry.duration} minutes. See you then!`
        })
      }

      return NextResponse.json({
        success: true,
        message: "Converted to scheduled session",
        action: 'converted'
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error updating waitlist:", error)
    return NextResponse.json(
      { error: "Failed to update waitlist" },
      { status: 500 }
    )
  }
}

// DELETE /api/waitlist - Remove from waitlist
export async function DELETE(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const waitlistId = searchParams.get('id')

    if (!waitlistId) {
      return NextResponse.json({ error: "Waitlist ID required" }, { status: 400 })
    }

    await prisma.trainer_sessions.delete({
      where: {
        id: waitlistId,
        trainerId: trainer.id
      }
    })

    return NextResponse.json({
      success: true,
      message: "Removed from waitlist"
    })
  } catch (error) {
    console.error("Error removing from waitlist:", error)
    return NextResponse.json(
      { error: "Failed to remove from waitlist" },
      { status: 500 }
    )
  }
}
