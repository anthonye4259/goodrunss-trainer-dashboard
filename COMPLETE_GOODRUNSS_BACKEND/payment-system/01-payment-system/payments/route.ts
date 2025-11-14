import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Mock trainer ID for demo
    const mockTrainerId = "demo-trainer-id"

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { trainerId: mockTrainerId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: true,
          session: true
        }
      }),
      prisma.payment.count({ where: { trainerId: mockTrainerId } })
    ])

    // Calculate revenue metrics
    const totalRevenue = await prisma.payment.aggregate({
      where: { 
        trainerId: mockTrainerId,
        status: 'COMPLETED'
      },
      _sum: { amount: true }
    })

    const monthlyRevenue = await prisma.payment.aggregate({
      where: { 
        trainerId: mockTrainerId,
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      },
      _sum: { amount: true }
    })

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      metrics: {
        totalRevenue: totalRevenue._sum.amount || 0,
        monthlyRevenue: monthlyRevenue._sum.amount || 0
      }
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { amount, currency, method, description, clientId, sessionId } = body

    if (!amount || !method) {
      return NextResponse.json({ 
        error: 'Amount and method are required' 
      }, { status: 400 })
    }

    // Mock trainer ID for demo
    const mockTrainerId = "demo-trainer-id"

    const payment = await prisma.payment.create({
      data: {
        amount,
        currency: currency || 'USD',
        method,
        description,
        clientId: clientId || null,
        sessionId: sessionId || null,
        trainerId: mockTrainerId,
        status: 'COMPLETED' // Auto-complete for demo
      },
      include: {
        client: true,
        session: true
      }
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}


