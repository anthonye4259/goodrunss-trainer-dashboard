import { NextRequest, NextResponse } from "next/server"
import { getOrCreateUser } from "@/lib/get-or-create-user"
import { prisma } from "@/lib/prisma"

// GET /api/checkins - List all check-ins for a trainer or specific client
export async function GET(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')
    const limit = parseInt(searchParams.get('limit') || '50')

    // We'll store check-ins in the clients notes field or create a simple JSON structure
    // For now, let's get all clients and their recent sessions as "check-ins"
    const where: any = { trainerId: trainer.id }
    if (clientId) {
      where.id = clientId
    }

    const clients = await prisma.client.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    // Get recent completed sessions as check-ins
    const clientIds = clients.map(c => c.id)
    const recentSessions = await prisma.trainerSession.findMany({
      where: {
        trainerId: trainer.id,
        clientId: { in: clientIds },
        status: 'COMPLETED'
      },
      orderBy: { scheduledAt: 'desc' },
      take: limit
    })

    // Format as check-ins
    const checkins = recentSessions.map(session => ({
      id: session.id,
      clientId: session.clientId,
      date: session.scheduledAt,
      type: 'SESSION_COMPLETE',
      notes: session.notes,
      duration: session.duration
    }))

    return NextResponse.json({
      success: true,
      checkins,
      total: checkins.length
    })
  } catch (error) {
    console.error("Error fetching check-ins:", error)
    return NextResponse.json(
      { error: "Failed to fetch check-ins" },
      { status: 500 }
    )
  }
}

// POST /api/checkins - Create a new check-in (progress entry)
export async function POST(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { 
      clientId, 
      weight, 
      bodyFat, 
      measurements, 
      photos, 
      notes,
      mood,
      energy,
      goals
    } = body

    if (!clientId) {
      return NextResponse.json({ error: "Client ID required" }, { status: 400 })
    }

    // Verify client belongs to trainer
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        trainerId: trainer.id
      }
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Create a check-in entry (stored as a completed session with special type)
    const checkin = await prisma.trainerSession.create({
      data: {
        id: crypto.randomUUID(),
        trainerId: trainer.id,
        clientId,
        title: "Progress Check-in",
        description: "Client progress tracking",
        type: 'PERSONAL_TRAINING',
        duration: 0,
        scheduledAt: new Date(),
        status: 'COMPLETED',
        location: null,
        notes: JSON.stringify({
          type: 'CHECK_IN',
          weight,
          bodyFat,
          measurements,
          photos,
          notes,
          mood,
          energy,
          goals
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: "Check-in created",
      checkin: {
        id: checkin.id,
        clientId,
        date: checkin.scheduledAt,
        data: {
          weight,
          bodyFat,
          measurements,
          notes,
          mood,
          energy
        }
      }
    })
  } catch (error) {
    console.error("Error creating check-in:", error)
    return NextResponse.json(
      { error: "Failed to create check-in" },
      { status: 500 }
    )
  }
}

// PATCH /api/checkins - Update a check-in
export async function PATCH(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { checkinId, ...updates } = body

    if (!checkinId) {
      return NextResponse.json({ error: "Check-in ID required" }, { status: 400 })
    }

    const checkin = await prisma.trainerSession.findFirst({
      where: {
        id: checkinId,
        trainerId: trainer.id
      }
    })

    if (!checkin) {
      return NextResponse.json({ error: "Check-in not found" }, { status: 404 })
    }

    // Parse existing notes and merge with updates
    const existingData = checkin.notes ? JSON.parse(checkin.notes) : {}
    const updatedData = { ...existingData, ...updates, updatedAt: new Date().toISOString() }

    await prisma.trainerSession.update({
      where: { id: checkinId },
      data: {
        notes: JSON.stringify(updatedData),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: "Check-in updated",
      checkin: {
        id: checkinId,
        data: updatedData
      }
    })
  } catch (error) {
    console.error("Error updating check-in:", error)
    return NextResponse.json(
      { error: "Failed to update check-in" },
      { status: 500 }
    )
  }
}

// DELETE /api/checkins - Delete a check-in
export async function DELETE(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const checkinId = searchParams.get('id')

    if (!checkinId) {
      return NextResponse.json({ error: "Check-in ID required" }, { status: 400 })
    }

    await prisma.trainerSession.delete({
      where: {
        id: checkinId,
        trainerId: trainer.id
      }
    })

    return NextResponse.json({
      success: true,
      message: "Check-in deleted"
    })
  } catch (error) {
    console.error("Error deleting check-in:", error)
    return NextResponse.json(
      { error: "Failed to delete check-in" },
      { status: 500 }
    )
  }
}
