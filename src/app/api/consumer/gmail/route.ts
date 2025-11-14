import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import {
  sendBookingConfirmation,
  sendSessionReminder,
  sendCancellationNotice,
} from '@/lib/gmail'

/**
 * Consumer Gmail API - Proxy to Gmail
 * 
 * Allows consumer app to send professional emails via trainer's Gmail
 * Uses trainer's stored Google token from the booking relationship
 */

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { action, bookingId } = await req.json()

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID required' },
        { status: 400 }
      )
    }

    // Get booking with trainer and user details
    const booking = await prisma.publicBooking.findUnique({
      where: { id: bookingId },
      include: {
        trainer: {
          include: {
            accounts: {
              where: { provider: 'google' },
              select: { access_token: true }
            }
          }
        },
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if user is authorized (either the client or the trainer)
    // Note: PublicBooking doesn't have user_id - client info is stored as clientEmail
    // Only the trainer who owns the booking can send emails
    if (booking.trainerId !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to send email for this booking' },
        { status: 403 }
      )
    }

    const accessToken = booking.trainer.accounts[0]?.access_token

    if (!accessToken) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Trainer has not connected Gmail',
          message: 'Email notification unavailable for this trainer'
        },
        { status: 200 } // Return 200 but with error flag so app can handle gracefully
      )
    }

    const trainerEmail = booking.trainer.email || ''
    const trainerName = booking.trainer.name || 'Your Trainer'
    const clientEmail = booking.clientEmail || ''
    const clientName = booking.clientName || 'Client'

    if (!trainerEmail || !clientEmail) {
      return NextResponse.json(
        { error: 'Missing email addresses' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'bookingConfirmation':
        const confirmResult = await sendBookingConfirmation(
          accessToken,
          trainerEmail,
          trainerName,
          clientEmail,
          clientName,
          {
            sessionType: booking.sessionTypeName || 'Training Session',
            scheduledAt: new Date(booking.startTime),
            duration: booking.duration || 60,
            location: booking.trainer?.location || '',
            notes: booking.notes || '',
          }
        )
        
        // Mark email as sent in booking notes (metadata field doesn't exist)
        if (confirmResult.success) {
          await prisma.publicBooking.update({
            where: { id: bookingId },
            data: {
              notes: booking.notes ? `${booking.notes}\n[Confirmation email sent: ${new Date().toISOString()}]` : `[Confirmation email sent: ${new Date().toISOString()}]`
            }
          })
        }
        
        return NextResponse.json(confirmResult)
      
      case 'sessionReminder':
        const reminderResult = await sendSessionReminder(
          accessToken,
          trainerEmail,
          trainerName,
          clientEmail,
          clientName,
          {
            sessionType: booking.sessionTypeName || 'Training Session',
            scheduledAt: new Date(booking.startTime),
            duration: booking.duration || 60,
            location: booking.trainer?.location || '',
          }
        )
        
        // Mark reminder as sent
        if (reminderResult.success) {
          await prisma.publicBooking.update({
            where: { id: bookingId },
            data: {
              notes: booking.notes ? `${booking.notes}\n[Reminder email sent: ${new Date().toISOString()}]` : `[Reminder email sent: ${new Date().toISOString()}]`
            }
          })
        }
        
        return NextResponse.json(reminderResult)
      
      case 'cancellationNotice':
        const { reason } = await req.json()
        
        const cancelResult = await sendCancellationNotice(
          accessToken,
          trainerEmail,
          trainerName,
          clientEmail,
          clientName,
          {
            sessionType: booking.sessionTypeName || 'Training Session',
            scheduledAt: new Date(booking.startTime),
            reason,
          }
        )
        
        // Mark cancellation email as sent
        if (cancelResult.success) {
          await prisma.publicBooking.update({
            where: { id: bookingId },
            data: {
              notes: booking.notes ? `${booking.notes}\n[Cancellation email sent: ${new Date().toISOString()} - Reason: ${reason}]` : `[Cancellation email sent: ${new Date().toISOString()} - Reason: ${reason}]`
            }
          })
        }
        
        return NextResponse.json(cancelResult)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: bookingConfirmation, sessionReminder, or cancellationNotice' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Consumer Gmail API error:', error)
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    )
  }
}

