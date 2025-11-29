import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/group-classes
 * Get group classes for trainer
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ id: userId }, { email: userId }] },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "all";

    let whereClause = `WHERE trainer_id = '${user.id}'`;
    if (status !== 'all') whereClause += ` AND status = '${status}'`;

    const classes = await prisma.$queryRawUnsafe(`
      SELECT g.*, 
        (SELECT COUNT(*) FROM group_class_bookings WHERE class_id = g.id AND status = 'confirmed') as current_bookings,
        (SELECT COUNT(*) FROM waitlist_entries WHERE session_id = g.id AND status = 'waiting') as waitlist_count
      FROM group_classes g
      ${whereClause}
      ORDER BY g.scheduled_at ASC
    `);

    return NextResponse.json({ success: true, classes });
  } catch (error: any) {
    console.error("❌ Error fetching group classes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch group classes" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/group-classes
 * Create group class
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ id: userId }, { email: userId }] },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      name,
      description,
      maxCapacity,
      pricePerPerson,
      scheduledAt,
      duration,
      location,
      isRecurring,
      recurringPattern,
    } = body;

    if (!name || !maxCapacity || !pricePerPerson || !scheduledAt || !duration) {
      return NextResponse.json(
        { error: "Name, max capacity, price, scheduled time, and duration are required" },
        { status: 400 }
      );
    }

    const groupClass = await prisma.$queryRaw`
      INSERT INTO group_classes (
        trainer_id, name, description, max_capacity, price_per_person,
        scheduled_at, duration, location, is_recurring, recurring_pattern, status
      ) VALUES (
        ${user.id}, ${name}, ${description || null}, ${maxCapacity}, ${pricePerPerson},
        ${scheduledAt}, ${duration}, ${location || null}, ${isRecurring || false}, ${recurringPattern || null}, 'scheduled'
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      class: Array.isArray(groupClass) ? groupClass[0] : groupClass,
      message: "Group class created successfully",
    });
  } catch (error: any) {
    console.error("❌ Error creating group class:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create group class" },
      { status: 500 }
    );
  }
}


/**
 * DELETE /api/group-classes
 * Cancel group class
 */
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const classId = url.searchParams.get("id");

    if (!classId) {
      return NextResponse.json({ error: "Class ID required" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ id: userId }, { email: userId }] },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Cancel class
    await prisma.$queryRaw`
      UPDATE group_classes
      SET status = 'cancelled'
      WHERE id = ${classId} AND trainer_id = ${user.id}
    `;

    // TODO: Send cancellation notifications to all booked clients

    return NextResponse.json({
      success: true,
      message: "Group class cancelled successfully",
    });
  } catch (error: any) {
    console.error("❌ Error cancelling class:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel class" },
      { status: 500 }
    );
  }
}










