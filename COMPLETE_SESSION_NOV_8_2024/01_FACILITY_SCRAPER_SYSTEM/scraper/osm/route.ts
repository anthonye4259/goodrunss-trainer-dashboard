import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { osmScraper } from "@/lib/scrapers/osm-scraper";
import { v4 as uuidv4 } from "uuid";

// POST /api/scraper/osm - Start OSM scraping job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sport, region } = body; // sport: tennis, basketball, etc. region: worldwide, US, etc.

    if (!sport) {
      return NextResponse.json(
        { success: false, error: "sport is required" },
        { status: 400 }
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
    const osmTags = sportMapping.osm_tags as Record<string, string>;

    // Create scraper job
    const jobId = uuidv4();
    await prisma.$executeRawUnsafe(
      `INSERT INTO scraper_jobs (id, job_type, sport, region, status) VALUES ($1, $2, $3, $4, $5)`,
      jobId,
      "osm",
      sport,
      region || "worldwide",
      "running"
    );

    // Start scraping (async, don't wait)
    scrapeAndImport(jobId, sport, osmTags, region);

    return NextResponse.json({
      success: true,
      jobId,
      message: `Started scraping ${sport} facilities from OpenStreetMap`,
      estimatedTime: "5-15 minutes",
    });
  } catch (error: any) {
    console.error("❌ Error starting OSM scraper:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET /api/scraper/osm?jobId=xxx - Check job status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "jobId is required" },
        { status: 400 }
      );
    }

    const job = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM scraper_jobs WHERE id = $1`,
      jobId
    );

    if (!job || job.length === 0) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      job: job[0],
    });
  } catch (error: any) {
    console.error("❌ Error checking job status:", error);
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
  osmTags: Record<string, string>,
  region?: string
) {
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE scraper_jobs SET started_at = NOW() WHERE id = $1`,
      jobId
    );

    // Scrape facilities
    let facilities;
    if (region === "worldwide" || !region) {
      facilities = await osmScraper.scrapeWorldwide(sport, osmTags);
    } else {
      // For specific regions, you'd need to define bboxes
      facilities = await osmScraper.scrapeWorldwide(sport, osmTags);
    }

    console.log(`✅ Scraped ${facilities.length} ${sport} facilities`);

    // Import to database
    let added = 0;
    let updated = 0;
    let skipped = 0;

    for (const facility of facilities) {
      try {
        // Check if already exists (by source + sourceId OR by location proximity)
        const existing = await prisma.$queryRawUnsafe<any[]>(
          `SELECT id FROM facilities WHERE source_id = $1 LIMIT 1`,
          facility.sourceId
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
               geo_point::geography,
               ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
               50
             ) AND sport_type = $3
             LIMIT 1`,
            facility.lng,
            facility.lat,
            facility.type
          );

          if (nearby && nearby.length > 0) {
            skipped++;
            console.log(`⏭️  Skipping duplicate near ${facility.name}`);
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
        completed_at = NOW(),
        facilities_found = $2,
        facilities_added = $3,
        facilities_updated = $4,
        duplicates_skipped = $5
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
        completed_at = NOW(),
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
      id, name, sport_type, category, lat, lng, geo_point,
      address, city, state, country, postal_code,
      phone, website, description, amenities, surface_type,
      court_count, indoor, is_public, requires_booking,
      source, source_id, source_url, metadata,
      last_synced_at, verified, active
    ) VALUES (
      $1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8), 4326),
      $9, $10, $11, $12, $13,
      $14, $15, $16, $17, $18,
      $19, $20, $21, $22,
      $23, $24, $25, $26::jsonb,
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
    facility.amenities || [],
    facility.surfaceType,
    facility.courtCount,
    facility.indoor || false,
    facility.isPublic !== false,
    facility.requiresBooking || false,
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
      amenities = $5,
      last_synced_at = NOW()
     WHERE id = $6`,
    facility.name,
    facility.address,
    facility.phone,
    facility.website,
    facility.amenities || [],
    id
  );
}

