/**
 * Cron Job: Process Due Scheduled Notifications
 * GET /api/cron/process-notifications
 * 
 * Called every minute by Vercel Cron
 * Sends all notifications that are due
 * 
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/process-notifications",
 *     "schedule": "* * * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { processDueNotifications } from "@/lib/scheduled-notifications";

export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron job request
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('⚠️ Unauthorized cron job access attempt');
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log('⏰ Starting scheduled notification processing...');

    const result = await processDueNotifications();

    console.log('✅ Scheduled notification processing complete');

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("❌ Error in cron job:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process notifications"
      },
      { status: 500 }
    );
  }
}

// Support POST as well for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}

