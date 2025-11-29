/**
 * Auto-sync facilities (run monthly via cron)
 * Updates existing facilities from their sources
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// import { v4 as uuidv4 } from "uuid"; // TODO: Install @types/uuid
const uuidv4 = () => crypto.randomUUID(); // Use native crypto instead

// POST /api/cron/sync-facilities - Run monthly sync
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (security)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("🔄 Starting facility sync...");

    // Get facilities that haven't been synced in 30+ days
    const facilitiesToSync = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id, source, "sourceId", type
       FROM facilities 
       WHERE active = true 
       AND ("lastSyncedAt" IS NULL OR "lastSyncedAt" < NOW() - INTERVAL '30 days')
       LIMIT 10000`
    );

    console.log(`📊 Found ${facilitiesToSync.length} facilities to sync`);

    // Create sync job
    const jobId = uuidv4();
    await prisma.$executeRawUnsafe(
      `INSERT INTO scraper_jobs (id, type, region, status) VALUES ($1, $2, $3, $4)`,
      jobId,
      "sync",
      "all",
      "running"
    );

    // Start sync in background
    syncFacilities(jobId, facilitiesToSync);

    return NextResponse.json({
      success: true,
      jobId,
      facilitiesToSync: facilitiesToSync.length,
      message: "Facility sync started",
    });
  } catch (error: any) {
    console.error("❌ Error starting facility sync:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Background sync function
async function syncFacilities(jobId: string, facilities: any[]) {
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE scraper_jobs SET "startedAt" = NOW() WHERE id = $1`,
      jobId
    );

    let updated = 0;
    let failed = 0;

    for (const facility of facilities) {
      try {
        // Re-scrape based on source
        if (facility.source === "osm") {
          // OSM facilities - check if still exists
          // For now, just mark as synced
          await prisma.$executeRawUnsafe(
            `UPDATE facilities SET "lastSyncedAt" = NOW() WHERE id = $1`,
            facility.id
          );
          updated++;
        } else if (facility.source === "google" && facility.googlePlaceId) {
          // Google Places - could re-fetch details for updated info
          // For now, just mark as synced
          await prisma.$executeRawUnsafe(
            `UPDATE facilities SET "lastSyncedAt" = NOW() WHERE id = $1`,
            facility.id
          );
          updated++;
        }

        // Rate limiting
        if (updated % 100 === 0) {
          console.log(`✅ Synced ${updated}/${facilities.length}...`);
          await sleep(1000);
        }
      } catch (error) {
        console.error(`Error syncing facility ${facility.id}:`, error);
        failed++;
      }
    }

    // Update job as completed
    await prisma.$executeRawUnsafe(
      `UPDATE scraper_jobs SET 
        status = $1, 
        "completedAt" = NOW(),
        "facilitiesUpdated" = $2
       WHERE id = $3`,
      "completed",
      updated,
      jobId
    );

    console.log(`✅ Sync job ${jobId} completed: ${updated} updated, ${failed} failed`);
  } catch (error: any) {
    console.error(`❌ Sync job ${jobId} failed:`, error);

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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

