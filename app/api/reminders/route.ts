import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from "@/lib/get-or-create-user"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/send-email"

// GET /api/reminders - Get all pending/sent reminders or send automatic reminders
export async function GET(request: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // If action=send, trigger automatic reminders
    if (action === 'send') {
      return await sendAutomaticReminders(trainer)
    }

    // Otherwise, get upcoming sessions that need reminders
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)

    const upcomingSessions = await prisma.trainerSession.findMany({
      where: {
        trainerId: trainer.id,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        scheduledAt: {
          gte: now,
          lte: tomorrow
        }
      },
      include: {
        clients: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    })

    // Categorize by reminder type needed
    const needsOneHourReminder: any[] = []
    const needs24HourReminder: any[] = []

    for (const session of upcomingSessions) {
      const timeUntil = session.scheduledAt.getTime() - now.getTime()
      const hoursUntil = timeUntil / (1000 * 60 * 60)

      if (hoursUntil <= 1 && hoursUntil > 0) {
        needsOneHourReminder.push({
          ...session,
          reminderType: '1_HOUR',
          timeUntil: Math.round(hoursUntil * 60) + ' minutes'
        })
      } else if (hoursUntil <= 24 && hoursUntil > 1) {
        needs24HourReminder.push({
          ...session,
          reminderType: '24_HOUR',
          timeUntil: Math.round(hoursUntil) + ' hours'
        })
      }
    }

    return NextResponse.json({
      success: true,
      reminders: {
        oneHour: needsOneHourReminder,
        twentyFourHour: needs24HourReminder
      },
      total: needsOneHourReminder.length + needs24HourReminder.length,
      upcomingSessions
    })
  } catch (error) {
    console.error('Error fetching reminders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    )
  }
}

// Helper function to send automatic reminders
async function sendAutomaticReminders(trainer: any) {
  try {
    const now = new Date()
    const oneHourFromNow = new Date(now.getTime() + 1.5 * 60 * 60 * 1000) // 1.5 hours buffer
    const oneDayFromNow = new Date(now.getTime() + 25 * 60 * 60 * 1000) // 25 hours buffer

    // Get sessions needing reminders
    const sessionsNeedingReminders = await prisma.trainerSession.findMany({
      where: {
        trainerId: trainer.id,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        scheduledAt: {
          gte: now,
          lte: oneDayFromNow
        }
      },
      include: {
        clients: true
      }
    })

    let sentOneHour = 0
    let sent24Hour = 0

    for (const session of sessionsNeedingReminders) {
      if (!session.clients?.email) continue

      const timeUntil = session.scheduledAt.getTime() - now.getTime()
      const hoursUntil = timeUntil / (1000 * 60 * 60)

      // 1-hour reminder
      if (hoursUntil <= 1.5 && hoursUntil >= 0.5) {
        await sendEmail({
          to: session.clients.email,
          subject: `Reminder: Session in ${Math.round(hoursUntil * 60)} minutes! ⏰`,
          html: `
            <h2>Hi ${session.clients.name}!</h2>
            <p><strong>Your session is coming up soon!</strong></p>
            <p><strong>Time:</strong> ${session.scheduledAt.toLocaleTimeString()}<br>
            <strong>Duration:</strong> ${session.duration} minutes<br>
            <strong>Location:</strong> ${session.location || 'See previous details'}</p>
            <p>See you soon! 💪</p>
            <p>${trainer.name}</p>
          `,
          text: `Hi ${session.clients.name}! Your session is in ${Math.round(hoursUntil * 60)} minutes at ${session.scheduledAt.toLocaleTimeString()}. See you soon!`
        })
        sentOneHour++
      }
      // 24-hour reminder
      else if (hoursUntil <= 25 && hoursUntil >= 20) {
        await sendEmail({
          to: session.clients.email,
          subject: `Tomorrow: Training Session with ${trainer.name} 📅`,
          html: `
            <h2>Hi ${session.clients.name}!</h2>
            <p><strong>Reminder: You have a session tomorrow!</strong></p>
            <p><strong>Date:</strong> ${session.scheduledAt.toLocaleDateString()}<br>
            <strong>Time:</strong> ${session.scheduledAt.toLocaleTimeString()}<br>
            <strong>Duration:</strong> ${session.duration} minutes</p>
            <p>Looking forward to it! 🎯</p>
            <p>${trainer.name}</p>
          `,
          text: `Hi ${session.clients.name}! Reminder: Session tomorrow at ${session.scheduledAt.toLocaleTimeString()}. Looking forward to it!`
        })
        sent24Hour++
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Automatic reminders sent',
      sent: {
        oneHour: sentOneHour,
        twentyFourHour: sent24Hour,
        total: sentOneHour + sent24Hour
      }
    })
  } catch (error) {
    console.error('Error sending reminders:', error)
    return NextResponse.json(
      { error: 'Failed to send reminders' },
      { status: 500 }
    )
  }
}

// POST /api/reminders - Send manual reminder
export async function POST(request: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, type, customMessage } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const session = await prisma.trainerSession.findFirst({
      where: {
        id: sessionId,
        trainerId: trainer.id
      },
      include: {
        clients: true
      }
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (!session.clients?.email) {
      return NextResponse.json({ error: 'Client has no email' }, { status: 400 })
    }

    const timeUntil = session.scheduledAt.getTime() - new Date().getTime()
    const hoursUntil = Math.round(timeUntil / (1000 * 60 * 60))

    const message = customMessage || `Reminder: You have a session ${hoursUntil > 0 ? `in ${hoursUntil} hours` : 'coming up'}!`

    await sendEmail({
      to: session.clients.email,
      subject: `Session Reminder from ${trainer.name}`,
      html: `<h2>Hi ${session.clients.name}!</h2><p>${message}</p><p><strong>Time:</strong> ${session.scheduledAt.toLocaleString()}<br><strong>Duration:</strong> ${session.duration} minutes</p><p>${trainer.name}</p>`,
      text: `Hi ${session.clients.name}! ${message} Time: ${session.scheduledAt.toLocaleString()}`
    })

    return NextResponse.json({
      success: true,
      message: 'Manual reminder sent',
      to: session.clients.email
    })
  } catch (error) {
    console.error('Error creating reminder:', error)
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    )
  }
}

// PATCH /api/reminders - Enable/disable automatic reminders (settings)
export async function PATCH(request: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { autoReminders, oneHourReminder, twentyFourHourReminder } = body

    // Would store these settings in a trainer_settings table
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: 'Reminder settings updated',
      settings: {
        autoReminders: autoReminders ?? true,
        oneHourReminder: oneHourReminder ?? true,
        twentyFourHourReminder: twentyFourHourReminder ?? true
      }
    })
  } catch (error) {
    console.error('Error updating reminder settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
