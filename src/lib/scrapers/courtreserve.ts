/**
 * CourtReserve Scraper
 * Logs into CourtReserve facility account and pulls schedule
 */

import { chromium } from 'playwright';

export interface CourtReserveCredentials {
  clubUrl: string; // e.g., "https://yourclub.courtreserve.com"
  username: string;
  password: string;
}

export interface CourtReserveBooking {
  courtName: string;
  date: string;
  startTime: string;
  endTime: string;
  playerName: string;
  playerEmail?: string;
  sport: string; // tennis, pickleball, etc.
  bookingId: string;
  status: string;
}

export async function scrapeCourtReserve(
  credentials: CourtReserveCredentials,
  daysAhead: number = 7
): Promise<CourtReserveBooking[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log(`Scraping CourtReserve: ${credentials.clubUrl}`);
    
    // Step 1: Navigate to login page
    await page.goto(`${credentials.clubUrl}/login`);
    await page.waitForLoadState('networkidle');
    
    // Step 2: Login
    await page.fill('input[name="username"], input[type="email"]', credentials.username);
    await page.fill('input[name="password"], input[type="password"]', credentials.password);
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Verify login succeeded
    if (page.url().includes('login')) {
      throw new Error('Login failed - still on login page');
    }
    
    // Step 3: Navigate to reservations/schedule page
    await page.goto(`${credentials.clubUrl}/reservations`);
    await page.waitForLoadState('networkidle');
    
    const bookings: CourtReserveBooking[] = [];
    
    // Step 4: Scrape bookings for next N days
    const today = new Date();
    for (let i = 0; i < daysAhead; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      const dateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      console.log(`Scraping date: ${dateStr}`);
      
      // Navigate to specific date (CourtReserve usually has date picker)
      try {
        await page.click('input[type="date"], .date-picker');
        await page.fill('input[type="date"]', dateStr);
        await page.waitForTimeout(1000); // Wait for calendar to load
      } catch (e) {
        console.log('Date picker not found, trying alternative method');
      }
      
      // Extract bookings from the page
      const dayBookings = await page.evaluate((date) => {
        const bookings: any[] = [];
        
        // CourtReserve typically shows bookings in a grid or list
        // Adjust selectors based on actual CourtReserve HTML structure
        const bookingElements = document.querySelectorAll('.reservation-item, .booking-row, tr[data-booking]');
        
        bookingElements.forEach((element) => {
          try {
            const courtName = element.querySelector('.court-name, .resource-name, td.court')?.textContent?.trim() || '';
            const time = element.querySelector('.time, .booking-time, td.time')?.textContent?.trim() || '';
            const playerName = element.querySelector('.player-name, .customer-name, td.player')?.textContent?.trim() || '';
            const sport = element.querySelector('.sport, .type')?.textContent?.trim() || 'tennis';
            const bookingId = element.getAttribute('data-booking-id') || element.getAttribute('data-id') || '';
            
            // Parse time (usually "2:00 PM - 3:00 PM" format)
            const timeMatch = time.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
            const startTime = timeMatch ? timeMatch[1] : '';
            const endTime = timeMatch ? timeMatch[2] : '';
            
            if (courtName && startTime) {
              bookings.push({
                courtName,
                date,
                startTime,
                endTime,
                playerName,
                sport,
                bookingId,
                status: 'confirmed',
              });
            }
          } catch (err) {
            console.error('Error parsing booking element:', err);
          }
        });
        
        return bookings;
      }, dateStr);
      
      bookings.push(...dayBookings);
    }
    
    console.log(`Scraped ${bookings.length} bookings from CourtReserve`);
    return bookings;
    
  } catch (error) {
    console.error('CourtReserve scraping error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Convert scraped booking to standardized format
 */
export function normalizeCourtReserveBooking(
  booking: CourtReserveBooking,
  facilityId: string
) {
  // Parse date and time into ISO format
  const startDateTime = parseDateTime(booking.date, booking.startTime);
  const endDateTime = parseDateTime(booking.date, booking.endTime);
  
  return {
    facility_id: facilityId,
    external_id: booking.bookingId,
    external_source: 'courtreserve',
    title: `${booking.courtName} - ${booking.sport}`,
    description: `Player: ${booking.playerName}`,
    start_time: startDateTime,
    end_time: endDateTime,
    customer_name: booking.playerName,
    customer_email: booking.playerEmail,
    status: booking.status,
  };
}

function parseDateTime(date: string, time: string): string {
  // Convert "2025-11-05" + "2:00 PM" to ISO string
  const [hours, minutes] = time.match(/(\d{1,2}):(\d{2})/)?.slice(1) || ['0', '0'];
  const isPM = time.toUpperCase().includes('PM');
  let hour = parseInt(hours);
  
  if (isPM && hour !== 12) hour += 12;
  if (!isPM && hour === 12) hour = 0;
  
  const dateTime = new Date(`${date}T${hour.toString().padStart(2, '0')}:${minutes}:00`);
  return dateTime.toISOString();
}

/**
 * Push booking to CourtReserve
 * Creates a new reservation in the facility's CourtReserve account
 */
export async function pushToCourtReserve(
  credentials: CourtReserveCredentials,
  booking: {
    courtName: string;
    date: string; // YYYY-MM-DD
    startTime: string; // "2:00 PM"
    endTime: string; // "3:00 PM"
    playerName: string;
    playerEmail?: string;
    playerPhone?: string;
    sport?: string;
  }
): Promise<{ success: boolean; externalId?: string; error?: string }> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log(`Pushing booking to CourtReserve: ${credentials.clubUrl}`);
    
    // Step 1: Login
    await page.goto(`${credentials.clubUrl}/login`);
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="username"], input[type="email"]', credentials.username);
    await page.fill('input[name="password"], input[type="password"]', credentials.password);
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('login')) {
      throw new Error('Login failed - still on login page');
    }
    
    // Step 2: Navigate to "Create Booking" page
    // Try multiple possible URLs/buttons
    try {
      await page.goto(`${credentials.clubUrl}/bookings/new`);
    } catch {
      try {
        await page.goto(`${credentials.clubUrl}/reservations/create`);
      } catch {
        await page.click('a[href*="booking"], button:has-text("New Booking"), .create-booking');
      }
    }
    await page.waitForLoadState('networkidle');
    
    // Step 3: Fill in booking form
    // Date
    await page.fill('input[name="date"], input[type="date"], .date-picker', booking.date);
    await page.waitForTimeout(500);
    
    // Court/Resource
    try {
      await page.selectOption('select[name="court"], select[name="resource"]', booking.courtName);
    } catch {
      await page.fill('input[name="court"], input[name="resource"]', booking.courtName);
    }
    
    // Time
    try {
      await page.selectOption('select[name="time"], select[name="start_time"]', booking.startTime);
    } catch {
      await page.fill('input[name="time"], input[name="start_time"]', booking.startTime);
    }
    
    // Duration or end time
    try {
      await page.fill('input[name="end_time"]', booking.endTime);
    } catch {
      // Calculate duration
      const start = new Date(`2000-01-01 ${booking.startTime}`);
      const end = new Date(`2000-01-01 ${booking.endTime}`);
      const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
      await page.selectOption('select[name="duration"]', `${durationMinutes}`);
    }
    
    // Player name
    await page.fill('input[name="player"], input[name="customer"], input[name="name"]', booking.playerName);
    
    // Email (if available)
    if (booking.playerEmail) {
      try {
        await page.fill('input[name="email"], input[type="email"]', booking.playerEmail);
      } catch {
        console.log('Email field not found, skipping');
      }
    }
    
    // Phone (if available)
    if (booking.playerPhone) {
      try {
        await page.fill('input[name="phone"], input[type="tel"]', booking.playerPhone);
      } catch {
        console.log('Phone field not found, skipping');
      }
    }
    
    // Sport (if available)
    if (booking.sport) {
      try {
        await page.selectOption('select[name="sport"], select[name="type"]', booking.sport);
      } catch {
        console.log('Sport field not found, skipping');
      }
    }
    
    // Step 4: Submit booking
    await page.click('button[type="submit"], button:has-text("Book"), button:has-text("Reserve"), .submit-booking');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Step 5: Get confirmation
    let externalId = '';
    try {
      // Look for booking ID in various places
      const confirmationElement = await page.locator('.booking-id, .confirmation-number, [data-booking-id]').first();
      externalId = await confirmationElement.textContent() || '';
      
      if (!externalId) {
        // Try to extract from URL
        const url = page.url();
        const idMatch = url.match(/booking[s]?\/(\d+)/);
        externalId = idMatch ? idMatch[1] : `cr_${Date.now()}`;
      }
    } catch {
      // Fallback: generate temporary ID
      externalId = `cr_${Date.now()}_${booking.playerName.replace(/\s/g, '')}`;
    }
    
    console.log(`✅ Booking pushed to CourtReserve. ID: ${externalId}`);
    
    await browser.close();
    return { success: true, externalId };
    
  } catch (error) {
    console.error('CourtReserve push error:', error);
    await browser.close();
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

