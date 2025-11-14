import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/facilities/search - Search facilities near location
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const radius = parseInt(searchParams.get("radius") || "10000"); // 10km default
    const type = searchParams.get("type"); // tennis, basketball, yoga, etc.
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, error: "lat and lng are required" },
        { status: 400 }
      );
    }

    // Build query
    let query = `
      SELECT 
        id, name, display_name, sport_type, category,
        lat, lng, address, city, state, country,
        phone, website, description, amenities,
        indoor, is_public, court_count, surface_type,
        hours, price_range, photos, rating, review_count,
        ST_Distance(
          geo_point::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) as distance
      FROM facilities
      WHERE active = true
        AND ST_DWithin(
          geo_point::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          $3
        )
    `;

    const params: any[] = [lng, lat, radius];

    if (type) {
      query += ` AND sport_type = $${params.length + 1}`;
      params.push(type);
    }

    query += ` ORDER BY distance ASC LIMIT $${params.length + 1}`;
    params.push(limit);

    const facilities = await prisma.$queryRawUnsafe<any[]>(query, ...params);

    // Convert distance to km
    facilities.forEach((f) => {
      f.distance = Math.round(f.distance / 1000 * 10) / 10; // Round to 1 decimal
    });

    return NextResponse.json({
      success: true,
      facilities,
      count: facilities.length,
      query: {
        lat,
        lng,
        radius: `${radius / 1000}km`,
        type,
      },
    });
  } catch (error: any) {
    console.error("❌ Error searching facilities:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

