import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

// GET /api/ai-persona - Get AI persona for a trainer
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

    const persona = await prisma.aiPersona.findUnique({
      where: { trainerId: trainer.id },
      include: {
        _count: {
          select: {
            sessions: true,
            feedback: true,
          },
        },
      },
    })

    return NextResponse.json({ persona })
  } catch (error) {
    console.error("Error fetching AI persona:", error)
    return NextResponse.json(
      { error: "Failed to fetch AI persona" },
      { status: 500 }
    )
  }
}

// POST /api/ai-persona - Create or update AI persona
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
      name,
      tagline,
      bio,
      avatarUrl,
      voiceFileUrl,
      voiceSampleText,
      videoUrl,
      teachingStyle,
      personality,
      specialties,
      certifications,
      pricePerSession,
      isActive,
      isDiscoverable,
    } = body

    // Validation
    if (!name || !teachingStyle || !personality) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if persona exists
    const existing = await prisma.aiPersona.findUnique({
      where: { trainerId: trainer.id },
    })

    let persona
    if (existing) {
      // Update existing persona
      persona = await prisma.aiPersona.update({
        where: { trainerId: trainer.id },
        data: {
          name,
          tagline,
          bio,
          avatarUrl,
          voiceFileUrl,
          voiceSampleText,
          videoUrl,
          teachingStyle,
          personality,
          specialties: specialties || [],
          certifications: certifications || [],
          pricePerSession: pricePerSession || 0.30,
          isActive: isActive || false,
          isDiscoverable: isDiscoverable || true,
        },
      })
    } else {
      // Create new persona
      persona = await prisma.aiPersona.create({
        data: {
          trainerId: trainer.id,
          name,
          tagline,
          bio,
          avatarUrl,
          voiceFileUrl,
          voiceSampleText,
          videoUrl,
          teachingStyle,
          personality,
          specialties: specialties || [],
          certifications: certifications || [],
          pricePerSession: pricePerSession || 0.30,
          isActive: isActive || false,
          isDiscoverable: isDiscoverable || true,
        },
      })
    }

    return NextResponse.json({ persona }, { status: existing ? 200 : 201 })
  } catch (error) {
    console.error("Error saving AI persona:", error)
    return NextResponse.json(
      { error: "Failed to save AI persona" },
      { status: 500 }
    )
  }
}

