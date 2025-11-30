/**
 * Client Management API
 * Handles CRUD operations for trainer clients
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma"
import { getOrCreateUser } from "@/lib/get-or-create-user"



// GET /api/clients - List all clients for authenticated trainer
export async function GET(request: NextRequest) {
  try {
    const trainer = await getOrCreateUser()

    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
        id: crypto.randomUUID(),
        trainerId: trainer.id,
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        age: age || null,
        goals: goals || [],
        notes: notes || null,
        updatedAt: new Date(),
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


