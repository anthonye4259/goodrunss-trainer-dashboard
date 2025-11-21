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
    const persona = await prisma.ai_personas.findFirst({
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
      personality,
      tone,
      expertise,
      communicationStyle,
      greetingMessage,
      signaturePhrase,
      responseLength,
      useEmojis,
      customInstructions,
      isActive
    } = body

    // Check if persona already exists
    const existingPersona = await prisma.ai_personas.findFirst({
      where: { trainerId: trainer.id }
    })

    let persona

    if (existingPersona) {
      // Update existing persona
      persona = await prisma.ai_personas.update({
        where: { id: existingPersona.id },
        data: {
          name: name || existingPersona.name,
          personality: personality || existingPersona.personality,
          tone: tone || existingPersona.tone,
          expertise: expertise || existingPersona.expertise,
          communicationStyle: communicationStyle || existingPersona.communicationStyle,
          greetingMessage: greetingMessage || existingPersona.greetingMessage,
          signaturePhrase: signaturePhrase || existingPersona.signaturePhrase,
          responseLength: responseLength || existingPersona.responseLength,
          useEmojis: useEmojis !== undefined ? useEmojis : existingPersona.useEmojis,
          customInstructions: customInstructions || existingPersona.customInstructions,
          isActive: isActive !== undefined ? isActive : existingPersona.isActive,
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
      persona = await prisma.ai_personas.create({
        data: {
          id: crypto.randomUUID(),
          trainerId: trainer.id,
          name: name || `${trainer.name}'s AI Assistant`,
          personality: personality || 'professional',
          tone: tone || 'friendly',
          expertise: expertise || [],
          communicationStyle: communicationStyle || 'concise',
          greetingMessage: greetingMessage || `Hi! I'm ${trainer.name}'s AI assistant. How can I help you today?`,
          signaturePhrase: signaturePhrase || `- ${trainer.name}'s Team`,
          responseLength: responseLength || 'medium',
          useEmojis: useEmojis !== undefined ? useEmojis : true,
          customInstructions: customInstructions || null,
          isActive: isActive !== undefined ? isActive : true,
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
    await prisma.ai_personas.deleteMany({
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
    personality: 'professional',
    tone: 'friendly',
    expertise: ['fitness', 'training', 'scheduling', 'client management'],
    communicationStyle: 'concise',
    greetingMessage: `Hi! I'm Gia, ${trainer.name}'s AI assistant. I can help you with scheduling, client management, analytics, and more. What would you like to do?`,
    signaturePhrase: `- Powered by GoodRunss AI`,
    responseLength: 'medium',
    useEmojis: true,
    customInstructions: null,
    isActive: true
  }
}

// Helper: Generate AI system prompt based on persona (not exported from route)
function generatePersonaSystemPrompt(persona: any, trainerName: string) {
  let prompt = `You are ${persona.name}, an AI assistant helping ${trainerName} manage their training business.

PERSONALITY: ${persona.personality}
TONE: ${persona.tone}
COMMUNICATION STYLE: ${persona.communicationStyle}
RESPONSE LENGTH: ${persona.responseLength}
USE EMOJIS: ${persona.useEmojis ? 'Yes' : 'No'}

EXPERTISE AREAS:
${persona.expertise?.join(', ') || 'General fitness and training'}

GREETING MESSAGE:
"${persona.greetingMessage}"

SIGNATURE:
${persona.signaturePhrase}
`

  if (persona.customInstructions) {
    prompt += `\n\nCUSTOM INSTRUCTIONS FROM TRAINER:\n${persona.customInstructions}`
  }

  prompt += `\n\nYou have access to tools to help manage clients, sessions, payments, analytics, and content generation. Be helpful, accurate, and always prioritize the trainer's needs.`

  return prompt
}
