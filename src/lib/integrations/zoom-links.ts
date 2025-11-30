/**
 * Zoom & Google Meet Link Generator
 * Generates instant meeting links for virtual training sessions
 */

export interface MeetingLink {
  provider: 'zoom' | 'google-meet'
  url: string
  meetingId?: string
}

/**
 * Generate a Zoom Instant Meeting Link
 * Note: This creates a basic Zoom link. For custom Zoom meetings with API,
 * you'd need Zoom OAuth and API credentials.
 */
export function generateZoomLink(trainerId: string, sessionId: string): MeetingLink {
  // Option 1: Use trainer's personal Zoom room (if they have one)
  // Format: https://zoom.us/j/YOUR_PERSONAL_MEETING_ID
  
  // Option 2: Generate a meeting ID based on session
  // This is a placeholder - real Zoom integration requires OAuth
  const meetingId = generateMeetingId(sessionId)
  
  return {
    provider: 'zoom',
    url: `https://zoom.us/j/${meetingId}`,
    meetingId,
  }
}

/**
 * Generate a Google Meet Link
 * Format: https://meet.google.com/xxx-yyyy-zzz
 */
export function generateGoogleMeetLink(sessionId: string): MeetingLink {
  // Generate a Google Meet style code
  const code = generateMeetCode()
  
  return {
    provider: 'google-meet',
    url: `https://meet.google.com/${code}`,
  }
}

/**
 * Generate a meeting ID from session ID (10 digits for Zoom)
 */
function generateMeetingId(sessionId: string): string {
  // Create a consistent 10-digit ID from session ID
  const hash = sessionId.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0)
  }, 0)
  
  // Pad to 10 digits
  return String(hash).padStart(10, '0')
}

/**
 * Generate a Google Meet style code (xxx-yyyy-zzz)
 */
function generateMeetCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  const randomChar = () => chars[Math.floor(Math.random() * chars.length)]
  
  const part1 = Array(3).fill(0).map(randomChar).join('')
  const part2 = Array(4).fill(0).map(randomChar).join('')
  const part3 = Array(3).fill(0).map(randomChar).join('')
  
  return `${part1}-${part2}-${part3}`
}

/**
 * Get trainer's preferred meeting provider from settings
 */
export async function getTrainerMeetingProvider(trainerId: string): Promise<'zoom' | 'google-meet'> {
  // TODO: Fetch from database settings
  // For now, default to Google Meet since we're already integrating Google Calendar
  return 'google-meet'
}

/**
 * Generate meeting link based on trainer's preference
 */
export async function generateMeetingLink(
  trainerId: string,
  sessionId: string
): Promise<MeetingLink> {
  const provider = await getTrainerMeetingProvider(trainerId)
  
  if (provider === 'zoom') {
    return generateZoomLink(trainerId, sessionId)
  } else {
    return generateGoogleMeetLink(sessionId)
  }
}

/**
 * Add meeting link to session notes/description
 */
export function formatMeetingLinkForSession(link: MeetingLink): string {
  return `\n\n📹 Virtual Session Link:\n${link.url}\n\nClick to join the ${link.provider === 'zoom' ? 'Zoom' : 'Google Meet'} meeting.`
}

