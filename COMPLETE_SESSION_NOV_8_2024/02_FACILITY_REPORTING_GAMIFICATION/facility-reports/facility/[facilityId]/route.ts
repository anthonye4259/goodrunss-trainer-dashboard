import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/facility-reports/facility/[facilityId] - Get reports for a facility
export async function GET(
  request: NextRequest,
  { params }: { params: { facilityId: string } }
) {
  try {
    const { facilityId } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type") || "all"; // all, facility, maintenance

    let facilityReports: any[] = [];
    let maintenanceReports: any[] = [];

    if (type === "all" || type === "facility") {
      facilityReports = await prisma.facilityReport.findMany({
        where: { facilityId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
    }

    if (type === "all" || type === "maintenance") {
      maintenanceReports = await prisma.maintenanceReport.findMany({
        where: { facilityId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
    }

    // Get current conditions (most recent reports)
    const latestReport = facilityReports[0];

    // Calculate statistics
    const stats = {
      totalReports: facilityReports.length + maintenanceReports.length,
      facilityReportsCount: facilityReports.length,
      maintenanceReportsCount: maintenanceReports.length,
      openMaintenanceIssues: maintenanceReports.filter(
        (r) => r.status !== "fixed" && r.status !== "verified"
      ).length,
      currentConditions: latestReport
        ? {
            crowdLevel: latestReport.crowdLevel,
            skillLevel: latestReport.skillLevel,
            ageGroup: latestReport.ageGroup,
            weatherCondition: latestReport.weatherCondition,
            surfaceCondition: latestReport.surfaceCondition,
            reportedAt: latestReport.createdAt,
          }
        : null,
    };

    return NextResponse.json({
      success: true,
      stats,
      facilityReports,
      maintenanceReports,
    });
  } catch (error: any) {
    console.error("❌ Error fetching facility reports:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

