/**
 * PodPlay Scraper
 * Logs into PodPlay facility account and pulls pickleball court bookings
 */

import { chromium } from 'playwright';

export interface PodPlayCredentials {
  facilityUrl: string; // e.g., "https://app.podplay.com/facility/your-club"
  username: string;
  password: string;
}

export interface PodPlayBooking {
  courtName: string;
  date: string;
  startTime: string;
  endTime: string;
  playerName: string;
  playerEmail?: string;
  playerPhone?: string;
  bookingType: string; // "open play", "private", "lesson", "tournament"
  bookingId: string;
  status: string;
  numberOfPlayers?: number;
}

export async function scrapePodPlay(
  credentials: PodPlayCredentials,
  daysAhead: number = 7
): Promise<PodPlayBooking[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log(`Scraping PodPlay: ${credentials.facilityUrl}`);
    
    // Step 1: Navigate to PodPlay login
    await page.goto('https://app.podplay.com/login');
    await page.waitForLoadState('networkidle');
    
    // Step 2: Login
    await page.fill('input[name="email"], input[type="email"]', credentials.username);
    await page.fill('input[name="password"], input[type="password"]', credentials.password);
    await page.click('button[type="submit"], .login-btn, .sign-in-btn');
    await page.waitForLoadState('networkidle');
    
    // Verify login
    if (page.url().includes('login')) {
      throw new Error('PodPlay login failed - still on login page');
    }
    
    // Step 3: Navigate to facility dashboard/bookings
    await page.goto(`${credentials.facilityUrl}/bookings`);
    await page.waitForLoadState('networkidle');
    
    const bookings: PodPlayBooking[] = [];
    
    // Step 4: Scrape bookings for next N days
    const today = new Date();
    for (let i = 0; i < daysAhead; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      const dateStr = targetDate.toISOString().split('T')[0];
      
      console.log(`Scraping PodPlay date: ${dateStr}`);
      
      // Navigate to specific date
      try {
        // PodPlay typically has a date picker or calendar view
        await page.click('input[type="date"], .date-picker, .calendar-trigger');
        await page.fill('input[type="date"]', dateStr);
        await page.waitForTimeout(1500); // Wait for bookings to load
      } catch (e) {
        console.log('Date picker not found, trying alternative navigation...');
        // Try clicking next day button
        try {
          for (let j = 0; j < i; j++) {
            await page.click('.next-day, .calendar-next, button[aria-label="Next day"]');
            await page.waitForTimeout(500);
          }
        } catch (navError) {
          console.log('Alternative navigation failed, continuing...');
        }
      }
      
      // Extract bookings from the page
      const dayBookings = await page.evaluate((date) => {
        const bookings: any[] = [];
        
        // PodPlay typically shows bookings in a grid/schedule view
        const bookingElements = document.querySelectorAll(
          '.booking-card, .reservation-item, .court-booking, [data-booking-id], .schedule-item'
        );
        
        bookingElements.forEach((element) => {
          try {
            // Extract booking data
            const courtName = element.querySelector('.court-name, .resource, .pod-name')?.textContent?.trim() || '';
            const time = element.querySelector('.time, .booking-time, .slot-time')?.textContent?.trim() || '';
            const playerName = element.querySelector('.player-name, .customer, .booker')?.textContent?.trim() || '';
            const playerEmail = element.querySelector('.email')?.textContent?.trim() || '';
            const playerPhone = element.querySelector('.phone')?.textContent?.trim() || '';
            const bookingType = element.querySelector('.type, .booking-type')?.textContent?.trim() || 'open play';
            const bookingId = element.getAttribute('data-booking-id') || 
                            element.getAttribute('data-id') || 
                            element.querySelector('.booking-id')?.textContent?.trim() || '';
            const numberOfPlayers = element.querySelector('.player-count, .players')?.textContent?.trim() || '';
            
            // Parse time (usually "10:00 AM - 11:00 AM" or "10:00-11:00")
            const timeMatch = time.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*[-–]\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
            const startTime = timeMatch ? timeMatch[1] : '';
            const endTime = timeMatch ? timeMatch[2] : '';
            
            if (courtName && startTime) {
              bookings.push({
                courtName,
                date,
                startTime,
                endTime,
                playerName,
                playerEmail,
                playerPhone,
                bookingType: bookingType.toLowerCase(),
                bookingId,
                status: 'confirmed',
                numberOfPlayers: numberOfPlayers ? parseInt(numberOfPlayers) : undefined,
              });
            }
          } catch (err) {
            console.error('Error parsing PodPlay booking:', err);
          }
        });
        
        return bookings;
      }, dateStr);
      
      bookings.push(...dayBookings);
    }
    
    console.log(`Scraped ${bookings.length} bookings from PodPlay`);
    return bookings;
    
  } catch (error) {
    console.error('PodPlay scraping error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Convert scraped booking to standardized format
 */
export function normalizePodPlayBooking(
  booking: PodPlayBooking,
  facilityId: string
) {
  // Parse date and time into ISO format
  const startDateTime = parseDateTime(booking.date, booking.startTime);
  const endDateTime = parseDateTime(booking.date, booking.endTime);
  
  return {
    facility_id: facilityId,
    external_id: booking.bookingId,
    external_source: 'podplay',
    title: `${booking.courtName} - ${booking.bookingType}`,
    description: `Player: ${booking.playerName}${booking.numberOfPlayers ? ` (${booking.numberOfPlayers} players)` : ''}`,
    start_time: startDateTime,
    end_time: endDateTime,
    customer_name: booking.playerName,
    customer_email: booking.playerEmail,
    customer_phone: booking.playerPhone,
    status: booking.status,
    notes: `Type: ${booking.bookingType}`,
  };
}

function parseDateTime(date: string, time: string): string {
  // Convert "2025-11-05" + "10:30 AM" to ISO string
  const [hours, minutes] = time.match(/(\d{1,2}):(\d{2})/)?.slice(1) || ['0', '0'];
  const isPM = time.toUpperCase().includes('PM');
  let hour = parseInt(hours);
  
  if (isPM && hour !== 12) hour += 12;
  if (!isPM && hour === 12) hour = 0;
  
  const dateTime = new Date(`${date}T${hour.toString().padStart(2, '0')}:${minutes}:00`);
  return dateTime.toISOString();
}

/**
 * Push booking to PodPlay
 * Creates a new court reservation in the facility's PodPlay account
 */
export async function pushToPodPlay(
  credentials: PodPlayCredentials,
  booking: {
    courtName: string;
    date: string; // YYYY-MM-DD
    startTime: string; // "10:30 AM"
    endTime: string; // "11:30 AM"
    playerName: string;
    playerEmail?: string;
    playerPhone?: string;
    bookingType?: string; // "open play", "private", "lesson", "tournament"
    numberOfPlayers?: number;
  }
): Promise<{ success: boolean; externalId?: string; error?: string }> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log(`Pushing booking to PodPlay: ${credentials.facilityUrl}`);
    
    // Step 1: Login to PodPlay
    await page.goto('https://app.podplay.com/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="email"], input[type="email"]', credentials.username);
    await page.fill('input[name="password"], input[type="password"]', credentials.password);
    await page.click('button[type="submit"], .login-btn, .sign-in-btn');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('login')) {
      throw new Error('PodPlay login failed');
    }
    
    // Step 2: Navigate to booking/reservation page
    try {
      await page.goto(`${credentials.facilityUrl}/bookings/new`);
    } catch {
      try {
        await page.goto(`${credentials.facilityUrl}/reserve`);
      } catch {
        await page.click('a[href*="booking"], button:has-text("New Booking"), button:has-text("Reserve"), .create-booking');
      }
    }
    await page.waitForLoadState('networkidle');
    
    // Step 3: Fill in booking form
    // Date
    await page.fill('input[name="date"], input[type="date"], .date-picker', booking.date);
    await page.waitForTimeout(500);
    
    // Court/Pod selection
    try {
      await page.selectOption('select[name="court"], select[name="pod"], select[name="resource"]', booking.courtName);
    } catch {
      await page.fill('input[name="court"], input[name="pod"]', booking.courtName);
    }
    
    // Time slot
    try {
      await page.selectOption('select[name="time"], select[name="start_time"]', booking.startTime);
    } catch {
      await page.fill('input[name="time"], input[name="start_time"]', booking.startTime);
    }
    
    // End time or duration
    try {
      await page.fill('input[name="end_time"]', booking.endTime);
    } catch {
      // Calculate duration
      const start = new Date(`2000-01-01 ${booking.startTime}`);
      const end = new Date(`2000-01-01 ${booking.endTime}`);
      const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
      try {
        await page.selectOption('select[name="duration"]', `${durationMinutes}`);
      } catch {
        console.log('Duration field not found, skipping');
      }
    }
    
    // Booking type (open play, private, lesson, tournament)
    if (booking.bookingType) {
      try {
        await page.selectOption('select[name="type"], select[name="booking_type"]', booking.bookingType);
      } catch {
        await page.click(`button:has-text("${booking.bookingType}"), input[value="${booking.bookingType}"]`);
      }
    }
    
    // Number of players
    if (booking.numberOfPlayers) {
      try {
        await page.selectOption('select[name="players"], select[name="player_count"]', `${booking.numberOfPlayers}`);
      } catch {
        await page.fill('input[name="players"], input[name="player_count"]', `${booking.numberOfPlayers}`);
      }
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
    
    // Step 4: Submit booking
    await page.click('button[type="submit"], button:has-text("Book"), button:has-text("Reserve"), button:has-text("Confirm"), .submit-booking');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Step 5: Get confirmation
    let externalId = '';
    try {
      // Look for booking ID
      const confirmationElement = await page.locator('.booking-id, .confirmation-number, .reservation-id, [data-booking-id]').first();
      externalId = await confirmationElement.textContent() || '';
      
      if (!externalId) {
        // Try to extract from URL
        const url = page.url();
        const idMatch = url.match(/booking[s]?\/(\d+)|reservation[s]?\/(\w+)/);
        externalId = idMatch ? (idMatch[1] || idMatch[2]) : `pp_${Date.now()}`;
      }
    } catch {
      // Fallback: generate temporary ID
      externalId = `pp_${Date.now()}_${booking.playerName.replace(/\s/g, '')}`;
    }
    
    console.log(`✅ Booking pushed to PodPlay. ID: ${externalId}`);
    
    await browser.close();
    return { success: true, externalId };
    
  } catch (error) {
    console.error('PodPlay push error:', error);
    await browser.close();
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
