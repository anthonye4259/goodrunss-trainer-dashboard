import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/facility-reports/history?userId=xxx&type=all&limit=50
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type") || "all"; // all, facility, maintenance
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "userId is required",
        },
        { status: 400 }
      );
    }

    let facilityReports: any[] = [];
    let maintenanceReports: any[] = [];

    if (type === "all" || type === "facility") {
      facilityReports = await prisma.facilityReport.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: type === "facility" ? limit : Math.floor(limit / 2),
      });
    }

    if (type === "all" || type === "maintenance") {
      maintenanceReports = await prisma.maintenanceReport.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: type === "maintenance" ? limit : Math.floor(limit / 2),
      });
    }

    // Combine and sort by date
    const combined = [
      ...facilityReports.map((r) => ({ ...r, reportType: "facility" })),
      ...maintenanceReports.map((r) => ({ ...r, reportType: "maintenance" })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json({
      success: true,
      reports: combined.slice(0, limit),
      total: combined.length,
    });
  } catch (error: any) {
    console.error("❌ Error fetching report history:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

