import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/facility-reports/maintenance/categories?sport=tennis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get("sport");

    if (!sport) {
      return NextResponse.json(
        {
          success: false,
          error: "sport parameter is required",
        },
        { status: 400 }
      );
    }

    const categories = await prisma.maintenanceCategory.findMany({
      where: {
        sport,
        isActive: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      sport,
      categories,
    });
  } catch (error: any) {
    console.error("❌ Error fetching maintenance categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

