import { google } from 'googleapis';

// Google OAuth2 Client
export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID, // Using existing Google OAuth credentials
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/integrations/google-calendar/callback'
  );
}

// Generate auth URL
export function getAuthUrl(facilityId: string) {
  const oauth2Client = getOAuth2Client();
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
    state: facilityId, // Pass facility ID through state
  });
}

// Exchange code for tokens
export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// Get calendar client
export function getCalendarClient(accessToken: string, refreshToken?: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  
  return google.calendar({ version: 'v3', auth: oauth2Client });
}

// Sync: Pull events from Google Calendar
export async function pullEventsFromGoogle(
  accessToken: string,
  refreshToken: string,
  calendarId: string = 'primary',
  timeMin?: Date,
  timeMax?: Date
) {
  const calendar = getCalendarClient(accessToken, refreshToken);
  
  const response = await calendar.events.list({
    calendarId,
    timeMin: (timeMin || new Date()).toISOString(),
    timeMax: timeMax?.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });
  
  return response.data.items || [];
}

// Sync: Push booking to Google Calendar
export async function pushBookingToGoogle(
  accessToken: string,
  refreshToken: string,
  booking: {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    location?: string;
  },
  calendarId: string = 'primary'
) {
  const calendar = getCalendarClient(accessToken, refreshToken);
  
  const event = {
    summary: booking.title,
    description: booking.description,
    location: booking.location,
    start: {
      dateTime: booking.startTime.toISOString(),
      timeZone: 'America/New_York',
    },
    end: {
      dateTime: booking.endTime.toISOString(),
      timeZone: 'America/New_York',
    },
  };
  
  const response = await calendar.events.insert({
    calendarId,
    requestBody: event,
  });
  
  return response.data;
}

// Delete event from Google Calendar
export async function deleteEventFromGoogle(
  accessToken: string,
  refreshToken: string,
  eventId: string,
  calendarId: string = 'primary'
) {
  const calendar = getCalendarClient(accessToken, refreshToken);
  
  await calendar.events.delete({
    calendarId,
    eventId,
  });
}

// Create calendar event (for booking integrations)
export async function createCalendarEvent(
  accessToken: string,
  booking: {
    trainerId: string;
    clientName: string;
    clientEmail: string;
    sessionType: string;
    startTime: Date;
    endTime: Date;
    location?: string;
    notes?: string;
  }
) {
  try {
    const result = await pushBookingToGoogle(
      accessToken,
      '', // refreshToken optional for this call
      {
        title: `${booking.sessionType} - ${booking.clientName}`,
        description: booking.notes || `Session with ${booking.clientName}`,
        startTime: booking.startTime,
        endTime: booking.endTime,
        location: booking.location,
      }
    );
    
    return { success: true, event: result };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return { success: false, error };
  }
}

// Update calendar event
export async function updateCalendarEvent(
  accessToken: string,
  eventId: string,
  updates: {
    title?: string;
    description?: string;
    startTime?: Date;
    endTime?: Date;
    location?: string;
  }
) {
  const calendar = getCalendarClient(accessToken);
  
  const event: any = {};
  if (updates.title) event.summary = updates.title;
  if (updates.description) event.description = updates.description;
  if (updates.location) event.location = updates.location;
  if (updates.startTime) {
    event.start = {
      dateTime: updates.startTime.toISOString(),
      timeZone: 'America/New_York',
    };
  }
  if (updates.endTime) {
    event.end = {
      dateTime: updates.endTime.toISOString(),
      timeZone: 'America/New_York',
    };
  }
  
  const response = await calendar.events.patch({
    calendarId: 'primary',
    eventId,
    requestBody: event,
  });
  
  return { success: true, event: response.data };
}

// Delete calendar event
export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string
) {
  try {
    await deleteEventFromGoogle(accessToken, '', eventId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return { success: false, error };
  }
}

// Get upcoming events
export async function getUpcomingEvents(
  accessToken: string,
  maxResults: number = 10
) {
  const timeMin = new Date();
  const timeMax = new Date();
  timeMax.setDate(timeMax.getDate() + 30); // Next 30 days
  
  const events = await pullEventsFromGoogle(
    accessToken,
    '',
    'primary',
    timeMin,
    timeMax
  );
  
  return {
    success: true,
    events: events.slice(0, maxResults),
  };
}

// Check availability for a time slot
export async function checkAvailability(
  accessToken: string,
  startTime: Date,
  endTime: Date
) {
  const events = await pullEventsFromGoogle(
    accessToken,
    '',
    'primary',
    startTime,
    endTime
  );
  
  const hasConflict = events.some((event: any) => {
    if (!event.start?.dateTime || !event.end?.dateTime) return false;
    
    const eventStart = new Date(event.start.dateTime);
    const eventEnd = new Date(event.end.dateTime);
    
    return (
      (startTime >= eventStart && startTime < eventEnd) ||
      (endTime > eventStart && endTime <= eventEnd) ||
      (startTime <= eventStart && endTime >= eventEnd)
    );
  });
  
  return {
    available: !hasConflict,
    conflicts: hasConflict ? events.length : 0,
  };
}
