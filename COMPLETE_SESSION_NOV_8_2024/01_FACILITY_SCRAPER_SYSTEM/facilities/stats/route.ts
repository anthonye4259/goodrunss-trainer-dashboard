import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/facilities/stats - Get facility database statistics
export async function GET(request: NextRequest) {
  try {
    // Total count
    const total = await prisma.$queryRawUnsafe<any[]>(
      `SELECT COUNT(*) as count FROM facilities WHERE active = true`
    );

    // By type
    const byType = await prisma.$queryRawUnsafe<any[]>(
      `SELECT sport_type, COUNT(*) as count 
       FROM facilities 
       WHERE active = true 
       GROUP BY sport_type 
       ORDER BY count DESC`
    );

    // By country
    const byCountry = await prisma.$queryRawUnsafe<any[]>(
      `SELECT country, COUNT(*) as count 
       FROM facilities 
       WHERE active = true 
       GROUP BY country 
       ORDER BY count DESC 
       LIMIT 10`
    );

    // By source
    const bySource = await prisma.$queryRawUnsafe<any[]>(
      `SELECT source, COUNT(*) as count 
       FROM facilities 
       WHERE active = true 
       GROUP BY source`
    );

    // Recent scraper jobs
    const recentJobs = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM scraper_jobs 
       ORDER BY created_at DESC 
       LIMIT 10`
    );

    return NextResponse.json({
      success: true,
      stats: {
        total: parseInt(total[0].count),
        byType: byType.map((t) => ({ type: t.sport_type, count: parseInt(t.count) })),
        byCountry: byCountry.map((c) => ({ country: c.country, count: parseInt(c.count) })),
        bySource: bySource.map((s) => ({ source: s.source, count: parseInt(s.count) })),
      },
      recentJobs,
    });
  } catch (error: any) {
    console.error("❌ Error fetching facility stats:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

