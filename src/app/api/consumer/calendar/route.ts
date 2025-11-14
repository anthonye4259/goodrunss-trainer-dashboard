import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getUpcomingEvents,
  checkAvailability,
} from '@/lib/google-calendar'

/**
 * Consumer Calendar API - Proxy to Google Calendar
 * 
 * Allows consumer app to interact with trainer's Google Calendar
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

    const { action, bookingId, trainerId, eventId, updates, startTime, endTime } = await req.json()
    
    let accessToken: string | null = null
    let trainer: any = null

    // Get trainer's Google access token
    if (trainerId) {
      trainer = await prisma.user.findUnique({
        where: { id: trainerId },
        include: {
          accounts: {
            where: { provider: 'google' },
            select: { access_token: true }
          }
        }
      })
    } else if (bookingId) {
      // Get trainer from booking
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
          }
        }
      })
      
      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        )
      }
      
      trainer = booking.trainer
    }

    accessToken = trainer?.accounts[0]?.access_token

    if (!accessToken) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Trainer has not connected Google Calendar',
          message: 'Calendar sync unavailable for this trainer'
        },
        { status: 200 } // Return 200 but with error flag so app can handle gracefully
      )
    }
    
    switch (action) {
      case 'create':
        // Create calendar event from booking
        const booking = await prisma.publicBooking.findUnique({
          where: { id: bookingId },
          include: {
            trainer: true,
          }
        })

        if (!booking) {
          return NextResponse.json(
            { error: 'Booking not found' },
            { status: 404 }
          )
        }

        const createResult = await createCalendarEvent(
          accessToken,
          {
            trainerId: booking.trainerId,
            clientName: booking.clientName || 'Client',
            clientEmail: booking.clientEmail || '',
            sessionType: booking.sessionTypeName || 'Training Session',
            startTime: new Date(booking.startTime),
            endTime: new Date(booking.endTime),
            location: booking.trainer?.location || '',
            notes: booking.notes || '',
          }
        )
        
        // Store Google event ID in booking notes (metadata field doesn't exist)
        if (createResult.success && createResult.event) {
          await prisma.publicBooking.update({
            where: { id: bookingId },
            data: { 
              notes: booking.notes ? `${booking.notes}\n[Google Event ID: ${createResult.event.id}]` : `[Google Event ID: ${createResult.event.id}]`
            }
          })
        }
        
        return NextResponse.json(createResult)
      
      case 'update':
        if (!eventId) {
          return NextResponse.json(
            { error: 'Event ID required for update' },
            { status: 400 }
          )
        }

        const updateResult = await updateCalendarEvent(
          accessToken,
          eventId,
          updates
        )
        return NextResponse.json(updateResult)
      
      case 'delete':
        // Note: PublicBooking doesn't have metadata field to store googleEventId
        // Would need to add this field to schema for calendar integration
        return NextResponse.json({
          success: false,
          error: 'Calendar delete requires metadata field in PublicBooking schema'
        })
      
      case 'checkAvailability':
        if (!startTime || !endTime) {
          return NextResponse.json(
            { error: 'Start time and end time required' },
            { status: 400 }
          )
        }

        const availabilityResult = await checkAvailability(
          accessToken,
          new Date(startTime),
          new Date(endTime)
        )
        return NextResponse.json(availabilityResult)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Consumer Calendar API error:', error)
    return NextResponse.json(
      { error: 'Failed to process calendar request', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const trainerId = searchParams.get('trainerId')
    const maxResults = parseInt(searchParams.get('maxResults') || '10')

    if (!trainerId) {
      return NextResponse.json(
        { error: 'Trainer ID required' },
        { status: 400 }
      )
    }

    // Get trainer's Google access token
    const trainer = await prisma.user.findUnique({
      where: { id: trainerId },
      include: {
        accounts: {
          where: { provider: 'google' },
          select: { access_token: true }
        }
      }
    })

    const accessToken = trainer?.accounts[0]?.access_token

    if (!accessToken) {
      return NextResponse.json(
        { 
          success: false,
          events: [],
          message: 'Trainer has not connected Google Calendar'
        }
      )
    }
    
    const result = await getUpcomingEvents(
      accessToken,
      maxResults
    )
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Consumer Calendar API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar events', details: error.message },
      { status: 500 }
    )
  }
}

