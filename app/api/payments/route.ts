/**
 * Payment History API
 * Track payments, invoices, and financial transactions
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma"
import { getOrCreateUser } from "@/lib/get-or-create-user"



// GET /api/payments - List all payments
export async function GET(request: NextRequest) {
  try {
    const trainer = await getOrCreateUser()

    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {
      trainerId: trainer.id,
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (clientId) {
      where.clientId = clientId
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        clients: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        trainer_sessions: {
          select: {
            id: true,
            title: true,
            scheduledAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate totals
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)
    const paidAmount = payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0)
    const pendingAmount = payments
      .filter(p => p.status === 'PENDING')
      .reduce((sum, p) => sum + p.amount, 0)

    return NextResponse.json({
      success: true,
      payments,
      summary: {
        total: totalAmount,
        paid: paidAmount,
        pending: pendingAmount,
        count: payments.length,
      },
    })
  } catch (error: any) {
    console.error('[API] Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments', details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/payments - Record new payment
export async function POST(request: NextRequest) {
  try {
    const trainer = await getOrCreateUser()

    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { clientId, amount, method, sessionId, notes, dueDate } = body

    if (!clientId || !amount) {
      return NextResponse.json(
        { error: 'Client ID and amount are required' },
        { status: 400 }
      )
    }

    // Verify client belongs to trainer
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        trainerId: trainer.id,
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const payment = await prisma.payment.create({
      data: {
        id: crypto.randomUUID(),
        trainerId: trainer.id,
        clientId,
        sessionId: sessionId || null,
        amount,
        currency: 'USD',
        method: method || 'CASH',
        status: 'COMPLETED',
        description: notes || null,
        paidAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
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
      payment,
      message: 'Payment recorded successfully',
    })
  } catch (error: any) {
    console.error('[API] Error creating payment:', error)
    return NextResponse.json(
      { error: 'Failed to record payment', details: error.message },
      { status: 500 }
    )
  }
}


