/**
 * Google Calendar Integration
 * Sync trainer sessions with Google Calendar using googleapis npm package
 */

import { google } from 'googleapis'

export interface CalendarEvent {
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  attendees?: Array<{ email: string }>
}

interface SessionData {
  title: string
  description?: string
  scheduledAt: Date
  duration: number
  location?: string
  clientName?: string
  clientEmail?: string
}

// Initialize Google Calendar API
function getCalendarClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'
  )

  oauth2Client.setCredentials({
    access_token: accessToken
  })

  return google.calendar({ version: 'v3', auth: oauth2Client })
}

export async function syncToGoogleCalendar(
  sessionData: SessionData,
  accessToken?: string
) {
  try {
    // If no access token, trainer hasn't connected Google Calendar yet
    if (!accessToken) {
      console.log('[Google Calendar] Not connected yet')
      return {
        success: false,
        message: 'Google Calendar not connected. Please connect in settings.'
      }
    }

    // Check if Google OAuth is configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.log('[Google Calendar] OAuth not configured')
      return {
        success: false,
        message: 'Google Calendar integration not configured by admin.'
      }
    }

    const calendar = getCalendarClient(accessToken)

    const endTime = new Date(sessionData.scheduledAt)
    endTime.setMinutes(endTime.getMinutes() + (sessionData.duration || 60))

    const event = {
      summary: sessionData.title,
      description: sessionData.description || '',
      location: sessionData.location || '',
      start: {
        dateTime: sessionData.scheduledAt.toISOString(),
        timeZone: 'America/New_York', // TODO: Use trainer's timezone
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'America/New_York',
      },
      attendees: sessionData.clientEmail ? [
        { email: sessionData.clientEmail }
      ] : [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 hours before
          { method: 'popup', minutes: 60 }, // 1 hour before
        ],
      },
    }

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      sendUpdates: 'all', // Send email invites to attendees
    })

    console.log('✅ Google Calendar event created:', response.data.id)

    return {
      success: true,
      eventId: response.data.id,
      htmlLink: response.data.htmlLink,
      message: 'Session synced to Google Calendar'
    }
  } catch (error: any) {
    console.error('❌ Google Calendar error:', error)
    
    if (error.code === 401 || error.code === 403) {
      return {
        success: false,
        message: 'Google Calendar access expired. Please reconnect in settings.'
      }
    }

    return {
      success: false,
      message: 'Failed to sync to Google Calendar',
      error: error.message
    }
  }
}

export async function deleteFromGoogleCalendar(
  eventId: string,
  accessToken?: string
) {
  try {
    if (!accessToken) {
      return { success: false, message: 'Not connected to Google Calendar' }
    }

    const calendar = getCalendarClient(accessToken)

    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
      sendUpdates: 'all', // Notify attendees
    })

    console.log('✅ Google Calendar event deleted:', eventId)

    return { success: true, message: 'Event deleted from Google Calendar' }
  } catch (error: any) {
    console.error('❌ Google Calendar delete error:', error)
    return {
      success: false,
      message: 'Failed to delete from Google Calendar',
      error: error.message
    }
  }
}

export async function updateGoogleCalendarEvent(
  eventId: string,
  sessionData: Partial<SessionData>,
  accessToken?: string
) {
  try {
    if (!accessToken) {
      return { success: false, message: 'Not connected to Google Calendar' }
    }

    const calendar = getCalendarClient(accessToken)

    const updates: any = {}
    
    if (sessionData.title) updates.summary = sessionData.title
    if (sessionData.description) updates.description = sessionData.description
    if (sessionData.location) updates.location = sessionData.location
    
    if (sessionData.scheduledAt) {
      const endTime = new Date(sessionData.scheduledAt)
      endTime.setMinutes(endTime.getMinutes() + (sessionData.duration || 60))
      
      updates.start = {
        dateTime: sessionData.scheduledAt.toISOString(),
        timeZone: 'America/New_York',
      }
      updates.end = {
        dateTime: endTime.toISOString(),
        timeZone: 'America/New_York',
      }
    }

    const response = await calendar.events.patch({
      calendarId: 'primary',
      eventId,
      requestBody: updates,
      sendUpdates: 'all',
    })

    console.log('✅ Google Calendar event updated:', eventId)

    return {
      success: true,
      message: 'Google Calendar event updated',
      htmlLink: response.data.htmlLink
    }
  } catch (error: any) {
    console.error('❌ Google Calendar update error:', error)
    return {
      success: false,
      message: 'Failed to update Google Calendar event',
      error: error.message
    }
  }
}
