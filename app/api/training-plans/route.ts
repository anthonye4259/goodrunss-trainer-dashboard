import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOrCreateUser } from "@/lib/get-or-create-user"

// GET /api/training-plans - List all workout plans for a trainer
export async function GET(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status') // draft, active, completed, archived
    const isTemplate = searchParams.get('isTemplate') === 'true'

    // Build where clause
    const where: any = { trainerId: trainer.id }
    
    if (clientId) {
      where.clientId = clientId
    }
    
    if (status) {
      where.status = status
    }
    
    if (isTemplate !== undefined) {
      where.isTemplate = isTemplate
    }

    // Get workout plans with client info
    const plans = await prisma.workout_plans.findMany({
      where,
      include: {
        clients: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // Active first
        { startDate: 'desc' }
      ]
    })

    // Calculate stats
    const stats = {
      total: plans.length,
      active: plans.filter(p => p.status === 'active').length,
      draft: plans.filter(p => p.status === 'draft').length,
      completed: plans.filter(p => p.status === 'completed').length,
      templates: plans.filter(p => p.isTemplate).length,
      averageCompletion: plans.length > 0 
        ? Math.round(plans.reduce((sum, p) => sum + p.completionRate, 0) / plans.length)
        : 0
    }

    return NextResponse.json({
      success: true,
      plans,
      stats
    })
  } catch (error) {
    console.error("Error fetching training plans:", error)
    return NextResponse.json(
      { error: "Failed to fetch training plans" },
      { status: 500 }
    )
  }
}

// POST /api/training-plans - Create a new workout plan
export async function POST(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      clientId,
      name,
      description,
      goal,
      duration,
      difficulty,
      clientGoals,
      fitnessLevel,
      availableTime,
      sessionsPerWeek,
      equipment,
      injuries,
      preferences,
      startDate,
      endDate,
      isTemplate,
      generatedBy,
      aiModel,
      generationPrompt
    } = body

    // Validate required fields
    if (!name || !goal || !duration || !sessionsPerWeek) {
      return NextResponse.json(
        { error: "Missing required fields: name, goal, duration, sessionsPerWeek" },
        { status: 400 }
      )
    }

    if (!clientId && !isTemplate) {
      return NextResponse.json(
        { error: "clientId is required unless creating a template" },
        { status: 400 }
      )
    }

    // Calculate total sessions
    const totalSessions = sessionsPerWeek * duration

    // Create workout plan
    const plan = await prisma.workout_plans.create({
      data: {
        id: crypto.randomUUID(),
        trainerId: trainer.id,
        clientId: clientId || trainer.id, // Use trainer ID for templates
        name,
        description: description || null,
        goal,
        duration,
        difficulty: difficulty || 'intermediate',
        clientGoals: clientGoals || {},
        fitnessLevel: fitnessLevel || 'intermediate',
        availableTime: availableTime || 60,
        sessionsPerWeek,
        equipment: equipment || [],
        injuries: injuries || [],
        preferences: preferences || null,
        totalSessions,
        generatedBy: generatedBy || 'manual',
        aiModel: aiModel || null,
        generationPrompt: generationPrompt || null,
        status: 'draft',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isTemplate: isTemplate || false,
        currentWeek: 1,
        completedSessions: 0,
        completionRate: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        clients: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    console.log('✅ Training plan created:', plan.id)

    return NextResponse.json({
      success: true,
      plan,
      message: `Training plan "${name}" created successfully`
    })
  } catch (error: any) {
    console.error("Error creating training plan:", error)
    return NextResponse.json(
      { error: "Failed to create training plan", details: error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/training-plans - Update a workout plan
export async function PATCH(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { planId, ...updates } = body

    if (!planId) {
      return NextResponse.json(
        { error: "planId is required" },
        { status: 400 }
      )
    }

    // Verify ownership
    const existingPlan = await prisma.workout_plans.findFirst({
      where: {
        id: planId,
        trainerId: trainer.id
      }
    })

    if (!existingPlan) {
      return NextResponse.json(
        { error: "Training plan not found" },
        { status: 404 }
      )
    }

    // Update completion rate if sessions completed
    const updateData: any = {
      ...updates,
      updatedAt: new Date()
    }

    if (updates.completedSessions !== undefined) {
      updateData.completionRate = existingPlan.totalSessions > 0
        ? (updates.completedSessions / existingPlan.totalSessions) * 100
        : 0
    }

    // Auto-complete if all sessions done
    if (updateData.completionRate >= 100 && existingPlan.status === 'active') {
      updateData.status = 'completed'
    }

    const plan = await prisma.workout_plans.update({
      where: { id: planId },
      data: updateData,
      include: {
        clients: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    console.log('✅ Training plan updated:', plan.id)

    return NextResponse.json({
      success: true,
      plan,
      message: 'Training plan updated'
    })
  } catch (error: any) {
    console.error("Error updating training plan:", error)
    return NextResponse.json(
      { error: "Failed to update training plan", details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/training-plans - Delete a workout plan
export async function DELETE(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const planId = searchParams.get('id')

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      )
    }

    // Verify ownership
    const existingPlan = await prisma.workout_plans.findFirst({
      where: {
        id: planId,
        trainerId: trainer.id
      }
    })

    if (!existingPlan) {
      return NextResponse.json(
        { error: "Training plan not found" },
        { status: 404 }
      )
    }

    // Archive instead of delete if plan has started
    if (existingPlan.status === 'active' && existingPlan.completedSessions > 0) {
      await prisma.workout_plans.update({
        where: { id: planId },
        data: { 
          status: 'archived',
          updatedAt: new Date()
        }
      })

      console.log('✅ Training plan archived:', planId)

      return NextResponse.json({
        success: true,
        message: 'Training plan archived (has active progress)'
      })
    }

    // Permanently delete if no progress
    await prisma.workout_plans.delete({
      where: { id: planId }
    })

    console.log('✅ Training plan deleted:', planId)

    return NextResponse.json({
      success: true,
      message: 'Training plan deleted'
    })
  } catch (error: any) {
    console.error("Error deleting training plan:", error)
    return NextResponse.json(
      { error: "Failed to delete training plan", details: error.message },
      { status: 500 }
    )
  }
}
