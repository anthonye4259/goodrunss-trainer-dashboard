import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/facilities/[id] - Get facility details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const facility = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM facilities WHERE id = $1 AND active = true LIMIT 1`,
      id
    );

    if (!facility || facility.length === 0) {
      return NextResponse.json(
        { success: false, error: "Facility not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      facility: facility[0],
    });
  } catch (error: any) {
    console.error("❌ Error fetching facility:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

