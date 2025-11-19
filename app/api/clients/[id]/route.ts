/**
 * Individual Client API
 * Handles view, update, and delete operations for a specific client
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/clients/[id] - Get client details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get trainer's database ID
    const trainer = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    // Fetch client with all details
    const client = await prisma.client.findFirst({
      where: {
        id,
        trainerId: trainer.id, // Ensure trainer owns this client
      },
      include: {
        sessions: {
          orderBy: { scheduledAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Get session stats
    const sessionStats = await prisma.trainerSession.aggregate({
      where: {
        clientId: id,
        trainerId: trainer.id,
      },
      _count: true,
    })

    return NextResponse.json({
      success: true,
      client: {
        ...client,
        totalSessions: sessionStats._count,
      },
    })
  } catch (error: any) {
    console.error('[API] Error fetching client:', error)
    return NextResponse.json(
      { error: 'Failed to fetch client', details: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/clients/[id] - Update client
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get trainer's database ID
    const trainer = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    // Verify client ownership
    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        trainerId: trainer.id,
      },
    })

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, email, phone, sport, level, goals, notes, status } = body

    // Update client
    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email: email.toLowerCase() }),
        ...(phone !== undefined && { phone }),
        ...(sport !== undefined && { sport }),
        ...(level !== undefined && { level }),
        ...(goals !== undefined && { goals }),
        ...(notes !== undefined && { notes }),
        ...(status && { status }),
      },
    })

    return NextResponse.json({
      success: true,
      client: updatedClient,
      message: 'Client updated successfully',
    })
  } catch (error: any) {
    console.error('[API] Error updating client:', error)
    return NextResponse.json(
      { error: 'Failed to update client', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/clients/[id] - Delete client
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get trainer's database ID
    const trainer = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    // Verify client ownership
    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        trainerId: trainer.id,
      },
    })

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Delete client (cascade will handle related records)
    await prisma.client.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully',
    })
  } catch (error: any) {
    console.error('[API] Error deleting client:', error)
    return NextResponse.json(
      { error: 'Failed to delete client', details: error.message },
      { status: 500 }
    )
  }
}


