import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/videos/share
 * Share video with client
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { videoId, clientId } = body;

    if (!videoId || !clientId) {
      return NextResponse.json(
        { error: "Video ID and Client ID are required" },
        { status: 400 }
      );
    }

    const share = await prisma.$queryRaw`
      INSERT INTO video_shares (video_id, client_id)
      VALUES (${videoId}, ${clientId})
      RETURNING *
    `;

    // TODO: Send push notification to client

    return NextResponse.json({
      success: true,
      share: Array.isArray(share) ? share[0] : share,
      message: "Video shared with client",
    });
  } catch (error: any) {
    console.error("❌ Error sharing video:", error);
    return NextResponse.json(
      { error: error.message || "Failed to share video" },
      { status: 500 }
    );
  }
}




