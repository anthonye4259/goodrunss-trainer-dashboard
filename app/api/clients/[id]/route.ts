/**
 * Individual Client API
 * Handles view, update, and delete operations for a specific client
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma"
import { getOrCreateUser } from "@/lib/get-or-create-user"



// GET /api/clients/[id] - Get client details
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

    // Fetch client with all details
    const client = await prisma.clients.findFirst({
      where: {
        id,
        trainerId: trainer.id, // Ensure trainer owns this client
      },
      include: {
        trainer_sessions: {
          orderBy: { scheduledAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Get session stats
    const sessionStats = await prisma.trainer_sessions.aggregate({
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
    const trainer = await getOrCreateUser()

    if (!trainer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify client ownership
    const existingClient = await prisma.clients.findFirst({
      where: {
        id,
        trainerId: trainer.id,
      },
    })

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, email, phone, age, goals, notes } = body

    // Update client
    const updatedClient = await prisma.clients.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email: email.toLowerCase() }),
        ...(phone !== undefined && { phone }),
        ...(age !== undefined && { age }),
        ...(goals !== undefined && { goals }),
        ...(notes !== undefined && { notes }),
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
    const trainer = await getOrCreateUser()

    if (!trainer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify client ownership
    const existingClient = await prisma.clients.findFirst({
      where: {
        id,
        trainerId: trainer.id,
      },
    })

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Delete client (cascade will handle related records)
    await prisma.clients.delete({
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


