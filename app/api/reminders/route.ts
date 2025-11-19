import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

// GET /api/reminders - Get all reminders
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trainer = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    const where: any = { trainerId: trainer.id }
    if (status) where.status = status
    if (priority) where.priority = priority

    const reminders = await prisma.autoReminder.findMany({
      where,
      orderBy: [
        { dueDate: 'asc' },
        { priority: 'desc' },
      ],
    })

    return NextResponse.json({
      success: true,
      reminders,
      total: reminders.length,
    })
  } catch (error) {
    console.error('Error fetching reminders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    )
  }
}

// POST /api/reminders - Create new reminder
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trainer = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    const body = await request.json()
    const { clientName, reminder, dueDate, priority } = body

    if (!clientName || !reminder || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields: clientName, reminder, dueDate' },
        { status: 400 }
      )
    }

    const newReminder = await prisma.autoReminder.create({
      data: {
        trainerId: trainer.id,
        clientName,
        reminder,
        dueDate: new Date(dueDate),
        priority: priority || 'medium',
      },
    })

    return NextResponse.json({
      success: true,
      reminder: newReminder,
    })
  } catch (error) {
    console.error('Error creating reminder:', error)
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    )
  }
}

// PUT /api/reminders - Update reminder status
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trainer = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    const body = await request.json()
    const { reminderId, status } = body

    if (!reminderId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: reminderId, status' },
        { status: 400 }
      )
    }

    const reminder = await prisma.autoReminder.update({
      where: { id: reminderId },
      data: {
        status,
        ...(status === 'completed' && { completedAt: new Date() }),
      },
    })

    return NextResponse.json({
      success: true,
      reminder,
    })
  } catch (error) {
    console.error('Error updating reminder:', error)
    return NextResponse.json(
      { error: 'Failed to update reminder' },
      { status: 500 }
    )
  }
}

// DELETE /api/reminders - Delete reminder
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trainer = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const reminderId = searchParams.get('id')

    if (!reminderId) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      )
    }

    await prisma.autoReminder.delete({
      where: { id: reminderId },
    })

    return NextResponse.json({
      success: true,
      message: 'Reminder deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting reminder:', error)
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
      { status: 500 }
    )
  }
}


