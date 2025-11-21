import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOrCreateUser } from "@/lib/get-or-create-user"

// GET /api/video-library - Get trainer's video library
export async function GET(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') // all, workouts, exercises, tutorials
    const search = searchParams.get('search')

    // Get videos from workout_videos table (filtered by trainer)
    const where: any = { trainerId: trainer.id }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get videos
    const videos = await prisma.workout_videos.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    // Group by category
    const videosByCategory = videos.reduce((acc: any, video) => {
      const cat = video.category || 'uncategorized'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(video)
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      videos,
      videosByCategory,
      stats: {
        totalVideos: videos.length,
        categories: Object.keys(videosByCategory)
      }
    })
  } catch (error) {
    console.error("Error fetching video library:", error)
    return NextResponse.json(
      { error: "Failed to fetch video library" },
      { status: 500 }
    )
  }
}

// POST /api/video-library - Upload new video
export async function POST(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { 
      title, 
      description, 
      videoUrl, 
      thumbnailUrl, 
      duration,
      category,
      tags,
      isPublic,
      targetMuscles,
      difficulty
    } = body

    if (!title || !videoUrl) {
      return NextResponse.json(
        { error: "Title and video URL are required" },
        { status: 400 }
      )
    }

    // Create video record
    const video = await prisma.workout_videos.create({
      data: {
        id: crypto.randomUUID(),
        trainerId: trainer.id,
        title,
        description: description || null,
        url: videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        duration: duration || 0,
        category: category || 'general',
        tags: tags || [],
        targetMuscles: targetMuscles || [],
        difficulty: difficulty || 'intermediate',
        viewCount: 0,
        isPublic: isPublic || false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('✅ Video added to library:', video.id)

    return NextResponse.json({
      success: true,
      video,
      message: 'Video added to library'
    })
  } catch (error: any) {
    console.error("Error uploading video:", error)
    return NextResponse.json(
      { error: "Failed to upload video", details: error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/video-library - Update video
export async function PATCH(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { videoId, ...updates } = body

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      )
    }

    // Verify ownership
    const existingVideo = await prisma.workout_videos.findFirst({
      where: {
        id: videoId,
        trainerId: trainer.id
      }
    })

    if (!existingVideo) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      )
    }

    // Update video
    const video = await prisma.workout_videos.update({
      where: { id: videoId },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    })

    console.log('✅ Video updated:', video.id)

    return NextResponse.json({
      success: true,
      video,
      message: 'Video updated'
    })
  } catch (error: any) {
    console.error("Error updating video:", error)
    return NextResponse.json(
      { error: "Failed to update video", details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/video-library - Delete video
export async function DELETE(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const videoId = searchParams.get('id')

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      )
    }

    // Verify ownership
    const existingVideo = await prisma.workout_videos.findFirst({
      where: {
        id: videoId,
        trainerId: trainer.id
      }
    })

    if (!existingVideo) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      )
    }

    // Delete video
    await prisma.workout_videos.delete({
      where: { id: videoId }
    })

    console.log('✅ Video deleted:', videoId)

    return NextResponse.json({
      success: true,
      message: 'Video deleted'
    })
  } catch (error: any) {
    console.error("Error deleting video:", error)
    return NextResponse.json(
      { error: "Failed to delete video", details: error.message },
      { status: 500 }
    )
  }
}
