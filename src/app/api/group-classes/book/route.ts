import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/group-classes/book
 * Book client into group class
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { classId, clientId } = body;

    if (!classId || !clientId) {
      return NextResponse.json(
        { error: "Class ID and Client ID are required" },
        { status: 400 }
      );
    }

    // Check if class is full
    const classInfo: any = await prisma.$queryRaw`
      SELECT g.max_capacity, g.current_bookings
      FROM group_classes g
      WHERE g.id = ${classId}
    `;

    if (classInfo[0]?.current_bookings >= classInfo[0]?.max_capacity) {
      return NextResponse.json(
        { error: "Class is full. Consider adding to waitlist." },
        { status: 400 }
      );
    }

    // Book client
    const booking = await prisma.$queryRaw`
      INSERT INTO group_class_bookings (class_id, client_id, status)
      VALUES (${classId}, ${clientId}, 'confirmed')
      RETURNING *
    `;

    // Update class current_bookings
    await prisma.$queryRaw`
      UPDATE group_classes
      SET current_bookings = current_bookings + 1
      WHERE id = ${classId}
    `;

    return NextResponse.json({
      success: true,
      booking: Array.isArray(booking) ? booking[0] : booking,
      message: "Client booked successfully",
    });
  } catch (error: any) {
    console.error("❌ Error booking class:", error);
    return NextResponse.json(
      { error: error.message || "Failed to book class" },
      { status: 500 }
    );
  }
}




