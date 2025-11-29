import { NextRequest, NextResponse } from "next/server"
import { getOrCreateUser } from "@/lib/get-or-create-user"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/send-email"

// GET /api/group-classes - List all group classes for a trainer
export async function GET(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Group classes are sessions with type PERSONAL_TRAINING and title starting with "Group:"
    const classes = await prisma.trainer_sessions.findMany({
      where: {
        trainerId: trainer.id,
        title: { startsWith: 'Group:' }
      },
      orderBy: {
        scheduledAt: 'desc'
      }
    })

    // Get participant counts from notes (we'll store as JSON)
    const classesWithDetails = classes.map(cls => {
      let participants: any[] = []
      let capacity = 10
      
      try {
        if (cls.notes) {
          const data = JSON.parse(cls.notes)
          participants = data.participants || []
          capacity = data.capacity || 10
        }
      } catch (e) {
        // Invalid JSON, ignore
      }

      return {
        id: cls.id,
        title: cls.title,
        description: cls.description,
        scheduledAt: cls.scheduledAt,
        duration: cls.duration,
        location: cls.location,
        status: cls.status,
        capacity,
        enrolled: participants.length,
        spotsLeft: capacity - participants.length,
        participants
      }
    })

    return NextResponse.json({
      success: true,
      classes: classesWithDetails,
      total: classesWithDetails.length
    })
  } catch (error) {
    console.error("Error fetching group classes:", error)
    return NextResponse.json(
      { error: "Failed to fetch group classes" },
      { status: 500 }
    )
  }
}

// POST /api/group-classes - Create a new group class
export async function POST(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { 
      title, 
      description, 
      scheduledAt, 
      duration, 
      capacity, 
      price,
      location 
    } = body

    if (!title || !scheduledAt) {
      return NextResponse.json(
        { error: "Title and scheduled time required" },
        { status: 400 }
      )
    }

    const groupClass = await prisma.trainer_sessions.create({
      data: {
        id: crypto.randomUUID(),
        trainerId: trainer.id,
        clientId: null, // Group class has no single client
        title: `Group: ${title}`,
        description: description || null,
        type: 'PERSONAL_TRAINING',
        duration: duration || 60,
        scheduledAt: new Date(scheduledAt),
        status: 'SCHEDULED',
        location: location || null,
        notes: JSON.stringify({
          capacity: capacity || 10,
          price: price || 0,
          participants: []
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: "Group class created",
      class: {
        id: groupClass.id,
        title,
        scheduledAt,
        capacity: capacity || 10,
        enrolled: 0
      }
    })
  } catch (error) {
    console.error("Error creating group class:", error)
    return NextResponse.json(
      { error: "Failed to create group class" },
      { status: 500 }
    )
  }
}

// PATCH /api/group-classes - Enroll/unenroll participant
export async function PATCH(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { classId, clientId, action } = body

    if (!classId || !clientId || !action) {
      return NextResponse.json(
        { error: "classId, clientId, and action required" },
        { status: 400 }
      )
    }

    const groupClass = await prisma.trainer_sessions.findFirst({
      where: {
        id: classId,
        trainerId: trainer.id,
        title: { startsWith: 'Group:' }
      }
    })

    if (!groupClass) {
      return NextResponse.json({ error: "Group class not found" }, { status: 404 })
    }

    const client = await prisma.clients.findFirst({
      where: { id: clientId, trainerId: trainer.id }
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Parse existing data
    const data = groupClass.notes ? JSON.parse(groupClass.notes) : { capacity: 10, participants: [] }
    let participants = data.participants || []

    if (action === 'enroll') {
      // Check capacity
      if (participants.length >= data.capacity) {
        return NextResponse.json(
          { error: "Class is full" },
          { status: 400 }
        )
      }

      // Check if already enrolled
      if (participants.some((p: any) => p.clientId === clientId)) {
        return NextResponse.json(
          { error: "Client already enrolled" },
          { status: 400 }
        )
      }

      participants.push({
        clientId,
        clientName: client.name,
        clientEmail: client.email,
        enrolledAt: new Date().toISOString()
      })

      // Send confirmation email
      if (client.email) {
        await sendEmail({
          to: client.email,
          subject: `Enrolled: ${groupClass.title}`,
          html: `<h2>You're In! 🎉</h2><p>Hi ${client.name}!</p><p>You've been enrolled in <strong>${groupClass.title}</strong>.</p><p><strong>When:</strong> ${groupClass.scheduledAt.toLocaleString()}<br><strong>Duration:</strong> ${groupClass.duration} minutes<br><strong>Location:</strong> ${groupClass.location || 'TBD'}</p><p>See you there!</p>`,
          text: `You're enrolled in ${groupClass.title} on ${groupClass.scheduledAt.toLocaleString()}!`
        })
      }
    } else if (action === 'unenroll') {
      participants = participants.filter((p: any) => p.clientId !== clientId)
    }

    // Update class
    await prisma.trainer_sessions.update({
      where: { id: classId },
      data: {
        notes: JSON.stringify({ ...data, participants }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: action === 'enroll' ? 'Client enrolled' : 'Client unenrolled',
      enrolled: participants.length,
      spotsLeft: data.capacity - participants.length
    })
  } catch (error) {
    console.error("Error updating group class:", error)
    return NextResponse.json(
      { error: "Failed to update group class" },
      { status: 500 }
    )
  }
}

// DELETE /api/group-classes - Delete/cancel group class
export async function DELETE(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const classId = searchParams.get('id')

    if (!classId) {
      return NextResponse.json({ error: "Class ID required" }, { status: 400 })
    }

    const groupClass = await prisma.trainer_sessions.findFirst({
      where: {
        id: classId,
        trainerId: trainer.id
      }
    })

    if (!groupClass) {
      return NextResponse.json({ error: "Group class not found" }, { status: 404 })
    }

    // Notify all participants
    try {
      if (groupClass.notes) {
        const data = JSON.parse(groupClass.notes)
        const participants = data.participants || []
        
        for (const participant of participants) {
          if (participant.clientEmail) {
            await sendEmail({
              to: participant.clientEmail,
              subject: `Cancelled: ${groupClass.title}`,
              html: `<h2>Class Cancelled</h2><p>Hi ${participant.clientName}!</p><p>Unfortunately, <strong>${groupClass.title}</strong> on ${groupClass.scheduledAt.toLocaleString()} has been cancelled.</p><p>We apologize for the inconvenience. We'll notify you of future classes!</p>`,
              text: `Class cancelled: ${groupClass.title} on ${groupClass.scheduledAt.toLocaleString()}`
            })
          }
        }
      }
    } catch (e) {
      console.error('Error notifying participants:', e)
    }

    await prisma.trainer_sessions.delete({
      where: { id: classId }
    })

    return NextResponse.json({
      success: true,
      message: "Group class deleted and participants notified"
    })
  } catch (error) {
    console.error("Error deleting group class:", error)
    return NextResponse.json(
      { error: "Failed to delete group class" },
      { status: 500 }
    )
  }
}
