/**
 * Sessions/Calendar API
 * Manages training sessions and calendar events
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from "@/lib/prisma"



// GET /api/sessions - List all sessions
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trainer = await prisma.users.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status')

    // Build where clause
    const where: any = {
      trainerId: trainer.id,
    }

    if (startDate && endDate) {
      where.scheduledAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    if (clientId) {
      where.clientId = clientId
    }

    if (status) {
      where.status = status
    }

    const sessions = await prisma.trainer_sessions.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    })

    return NextResponse.json({
      success: true,
      sessions,
      total: sessions.length,
    })
  } catch (error: any) {
    console.error('[API] Error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions', details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/sessions - Create new session
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trainer = await prisma.users.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    const body = await request.json()
    const { 
      clientId, 
      title, 
      description, 
      type, 
      duration, 
      scheduledAt, 
      location,
      notes 
    } = body

    // Validate required fields
    if (!clientId || !title || !type || !duration || !scheduledAt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify client belongs to trainer
    const client = await prisma.clients.findFirst({
      where: {
        id: clientId,
        trainerId: trainer.id,
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Check for scheduling conflicts
    const conflict = await prisma.trainer_sessions.findFirst({
      where: {
        trainerId: trainer.id,
        scheduledAt: new Date(scheduledAt),
        status: { not: 'CANCELLED' },
      },
    })

    if (conflict) {
      return NextResponse.json(
        { error: 'Time slot already booked', conflictingSession: conflict },
        { status: 409 }
      )
    }

    // Create session
    const session = await prisma.trainer_sessions.create({
      data: {
        trainerId: trainer.id,
        clientId,
        title,
        description: description || null,
        type,
        duration,
        scheduledAt: new Date(scheduledAt),
        location: location || null,
        notes: notes || null,
        status: 'SCHEDULED',
        bookedFrom: 'DASHBOARD',
      },
      include: {
        client: {
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
      message: 'Session scheduled successfully',
    })
  } catch (error: any) {
    console.error('[API] Error creating session:', error)
    return NextResponse.json(
      { error: 'Failed to create session', details: error.message },
      { status: 500 }
    )
  }
}


