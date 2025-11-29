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
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    // Get videos from exercise_videos table (filtered by trainer)
    const where: any = { trainer_id: trainer.id }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category && category !== 'all') {
      where.category = category
    }

    // Get videos
    const videos = await prisma.exercise_videos.findMany({
      where,
      orderBy: { created_at: 'desc' }
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
      specialty,
      difficulty,
      equipment,
      isPublic
    } = body

    if (!title || !videoUrl) {
      return NextResponse.json(
        { error: "Title and video URL are required" },
        { status: 400 }
      )
    }

    // Create video record
    const video = await prisma.exercise_videos.create({
      data: {
        trainer_id: trainer.id,
        title,
        description: description || null,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl || null,
        duration: duration || null,
        category: category || null,
        tags: tags || [],
        specialty: specialty || null,
        difficulty: difficulty || null,
        equipment: equipment || [],
        is_public: isPublic || false,
        view_count: 0
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
    const existingVideo = await prisma.exercise_videos.findFirst({
      where: {
        id: videoId,
        trainer_id: trainer.id
      }
    })

    if (!existingVideo) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      )
    }

    // Map camelCase to snake_case for database fields
    const dbUpdates: any = {}
    if (updates.title) dbUpdates.title = updates.title
    if (updates.description !== undefined) dbUpdates.description = updates.description
    if (updates.videoUrl) dbUpdates.video_url = updates.videoUrl
    if (updates.thumbnailUrl !== undefined) dbUpdates.thumbnail_url = updates.thumbnailUrl
    if (updates.duration !== undefined) dbUpdates.duration = updates.duration
    if (updates.category !== undefined) dbUpdates.category = updates.category
    if (updates.tags) dbUpdates.tags = updates.tags
    if (updates.specialty !== undefined) dbUpdates.specialty = updates.specialty
    if (updates.difficulty !== undefined) dbUpdates.difficulty = updates.difficulty
    if (updates.equipment) dbUpdates.equipment = updates.equipment
    if (updates.isPublic !== undefined) dbUpdates.is_public = updates.isPublic

    // Update video
    const video = await prisma.exercise_videos.update({
      where: { id: videoId },
      data: {
        ...dbUpdates,
        updated_at: new Date()
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
    const existingVideo = await prisma.exercise_videos.findFirst({
      where: {
        id: videoId,
        trainer_id: trainer.id
      }
    })

    if (!existingVideo) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      )
    }

    // Delete video
    await prisma.exercise_videos.delete({
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
