import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GooglePlacesScraper } from "@/lib/scrapers/google-places-scraper";
import { v4 as uuidv4 } from "uuid";

// POST /api/scraper/google - Start Google Places scraping job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sport, region } = body; // sport: yoga, pilates, barre, etc.

    if (!sport) {
      return NextResponse.json(
        { success: false, error: "sport is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Google Places API key not configured" },
        { status: 500 }
      );
    }

    // Get sport mapping
    const mapping = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM facility_sport_mappings WHERE sport = $1`,
      sport
    );

    if (!mapping || mapping.length === 0) {
      return NextResponse.json(
        { success: false, error: `Unknown sport: ${sport}` },
        { status: 400 }
      );
    }

    const sportMapping = mapping[0];
    const googleTypes = sportMapping.googleTypes as string[];

    if (!googleTypes || googleTypes.length === 0) {
      return NextResponse.json(
        { success: false, error: `No Google types configured for ${sport}` },
        { status: 400 }
      );
    }

    // Create scraper job
    const jobId = uuidv4();
    await prisma.$executeRawUnsafe(
      `INSERT INTO scraper_jobs (id, type, sport, region, status) VALUES ($1, $2, $3, $4, $5)`,
      jobId,
      "google_places",
      sport,
      region || "major_cities",
      "running"
    );

    // Start scraping (async)
    scrapeAndImport(jobId, sport, googleTypes, apiKey);

    return NextResponse.json({
      success: true,
      jobId,
      message: `Started scraping ${sport} facilities from Google Places`,
      estimatedTime: "10-20 minutes",
      note: "This will use Google Places API credits (~$17 per 1,000 places)",
    });
  } catch (error: any) {
    console.error("❌ Error starting Google Places scraper:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Background scraping function
async function scrapeAndImport(
  jobId: string,
  sport: string,
  googleTypes: string[],
  apiKey: string
) {
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE scraper_jobs SET "startedAt" = NOW() WHERE id = $1`,
      jobId
    );

    const scraper = new GooglePlacesScraper(apiKey);

    // Scrape for each type
    let allFacilities: any[] = [];

    for (const facilityType of googleTypes) {
      console.log(`🔍 Scraping ${facilityType}...`);
      const facilities = await scraper.searchMajorCities(sport, facilityType);
      allFacilities.push(...facilities);
    }

    console.log(`✅ Scraped ${allFacilities.length} ${sport} facilities`);

    // Deduplicate by googlePlaceId
    const uniqueFacilities = new Map();
    allFacilities.forEach((f) => {
      if (f.googlePlaceId && !uniqueFacilities.has(f.googlePlaceId)) {
        uniqueFacilities.set(f.googlePlaceId, f);
      }
    });

    const facilities = Array.from(uniqueFacilities.values());
    console.log(`📊 After deduplication: ${facilities.length} unique facilities`);

    // Import to database
    let added = 0;
    let updated = 0;
    let skipped = 0;

    for (const facility of facilities) {
      try {
        // Check if already exists by googlePlaceId
        const existing = await prisma.$queryRawUnsafe<any[]>(
          `SELECT id FROM facilities WHERE "googlePlaceId" = $1 LIMIT 1`,
          facility.googlePlaceId
        );

        if (existing && existing.length > 0) {
          // Update existing
          await updateFacility(existing[0].id, facility);
          updated++;
        } else {
          // Check for nearby duplicates (within 50 meters)
          const nearby = await prisma.$queryRawUnsafe<any[]>(
            `SELECT id FROM facilities 
             WHERE ST_DWithin(
               "geoPoint"::geography,
               ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
               50
             ) AND type = $3
             LIMIT 1`,
            facility.lng,
            facility.lat,
            facility.type
          );

          if (nearby && nearby.length > 0) {
            // Update with Google data (Google usually has better info)
            await updateFacility(nearby[0].id, facility);
            updated++;
          } else {
            // Insert new
            await insertFacility(facility);
            added++;
          }
        }
      } catch (error) {
        console.error(`Error importing ${facility.name}:`, error);
      }
    }

    // Update job as completed
    await prisma.$executeRawUnsafe(
      `UPDATE scraper_jobs SET 
        status = $1, 
        "completedAt" = NOW(),
        "facilitiesFound" = $2,
        "facilitiesAdded" = $3,
        "facilitiesUpdated" = $4,
        "duplicatesSkipped" = $5
       WHERE id = $6`,
      "completed",
      facilities.length,
      added,
      updated,
      skipped,
      jobId
    );

    console.log(`✅ Job ${jobId} completed: ${added} added, ${updated} updated, ${skipped} skipped`);
  } catch (error: any) {
    console.error(`❌ Job ${jobId} failed:`, error);

    await prisma.$executeRawUnsafe(
      `UPDATE scraper_jobs SET 
        status = $1, 
        "completedAt" = NOW(),
        error = $2
       WHERE id = $3`,
      "failed",
      error.message,
      jobId
    );
  }
}

// Helper: Insert facility
async function insertFacility(facility: any) {
  const id = uuidv4();

  await prisma.$executeRawUnsafe(
    `INSERT INTO facilities (
      id, name, type, category, lat, lng, "geoPoint",
      address, city, state, country, "postalCode",
      phone, website, description, hours,
      "priceRange", photos, rating, "reviewCount", "googlePlaceId",
      indoor, "isPublic", "requiresBooking",
      source, "sourceId", "sourceUrl", metadata,
      "lastSyncedAt", verified, active
    ) VALUES (
      $1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8), 4326),
      $9, $10, $11, $12, $13,
      $14, $15, $16, $17,
      $18, $19, $20, $21, $22,
      $23, $24, $25,
      $26, $27, $28, $29,
      NOW(), false, true
    )`,
    id,
    facility.name,
    facility.type,
    facility.category,
    facility.lat,
    facility.lng,
    facility.lng,
    facility.lat,
    facility.address,
    facility.city,
    facility.state,
    facility.country,
    facility.postalCode,
    facility.phone,
    facility.website,
    facility.description,
    JSON.stringify(facility.hours || {}),
    facility.priceRange,
    facility.photos || [],
    facility.rating,
    facility.reviewCount || 0,
    facility.googlePlaceId,
    facility.indoor !== false,
    facility.isPublic !== false,
    facility.requiresBooking !== false,
    facility.source,
    facility.sourceId,
    facility.sourceUrl,
    JSON.stringify(facility.metadata || {})
  );
}

// Helper: Update facility
async function updateFacility(id: string, facility: any) {
  await prisma.$executeRawUnsafe(
    `UPDATE facilities SET
      name = $1,
      address = $2,
      phone = $3,
      website = $4,
      photos = $5,
      rating = $6,
      "reviewCount" = $7,
      "googlePlaceId" = $8,
      hours = $9,
      "lastSyncedAt" = NOW()
     WHERE id = $10`,
    facility.name,
    facility.address,
    facility.phone,
    facility.website,
    facility.photos || [],
    facility.rating,
    facility.reviewCount || 0,
    facility.googlePlaceId,
    JSON.stringify(facility.hours || {}),
    id
  );
}

