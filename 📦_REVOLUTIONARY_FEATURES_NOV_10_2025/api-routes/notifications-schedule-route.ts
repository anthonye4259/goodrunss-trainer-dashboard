/**
 * Schedule Notifications API
 * POST /api/notifications/schedule - Schedule a notification
 * GET /api/notifications/schedule - Get upcoming scheduled notifications
 * DELETE /api/notifications/schedule - Cancel a scheduled notification
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { 
  scheduleNotification, 
  cancelScheduledNotification,
  getUpcomingScheduledNotifications,
  getScheduledNotificationStats
} from "@/lib/scheduled-notifications";

// POST - Schedule a notification
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { clientId, type, params, scheduledFor, recurring } = body;

    // Validation
    if (!clientId || !type || !params || !scheduledFor) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Schedule the notification
    const result = await scheduleNotification({
      trainerId: userId,
      clientId,
      type,
      params,
      scheduledFor: new Date(scheduledFor),
      recurring,
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: "Notification scheduled successfully"
    });

  } catch (error: any) {
    console.error("❌ Error scheduling notification:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to schedule notification"
      },
      { status: 500 }
    );
  }
}

// GET - Get upcoming scheduled notifications
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
      const stats = await getScheduledNotificationStats(userId);
      return NextResponse.json(stats);
    }

    const scheduled = await getUpcomingScheduledNotifications(userId);

    return NextResponse.json(scheduled);

  } catch (error: any) {
    console.error("❌ Error fetching scheduled notifications:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch scheduled notifications"
      },
      { status: 500 }
    );
  }
}

// DELETE - Cancel a scheduled notification
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Notification ID is required" },
        { status: 400 }
      );
    }

    const result = await cancelScheduledNotification(id);

    return NextResponse.json({
      success: true,
      message: "Notification cancelled successfully"
    });

  } catch (error: any) {
    console.error("❌ Error cancelling notification:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to cancel notification"
      },
      { status: 500 }
    );
  }
}
