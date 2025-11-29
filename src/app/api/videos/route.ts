import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/videos
 * Get exercise videos for trainer
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
    const specialty = url.searchParams.get("specialty");
    const category = url.searchParams.get("category");

    let whereClause = `WHERE trainer_id = '${user.id}'`;
    if (specialty) whereClause += ` AND specialty = '${specialty}'`;
    if (category) whereClause += ` AND category = '${category}'`;

    const videos = await prisma.$queryRawUnsafe(`
      SELECT * FROM exercise_videos 
      ${whereClause}
      ORDER BY created_at DESC
    `);

    return NextResponse.json({ success: true, videos });
  } catch (error: any) {
    console.error("❌ Error fetching videos:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/videos
 * Upload new exercise video
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
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration,
      category,
      tags,
      specialty,
      difficulty,
      equipment,
      isPublic,
    } = body;

    if (!title || !videoUrl) {
      return NextResponse.json(
        { error: "Title and video URL are required" },
        { status: 400 }
      );
    }

    const video = await prisma.$queryRaw`
      INSERT INTO exercise_videos (
        trainer_id, title, description, video_url, thumbnail_url,
        duration, category, tags, specialty, difficulty, equipment, is_public
      ) VALUES (
        ${user.id}, ${title}, ${description || null}, ${videoUrl}, ${thumbnailUrl || null},
        ${duration || null}, ${category || null}, ARRAY[${tags?.join(',') || ''}]::text[],
        ${specialty || null}, ${difficulty || null}, ARRAY[${equipment?.join(',') || ''}]::text[], ${isPublic || false}
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      video: Array.isArray(video) ? video[0] : video,
      message: "Video uploaded successfully",
    });
  } catch (error: any) {
    console.error("❌ Error uploading video:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload video" },
      { status: 500 }
    );
  }
}


/**
 * DELETE /api/videos
 * Delete video
 */
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const videoId = url.searchParams.get("id");

    if (!videoId) {
      return NextResponse.json({ error: "Video ID required" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ id: userId }, { email: userId }] },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.$queryRaw`
      DELETE FROM exercise_videos 
      WHERE id = ${videoId} AND trainer_id = ${user.id}
    `;

    return NextResponse.json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error: any) {
    console.error("❌ Error deleting video:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete video" },
      { status: 500 }
    );
  }
}










