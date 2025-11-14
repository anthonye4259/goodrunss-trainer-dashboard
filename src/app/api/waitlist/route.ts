import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/waitlist
 * Get waitlist entries for trainer's sessions
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
    const sessionId = url.searchParams.get("sessionId");

    let query;
    if (sessionId) {
      // Get waitlist for specific session
      query = await prisma.$queryRaw`
        SELECT w.*, u.name as client_name, u.email as client_email,
               s.title as session_title, s.scheduled_at
        FROM waitlist_entries w
        JOIN users u ON w.client_id = u.id
        JOIN trainer_sessions s ON w.session_id = s.id
        WHERE s.trainer_id = ${user.id} AND w.session_id = ${sessionId}
        AND w.status = 'waiting'
        ORDER BY w.position ASC
      `;
    } else {
      // Get all active waitlist entries
      query = await prisma.$queryRaw`
        SELECT w.*, u.name as client_name, u.email as client_email,
               s.title as session_title, s.scheduled_at
        FROM waitlist_entries w
        JOIN users u ON w.client_id = u.id
        JOIN trainer_sessions s ON w.session_id = s.id
        WHERE s.trainer_id = ${user.id}
        AND w.status IN ('waiting', 'notified')
        ORDER BY s.scheduled_at ASC, w.position ASC
      `;
    }

    return NextResponse.json({ success: true, waitlist: query });
  } catch (error: any) {
    console.error("❌ Error fetching waitlist:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch waitlist" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/waitlist
 * Add client to waitlist
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, clientId } = body;

    if (!sessionId || !clientId) {
      return NextResponse.json(
        { error: "Session ID and Client ID required" },
        { status: 400 }
      );
    }

    // Get current position (last in line)
    const lastPosition: any = await prisma.$queryRaw`
      SELECT COALESCE(MAX(position), 0) as max_position 
      FROM waitlist_entries 
      WHERE session_id = ${sessionId}
    `;

    const position = (lastPosition[0]?.max_position || 0) + 1;

    // Add to waitlist
    const entry = await prisma.$queryRaw`
      INSERT INTO waitlist_entries (session_id, client_id, position, status)
      VALUES (${sessionId}, ${clientId}, ${position}, 'waiting')
      RETURNING *
    `;

    // TODO: Send push notification to client

    return NextResponse.json({
      success: true,
      entry: Array.isArray(entry) ? entry[0] : entry,
      message: `Added to waitlist at position ${position}`,
    });
  } catch (error: any) {
    console.error("❌ Error adding to waitlist:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add to waitlist" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/waitlist
 * Notify waitlist (when spot opens)
 */
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    // Get first person in line
    const first: any = await prisma.$queryRaw`
      SELECT w.*, u.name as client_name, u.email as client_email
      FROM waitlist_entries w
      JOIN users u ON w.client_id = u.id
      WHERE w.session_id = ${sessionId} AND w.status = 'waiting'
      ORDER BY w.position ASC
      LIMIT 1
    `;

    if (!first || first.length === 0) {
      return NextResponse.json(
        { error: "No one on waitlist" },
        { status: 404 }
      );
    }

    const firstPerson = first[0];

    // Update status to notified
    await prisma.$queryRaw`
      UPDATE waitlist_entries
      SET status = 'notified', notified_at = NOW()
      WHERE id = ${firstPerson.id}
    `;

    // TODO: Send push notification to client

    return NextResponse.json({
      success: true,
      message: `Notified ${firstPerson.client_name}`,
      client: firstPerson,
    });
  } catch (error: any) {
    console.error("❌ Error notifying waitlist:", error);
    return NextResponse.json(
      { error: error.message || "Failed to notify waitlist" },
      { status: 500 }
    );
  }
}
