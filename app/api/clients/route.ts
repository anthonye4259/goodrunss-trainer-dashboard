/**
 * Client Management API
 * Handles CRUD operations for trainer clients
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/clients - List all clients for authenticated trainer
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get trainer's database ID from Clerk ID
    const trainer = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const sport = searchParams.get('sport')

    // Build where clause
    const where: any = {
      trainerId: trainer.id,
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Note: sport and status filters removed as these fields don't exist in Client model
    // Client model only has: id, name, email, phone, age, goals, notes

    // Fetch clients
    const clients = await prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        age: true,
        goals: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Get session counts for each client
    const clientsWithStats = await Promise.all(
      clients.map(async (client) => {
        const sessionCount = await prisma.trainerSession.count({
          where: {
            clientId: client.id,
            trainerId: trainer.id,
          },
        })

        return {
          ...client,
          totalSessions: sessionCount,
        }
      })
    )

    return NextResponse.json({
      success: true,
      clients: clientsWithStats,
      total: clientsWithStats.length,
    })
  } catch (error: any) {
    console.error('[API] Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients', details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/clients - Create new client
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get trainer's database ID
    const trainer = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, email, phone, age, goals, notes } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if client email already exists for this trainer
    const existingClient = await prisma.client.findFirst({
      where: {
        trainerId: trainer.id,
        email: email.toLowerCase(),
      },
    })

    if (existingClient) {
      return NextResponse.json(
        { error: 'Client with this email already exists' },
        { status: 409 }
      )
    }

    // Create client
    const client = await prisma.client.create({
      data: {
        trainerId: trainer.id,
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        age: age || null,
        goals: goals || [],
        notes: notes || null,
      },
    })

    return NextResponse.json({
      success: true,
      client,
      message: 'Client created successfully',
    })
  } catch (error: any) {
    console.error('[API] Error creating client:', error)
    return NextResponse.json(
      { error: 'Failed to create client', details: error.message },
      { status: 500 }
    )
  }
}


