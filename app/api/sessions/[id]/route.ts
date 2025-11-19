/**
 * Individual Session API
 * Update, delete, or get specific session
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma"
import { getOrCreateUser } from \"@/lib/get-or-create-user\"



// GET /api/sessions/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const trainer = await getOrCreateUser()
    
    if (!trainer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const trainer = await prisma.users.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    const session = await prisma.trainer_sessions.findFirst({
      where: {
        id,
        trainerId: trainer.id,
      },
      include: {
        clients: true,
      },
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      session,
    })
  } catch (error: any) {
    console.error('[API] Error fetching session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session', details: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/sessions/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const trainer = await getOrCreateUser()
    
    if (!trainer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const trainer = await prisma.users.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    const existingSession = await prisma.trainer_sessions.findFirst({
      where: {
        id,
        trainerId: trainer.id,
      },
    })

    if (!existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, type, duration, scheduledAt, location, notes, status } = body

    const session = await prisma.trainer_sessions.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(duration && { duration }),
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
        ...(location !== undefined && { location }),
        ...(notes !== undefined && { notes }),
        ...(status && { status }),
      },
      include: {
        clients: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      session,
      message: 'Session updated successfully',
    })
  } catch (error: any) {
    console.error('[API] Error updating session:', error)
    return NextResponse.json(
      { error: 'Failed to update session', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/sessions/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const trainer = await getOrCreateUser()
    
    if (!trainer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const trainer = await prisma.users.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    const existingSession = await prisma.trainer_sessions.findFirst({
      where: {
        id,
        trainerId: trainer.id,
      },
    })

    if (!existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    await prisma.trainer_sessions.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully',
    })
  } catch (error: any) {
    console.error('[API] Error deleting session:', error)
    return NextResponse.json(
      { error: 'Failed to delete session', details: error.message },
      { status: 500 }
    )
  }
}




