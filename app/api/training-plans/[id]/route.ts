import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOrCreateUser } from "@/lib/get-or-create-user"

// GET /api/training-plans/[id] - Get a specific workout plan
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const trainer = await getOrCreateUser()
    
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const plan = await prisma.workout_plans.findFirst({
      where: {
        id,
        trainerId: trainer.id
      }
    })

    if (!plan) {
      return NextResponse.json(
        { error: "Training plan not found" },
        { status: 404 }
      )
    }

    // Fetch client info separately
    const client = await prisma.clients.findUnique({
      where: { id: plan.clientId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true
      }
    })

    // Attach client to plan
    const planWithClient = {
      ...plan,
      clients: client
    }

    // Calculate progress metrics
    const weeksCompleted = Math.floor(plan.completedSessions / plan.sessionsPerWeek)
    const weeksRemaining = plan.duration - weeksCompleted
    const estimatedCompletion = plan.startDate && plan.status === 'active'
      ? new Date(plan.startDate.getTime() + (plan.duration * 7 * 24 * 60 * 60 * 1000))
      : null

    return NextResponse.json({
      success: true,
      plan: {
        ...planWithClient,
        progress: {
          weeksCompleted,
          weeksRemaining,
          estimatedCompletion,
          onTrack: plan.currentWeek <= weeksCompleted + 1
        }
      }
    })
  } catch (error: any) {
    console.error("Error fetching training plan:", error)
    return NextResponse.json(
      { error: "Failed to fetch training plan", details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/training-plans/[id] - Perform actions on a plan
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const trainer = await getOrCreateUser()
    
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { action, ...data } = body

    // Verify ownership
    const plan = await prisma.workout_plans.findFirst({
      where: {
        id,
        trainerId: trainer.id
      }
    })

    if (!plan) {
      return NextResponse.json(
        { error: "Training plan not found" },
        { status: 404 }
      )
    }

    switch (action) {
      case 'activate':
        // Activate a draft plan
        if (plan.status !== 'draft') {
          return NextResponse.json(
            { error: "Only draft plans can be activated" },
            { status: 400 }
          )
        }

        const activatedPlan = await prisma.workout_plans.update({
          where: { id },
          data: {
            status: 'active',
            startDate: data.startDate ? new Date(data.startDate) : new Date(),
            endDate: data.endDate ? new Date(data.endDate) : null,
            updatedAt: new Date()
          }
        })

        // Fetch client separately
        const activatedClient = await prisma.clients.findUnique({
          where: { id: activatedPlan.clientId },
          select: { id: true, name: true, email: true }
        })

        console.log('✅ Training plan activated:', id)

        return NextResponse.json({
          success: true,
          plan: {
            ...activatedPlan,
            clients: activatedClient
          },
          message: 'Training plan activated'
        })

      case 'clone':
        // Clone a plan (useful for templates or repeating plans)
        const clonedPlan = await prisma.workout_plans.create({
          data: {
            id: crypto.randomUUID(),
            trainerId: trainer.id,
            clientId: data.clientId || plan.clientId,
            name: `${plan.name} (Copy)`,
            description: plan.description,
            goal: plan.goal,
            duration: plan.duration,
            difficulty: plan.difficulty,
            clientGoals: plan.clientGoals as any,
            fitnessLevel: plan.fitnessLevel,
            availableTime: plan.availableTime,
            sessionsPerWeek: plan.sessionsPerWeek,
            equipment: plan.equipment,
            injuries: plan.injuries,
            preferences: plan.preferences as any,
            totalSessions: plan.totalSessions,
            generatedBy: 'cloned',
            aiModel: plan.aiModel,
            generationPrompt: plan.generationPrompt,
            status: 'draft',
            isTemplate: data.asTemplate || false,
            currentWeek: 1,
            completedSessions: 0,
            completionRate: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })

        // Fetch client separately
        const clonedClient = await prisma.clients.findUnique({
          where: { id: clonedPlan.clientId },
          select: { id: true, name: true, email: true }
        })

        console.log('✅ Training plan cloned:', clonedPlan.id)

        return NextResponse.json({
          success: true,
          plan: {
            ...clonedPlan,
            clients: clonedClient
          },
          message: 'Training plan cloned successfully'
        })

      case 'complete':
        // Mark plan as completed
        const completedPlan = await prisma.workout_plans.update({
          where: { id },
          data: {
            status: 'completed',
            completionRate: 100,
            completedSessions: plan.totalSessions,
            updatedAt: new Date()
          }
        })

        // Fetch client separately
        const completedClient = await prisma.clients.findUnique({
          where: { id: completedPlan.clientId },
          select: { id: true, name: true, email: true }
        })

        console.log('✅ Training plan completed:', id)

        return NextResponse.json({
          success: true,
          plan: {
            ...completedPlan,
            clients: completedClient
          },
          message: 'Training plan marked as completed'
        })

      case 'archive':
        // Archive a plan
        const archivedPlan = await prisma.workout_plans.update({
          where: { id },
          data: {
            status: 'archived',
            updatedAt: new Date()
          }
        })

        console.log('✅ Training plan archived:', id)

        return NextResponse.json({
          success: true,
          plan: archivedPlan,
          message: 'Training plan archived'
        })

      case 'update_progress':
        // Update session completion
        const sessionsCompleted = data.sessionsCompleted || plan.completedSessions + 1
        const newCompletionRate = (sessionsCompleted / plan.totalSessions) * 100
        const newWeek = Math.floor(sessionsCompleted / plan.sessionsPerWeek) + 1

        const updatedPlan = await prisma.workout_plans.update({
          where: { id },
          data: {
            completedSessions: sessionsCompleted,
            completionRate: newCompletionRate,
            currentWeek: newWeek,
            status: newCompletionRate >= 100 ? 'completed' : plan.status,
            updatedAt: new Date()
          }
        })

        // Fetch client separately
        const updatedClient = await prisma.clients.findUnique({
          where: { id: updatedPlan.clientId },
          select: { id: true, name: true, email: true }
        })

        console.log('✅ Training plan progress updated:', id)

        return NextResponse.json({
          success: true,
          plan: {
            ...updatedPlan,
            clients: updatedClient
          },
          message: 'Progress updated'
        })

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error("Error performing action on training plan:", error)
    return NextResponse.json(
      { error: "Failed to perform action", details: error.message },
      { status: 500 }
    )
  }
}

