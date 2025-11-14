import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Diagnostic test
export async function POST(request: NextRequest) {
  const errors: string[] = [];
  
  try {
    // Test 1: Can we parse the body?
    const body = await request.json();
    const { sport } = body;
    
    if (!sport) {
      return NextResponse.json({
        success: false,
        error: "sport is required"
      }, { status: 400 });
    }

    // Test 2: Can we query the database?
    try {
      const mapping = await prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM facility_sport_mappings WHERE sport = $1`,
        sport
      );
      
      if (!mapping || mapping.length === 0) {
        return NextResponse.json({
          success: false,
          error: `No mapping found for sport: ${sport}`,
          availableSports: "Run: SELECT sport FROM facility_sport_mappings"
        });
      }

      // Test 3: Can we access the osm_tags?
      const osmTags = mapping[0].osm_tags;

      return NextResponse.json({
        success: true,
        message: "All tests passed!",
        sport,
        mapping: mapping[0],
        osmTags
      });

    } catch (dbError: any) {
      return NextResponse.json({
        success: false,
        error: "Database error",
        message: dbError.message,
        stack: dbError.stack
      }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: "General error",
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

