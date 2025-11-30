import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOrCreateUser } from "@/lib/get-or-create-user"

// GET /api/ai-persona - Get trainer's AI persona settings
export async function GET(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()

    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get AI persona from ai_personas table
    const persona = await prisma.aiPersona.findFirst({
      where: { trainerId: trainer.id }
    })

    // If no persona exists, return default
    if (!persona) {
      return NextResponse.json({
        success: true,
        persona: getDefaultPersona(trainer),
        message: 'Using default AI persona'
      })
    }

    return NextResponse.json({
      success: true,
      persona
    })
  } catch (error) {
    console.error("Error fetching AI persona:", error)
    return NextResponse.json(
      { error: "Failed to fetch AI persona" },
      { status: 500 }
    )
  }
}

// POST /api/ai-persona - Create/Update AI persona
export async function POST(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()

    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      name,
      tagline,
      bio,
      teachingStyle,
      personality,
      specialties,
      certifications,
      isActive,
      voiceFileUrl,
      videoUrl
    } = body

    // Check if persona already exists
    const existingPersona = await prisma.aiPersona.findFirst({
      where: { trainerId: trainer.id }
    })

    let persona

    if (existingPersona) {
      // Update existing persona
      persona = await prisma.aiPersona.update({
        where: { id: existingPersona.id },
        data: {
          name: name || existingPersona.name,
          tagline: tagline !== undefined ? tagline : existingPersona.tagline,
          bio: bio !== undefined ? bio : existingPersona.bio,
          teachingStyle: teachingStyle || existingPersona.teachingStyle,
          personality: personality || existingPersona.personality,
          specialties: specialties || existingPersona.specialties,
          certifications: certifications || existingPersona.certifications,
          isActive: isActive !== undefined ? isActive : existingPersona.isActive,
          voiceFileUrl: voiceFileUrl !== undefined ? voiceFileUrl : existingPersona.voiceFileUrl,
          videoUrl: videoUrl !== undefined ? videoUrl : existingPersona.videoUrl,
          updatedAt: new Date()
        }
      })

      console.log('✅ AI persona updated:', persona.id)

      return NextResponse.json({
        success: true,
        persona,
        message: 'AI persona updated'
      })
    } else {
      // Create new persona
      persona = await prisma.aiPersona.create({
        data: {
          id: crypto.randomUUID(),
          trainerId: trainer.id,
          name: name || `${trainer.name}'s AI Assistant`,
          tagline: tagline || `Your AI-powered training companion`,
          bio: bio || `I'm an AI assistant helping ${trainer.name} provide exceptional training experiences.`,
          teachingStyle: teachingStyle || 'motivational',
          personality: personality || {
            tone: 'friendly',
            communication: 'concise',
            useEmojis: true,
            responseLength: 'medium'
          },
          specialties: specialties || [],
          certifications: certifications || [],
          isActive: isActive !== undefined ? isActive : true,
          voiceFileUrl: voiceFileUrl || null,
          videoUrl: videoUrl || null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      console.log('✅ AI persona created:', persona.id)

      return NextResponse.json({
        success: true,
        persona,
        message: 'AI persona created'
      })
    }
  } catch (error: any) {
    console.error("Error saving AI persona:", error)
    return NextResponse.json(
      { error: "Failed to save AI persona", details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/ai-persona - Reset to default
export async function DELETE(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()

    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete custom persona
    await prisma.aiPersona.deleteMany({
      where: { trainerId: trainer.id }
    })

    console.log('✅ AI persona reset to default for trainer:', trainer.id)

    return NextResponse.json({
      success: true,
      persona: getDefaultPersona(trainer),
      message: 'AI persona reset to default'
    })
  } catch (error: any) {
    console.error("Error resetting AI persona:", error)
    return NextResponse.json(
      { error: "Failed to reset AI persona", details: error.message },
      { status: 500 }
    )
  }
}

// Helper: Get default persona
function getDefaultPersona(trainer: any) {
  return {
    name: `${trainer.name}'s AI Assistant (Gia)`,
    tagline: 'Your AI-powered training companion',
    bio: `I'm Gia, an AI assistant helping ${trainer.name} manage training, clients, and business operations.`,
    teachingStyle: 'motivational',
    personality: {
      tone: 'friendly',
      communication: 'concise',
      useEmojis: true,
      responseLength: 'medium'
    },
    specialties: ['fitness', 'training', 'scheduling', 'client management'],
    certifications: [],
    isActive: true
  }
}
