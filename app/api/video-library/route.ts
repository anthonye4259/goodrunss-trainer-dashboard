import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

// GET /api/video-library - List all videos for a trainer
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const trainer = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const sport = searchParams.get("sport")
    const category = searchParams.get("category")
    const status = searchParams.get("status")

    const where: any = { trainerId: trainer.id }
    if (sport) where.sport = sport
    if (category) where.category = category
    if (status) where.status = status

    const videos = await prisma.videoLibrary.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ videos })
  } catch (error) {
    console.error("Error fetching videos:", error)
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    )
  }
}

// POST /api/video-library - Upload a new video
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const trainer = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 })
    }

    const body = await req.json()
    const {
      title,
      description,
      sport,
      category,
      videoUrl,
      thumbnailUrl,
      duration,
      tags,
      level,
      equipment,
      isPublic,
      isShared,
    } = body

    // Validation
    if (!title || !sport || !category || !videoUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const video = await prisma.videoLibrary.create({
      data: {
        trainerId: trainer.id,
        title,
        description,
        sport,
        category,
        videoUrl,
        thumbnailUrl,
        duration,
        tags: tags || [],
        level,
        equipment: equipment || [],
        isPublic: isPublic || false,
        isShared: isShared || false,
      },
    })

    return NextResponse.json({ video }, { status: 201 })
  } catch (error) {
    console.error("Error uploading video:", error)
    return NextResponse.json(
      { error: "Failed to upload video" },
      { status: 500 }
    )
  }
}

