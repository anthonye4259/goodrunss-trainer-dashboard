import { NextRequest, NextResponse } from "next/server"
import { getOrCreateUser } from "@/lib/get-or-create-user"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/send-email"

// GET /api/programs - List all training programs
export async function GET(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')

    // Programs are stored as workout plans with special type
    const where: any = { trainerId: trainer.id }
    if (clientId) {
      where.clientId = clientId
    }

    const programs = await prisma.workout_plans.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    // Get associated sessions for each program
    const programsWithDetails = await Promise.all(
      programs.map(async (program) => {
        const sessions = await prisma.trainer_sessions.findMany({
          where: {
            trainerId: trainer.id,
            clientId: program.clientId || undefined,
            scheduledAt: {
              gte: program.startDate || new Date(),
              lte: program.endDate || new Date()
            }
          }
        })

        return {
          id: program.id,
          name: program.name,
          description: program.description,
          clientId: program.clientId,
          startDate: program.startDate,
          endDate: program.endDate,
          duration: program.duration,
          goal: program.goal,
          status: program.status,
          progress: sessions.filter(s => s.status === 'COMPLETED').length,
          totalSessions: sessions.length,
          completionRate: sessions.length > 0 
            ? Math.round((sessions.filter(s => s.status === 'COMPLETED').length / sessions.length) * 100)
            : 0
        }
      })
    )

    return NextResponse.json({
      success: true,
      programs: programsWithDetails,
      total: programsWithDetails.length
    })
  } catch (error) {
    console.error("Error fetching programs:", error)
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 }
    )
  }
}

// POST /api/programs - Create a new training program
export async function POST(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { 
      name, 
      description, 
      clientId, 
      startDate, 
      weeks, 
      sessionsPerWeek,
      goal,
      createSessions 
    } = body

    if (!name || !startDate || !weeks) {
      return NextResponse.json(
        { error: "Name, start date, and duration required" },
        { status: 400 }
      )
    }

    // Verify client if provided
    if (clientId) {
      const client = await prisma.clients.findFirst({
        where: { id: clientId, trainerId: trainer.id }
      })
      if (!client) {
        return NextResponse.json({ error: "Client not found" }, { status: 404 })
      }
    }

    const start = new Date(startDate)
    const end = new Date(start)
    end.setDate(end.getDate() + (weeks * 7))

    // Create program as workout plan
    const program = await prisma.workout_plans.create({
      data: {
        id: crypto.randomUUID(),
        trainerId: trainer.id,
        clientId: clientId || null,
        name,
        description: description || null,
        startDate: start,
        endDate: end,
        duration: weeks * 7,
        goal: goal || null,
        status: 'ACTIVE',
        difficulty: 'INTERMEDIATE', // Default difficulty
        clientGoals: goal ? [goal] : [],
        fitnessLevel: 'INTERMEDIATE', // Default fitness level
        availableTime: 60, // Default available time per session
        workoutFocus: goal || 'GENERAL',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Auto-create sessions if requested
    if (createSessions && sessionsPerWeek) {
      const totalSessions = weeks * sessionsPerWeek
      const sessions = []

      for (let i = 0; i < totalSessions; i++) {
        const sessionDate = new Date(start)
        const dayOffset = Math.floor(i / sessionsPerWeek) * 7 + (i % sessionsPerWeek) * Math.floor(7 / sessionsPerWeek)
        sessionDate.setDate(sessionDate.getDate() + dayOffset)
        sessionDate.setHours(9, 0, 0, 0) // Default to 9am

        sessions.push({
          id: crypto.randomUUID(),
          trainerId: trainer.id,
          clientId: clientId || null,
          title: `${name} - Session ${i + 1}`,
          description: `Week ${Math.floor(i / sessionsPerWeek) + 1}`,
          type: 'PERSONAL_TRAINING',
          duration: 60,
          scheduledAt: sessionDate,
          status: 'SCHEDULED',
          location: null,
          notes: `Part of program: ${name}`,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }

      await prisma.trainer_sessions.createMany({ data: sessions })
    }

    // Notify client if assigned
    if (clientId) {
      const client = await prisma.clients.findUnique({ where: { id: clientId } })
      if (client?.email) {
        await sendEmail({
          to: client.email,
          subject: `New Training Program: ${name} 🎯`,
          html: `<h2>New ${weeks}-Week Program!</h2><p>Hi ${client.name}!</p><p>You've been enrolled in <strong>${name}</strong>.</p><p><strong>Start Date:</strong> ${start.toLocaleDateString()}<br><strong>Duration:</strong> ${weeks} weeks<br><strong>Goal:</strong> ${goal || 'Get stronger!'}</p><p>Let's crush this together! 💪</p>`,
          text: `New program: ${name}. ${weeks} weeks starting ${start.toLocaleDateString()}.`
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Program created",
      program: {
        id: program.id,
        name,
        weeks,
        startDate: start,
        endDate: end
      }
    })
  } catch (error) {
    console.error("Error creating program:", error)
    return NextResponse.json(
      { error: "Failed to create program" },
      { status: 500 }
    )
  }
}

// PATCH /api/programs - Update program status or details
export async function PATCH(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { programId, status, ...updates } = body

    if (!programId) {
      return NextResponse.json({ error: "Program ID required" }, { status: 400 })
    }

    await prisma.workout_plans.update({
      where: {
        id: programId,
        trainerId: trainer.id
      },
      data: {
        ...updates,
        status: status || undefined,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: "Program updated"
    })
  } catch (error) {
    console.error("Error updating program:", error)
    return NextResponse.json(
      { error: "Failed to update program" },
      { status: 500 }
    )
  }
}

// DELETE /api/programs - Delete program
export async function DELETE(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const programId = searchParams.get('id')

    if (!programId) {
      return NextResponse.json({ error: "Program ID required" }, { status: 400 })
    }

    await prisma.workout_plans.delete({
      where: {
        id: programId,
        trainerId: trainer.id
      }
    })

    return NextResponse.json({
      success: true,
      message: "Program deleted"
    })
  } catch (error) {
    console.error("Error deleting program:", error)
    return NextResponse.json(
      { error: "Failed to delete program" },
      { status: 500 }
    )
  }
}
