/**
 * GolfNow Scraper
 * Logs into GolfNow facility account and pulls tee times
 */

import { chromium } from 'playwright';

export interface GolfNowCredentials {
  facilityUrl: string; // e.g., "https://www.golfnow.com/tee-times/facility/12345"
  username: string;
  password: string;
}

export interface GolfNowTeeTime {
  date: string;
  time: string;
  players: number;
  golferName: string;
  golferEmail?: string;
  golferPhone?: string;
  holes: number; // 9 or 18
  bookingId: string;
  confirmationNumber: string;
  status: string;
  price?: string;
}

export async function scrapeGolfNow(
  credentials: GolfNowCredentials,
  daysAhead: number = 7
): Promise<GolfNowTeeTime[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log(`Scraping GolfNow: ${credentials.facilityUrl}`);
    
    // Step 1: Navigate to GolfNow partner login
    await page.goto('https://partners.golfnow.com/login');
    await page.waitForLoadState('networkidle');
    
    // Step 2: Login to partner portal
    await page.fill('input[name="email"], input[type="email"]', credentials.username);
    await page.fill('input[name="password"], input[type="password"]', credentials.password);
    await page.click('button[type="submit"], input[type="submit"], .login-button');
    await page.waitForLoadState('networkidle');
    
    // Verify login
    if (page.url().includes('login')) {
      throw new Error('GolfNow login failed');
    }
    
    // Step 3: Navigate to reservations/bookings page
    await page.goto('https://partners.golfnow.com/reservations');
    await page.waitForLoadState('networkidle');
    
    const teeTimes: GolfNowTeeTime[] = [];
    
    // Step 4: Scrape tee times for next N days
    const today = new Date();
    for (let i = 0; i < daysAhead; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      const dateStr = targetDate.toISOString().split('T')[0];
      
      console.log(`Scraping GolfNow date: ${dateStr}`);
      
      // Select date
      try {
        await page.click('input[type="date"], .date-selector');
        await page.fill('input[type="date"]', dateStr);
        await page.waitForTimeout(1500); // Wait for bookings to load
      } catch (e) {
        console.log('Date selector not found, continuing...');
      }
      
      // Extract tee times from page
      const dayTeeTimes = await page.evaluate((date) => {
        const teeTimes: any[] = [];
        
        // GolfNow typically shows bookings in a table or card layout
        const bookingElements = document.querySelectorAll(
          '.booking-row, .tee-time-row, tr[data-booking], .reservation-item'
        );
        
        bookingElements.forEach((element) => {
          try {
            const time = element.querySelector('.time, .tee-time, td.time')?.textContent?.trim() || '';
            const golferName = element.querySelector('.golfer-name, .player-name, td.golfer')?.textContent?.trim() || '';
            const players = element.querySelector('.players, .player-count, td.players')?.textContent?.trim() || '4';
            const holes = element.querySelector('.holes, td.holes')?.textContent?.trim() || '18';
            const confirmationNumber = element.querySelector('.confirmation, .booking-id')?.textContent?.trim() || '';
            const bookingId = element.getAttribute('data-booking-id') || element.getAttribute('data-id') || confirmationNumber;
            const price = element.querySelector('.price, .total')?.textContent?.trim() || '';
            
            if (time && golferName) {
              teeTimes.push({
                date,
                time,
                players: parseInt(players) || 4,
                golferName,
                holes: parseInt(holes) || 18,
                bookingId,
                confirmationNumber,
                status: 'confirmed',
                price,
              });
            }
          } catch (err) {
            console.error('Error parsing tee time:', err);
          }
        });
        
        return teeTimes;
      }, dateStr);
      
      teeTimes.push(...dayTeeTimes);
    }
    
    console.log(`Scraped ${teeTimes.length} tee times from GolfNow`);
    return teeTimes;
    
  } catch (error) {
    console.error('GolfNow scraping error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Convert scraped tee time to standardized format
 */
export function normalizeGolfNowTeeTime(
  teeTime: GolfNowTeeTime,
  facilityId: string
) {
  // Parse date and time
  const startDateTime = parseDateTime(teeTime.date, teeTime.time);
  
  // Estimate end time (18 holes = 4.5 hours, 9 holes = 2.5 hours)
  const duration = teeTime.holes === 18 ? 4.5 : 2.5;
  const endDateTime = new Date(new Date(startDateTime).getTime() + duration * 60 * 60 * 1000);
  
  return {
    facility_id: facilityId,
    external_id: teeTime.bookingId,
    external_source: 'golfnow',
    title: `Tee Time - ${teeTime.players} players (${teeTime.holes} holes)`,
    description: `Golfer: ${teeTime.golferName}${teeTime.price ? ` | Price: ${teeTime.price}` : ''}`,
    start_time: startDateTime,
    end_time: endDateTime.toISOString(),
    customer_name: teeTime.golferName,
    customer_email: teeTime.golferEmail,
    customer_phone: teeTime.golferPhone,
    status: teeTime.status,
    notes: `Confirmation: ${teeTime.confirmationNumber}`,
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
 * Push tee time to GolfNow
 * Creates a new reservation in the facility's GolfNow partner account
 */
export async function pushToGolfNow(
  credentials: GolfNowCredentials,
  teeTime: {
    date: string; // YYYY-MM-DD
    time: string; // "10:30 AM"
    players: number;
    golferName: string;
    golferEmail?: string;
    golferPhone?: string;
    holes: number; // 9 or 18
  }
): Promise<{ success: boolean; externalId?: string; error?: string }> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log(`Pushing tee time to GolfNow: ${credentials.facilityUrl}`);
    
    // Step 1: Login to GolfNow partner portal
    await page.goto('https://partners.golfnow.com/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="email"], input[type="email"]', credentials.username);
    await page.fill('input[name="password"], input[type="password"]', credentials.password);
    await page.click('button[type="submit"], input[type="submit"], .login-button');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('login')) {
      throw new Error('GolfNow login failed');
    }
    
    // Step 2: Navigate to "Create Reservation" page
    try {
      await page.goto('https://partners.golfnow.com/reservations/new');
    } catch {
      try {
        await page.click('a[href*="reservations/new"], button:has-text("New Reservation"), .create-reservation');
      } catch {
        await page.goto('https://partners.golfnow.com/tee-times/book');
      }
    }
    await page.waitForLoadState('networkidle');
    
    // Step 3: Fill in tee time form
    // Date
    await page.fill('input[name="date"], input[type="date"]', teeTime.date);
    await page.waitForTimeout(500);
    
    // Time
    try {
      await page.selectOption('select[name="time"], select[name="tee_time"]', teeTime.time);
    } catch {
      await page.fill('input[name="time"], input[name="tee_time"]', teeTime.time);
    }
    
    // Number of players
    try {
      await page.selectOption('select[name="players"], select[name="player_count"]', `${teeTime.players}`);
    } catch {
      await page.fill('input[name="players"], input[name="player_count"]', `${teeTime.players}`);
    }
    
    // Holes (9 or 18)
    try {
      await page.selectOption('select[name="holes"]', `${teeTime.holes}`);
    } catch {
      await page.click(`button:has-text("${teeTime.holes} Holes"), input[value="${teeTime.holes}"]`);
    }
    
    // Golfer name
    await page.fill('input[name="golfer"], input[name="customer"], input[name="name"]', teeTime.golferName);
    
    // Email (if available)
    if (teeTime.golferEmail) {
      try {
        await page.fill('input[name="email"], input[type="email"]', teeTime.golferEmail);
      } catch {
        console.log('Email field not found, skipping');
      }
    }
    
    // Phone (if available)
    if (teeTime.golferPhone) {
      try {
        await page.fill('input[name="phone"], input[type="tel"]', teeTime.golferPhone);
      } catch {
        console.log('Phone field not found, skipping');
      }
    }
    
    // Step 4: Submit reservation
    await page.click('button[type="submit"], button:has-text("Book"), button:has-text("Reserve"), .submit-reservation');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Step 5: Get confirmation
    let externalId = '';
    try {
      // Look for confirmation number
      const confirmationElement = await page.locator('.confirmation-number, .booking-id, [data-confirmation]').first();
      externalId = await confirmationElement.textContent() || '';
      
      if (!externalId) {
        // Try to extract from URL
        const url = page.url();
        const idMatch = url.match(/reservation[s]?\/(\d+)|confirmation\/(\w+)/);
        externalId = idMatch ? (idMatch[1] || idMatch[2]) : `gn_${Date.now()}`;
      }
    } catch {
      // Fallback: generate temporary ID
      externalId = `gn_${Date.now()}_${teeTime.golferName.replace(/\s/g, '')}`;
    }
    
    console.log(`✅ Tee time pushed to GolfNow. ID: ${externalId}`);
    
    await browser.close();
    return { success: true, externalId };
    
  } catch (error) {
    console.error('GolfNow push error:', error);
    await browser.close();
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

