import { NextRequest } from 'next/server'
import { getOrCreateUser } from "@/lib/get-or-create-user"
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { SPECIALIZATION_PROMPTS, CONTEXT_ENHANCED_PROMPT } from '@/lib/gia/expert-prompts'
import { prisma } from '@/lib/prisma'
import { getGiaTools } from '@/lib/gia/ai-tools'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const authUser = await getOrCreateUser()

    if (!authUser) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { messages, files, mode, clientId } = await request.json()

    if (!messages || messages.length === 0) {
      return new Response('No messages provided', { status: 400 })
    }

    // Get trainer from database with clients
    const dbUser = await prisma.users.findUnique({
      where: { id: authUser.id },
      include: {
        clients: {
          select: {
            id: true,
            name: true,
            goals: true,
            sport: true,
            skillLevel: true,
            injuries: true,
            preferences: true,
            progress: true,
            sessionsCount: true,
            lastSessionDate: true,
          }
        }
      }
    })

    // If specific client mentioned, get their context
    let clientContext = null
    if (clientId && dbUser) {
      clientContext = dbUser.clients.find(c => c.id === clientId)
    } else if (dbUser) {
      // Try to detect client name in message
      const lastMessage = messages[messages.length - 1]?.content.toLowerCase()
      const detectedClient = dbUser.clients.find(c =>
        lastMessage && lastMessage.includes(c.name.toLowerCase())
      )
      if (detectedClient) {
        clientContext = detectedClient
      }
    }

    // Build file context
    let fileContext = ''
    if (files && files.length > 0) {
      fileContext = `\n\n**Attached Files:**\n${files.map((f: any) => `- ${f.name} (${f.type})`).join('\n')}\n\n`
    }

    // Add client context hint to user message
    let clientContextHint = ''
    if (clientContext) {
      clientContextHint = `\n\n[IMPORTANT: I have context about ${clientContext.name}. Reference their specific situation in your response.]`
    }

    // Detect specialization from message content
    const lastUserMessage = messages[messages.length - 1]
    const messageText = lastUserMessage.content.toLowerCase()
    let specialization: keyof typeof SPECIALIZATION_PROMPTS = 'sports' // Default to sports

    // Wellness keywords
    if (messageText.includes('yoga') || messageText.includes('pilates') || messageText.includes('barre') ||
      messageText.includes('meditation') || messageText.includes('breathwork') || messageText.includes('mindfulness') ||
      messageText.includes('stretching') || messageText.includes('flexibility') || messageText.includes('mind-body')) {
      specialization = 'wellness'
    }
    // Sports keywords
    else if (messageText.includes('pickleball') || messageText.includes('tennis') || messageText.includes('golf') ||
      messageText.includes('basketball') || messageText.includes('soccer') || messageText.includes('padel') ||
      messageText.includes('racquetball') || messageText.includes('volleyball') || messageText.includes('baseball') ||
      messageText.includes('drill') || messageText.includes('technique') || messageText.includes('lesson plan')) {
      specialization = 'sports'
    }
    // Nutrition keywords  
    else if (messageText.includes('nutrition') || messageText.includes('diet') || messageText.includes('meal') ||
      messageText.includes('macro') || messageText.includes('fuel') || messageText.includes('hydration')) {
      specialization = 'nutrition'
    }
    // Performance keywords
    else if (messageText.includes('speed') || messageText.includes('strength') || messageText.includes('power') ||
      messageText.includes('agility') || messageText.includes('vertical') || messageText.includes('conditioning') ||
      messageText.includes('athletic') || messageText.includes('performance')) {
      specialization = 'programming'
    }
    // Injury/Rehab keywords
    else if (messageText.includes('injury') || messageText.includes('pain') || messageText.includes('rehab') ||
      messageText.includes('recovery') || messageText.includes('physical therapy')) {
      specialization = 'rehab'
    }
    // Business keywords
    else if (messageText.includes('business') || messageText.includes('marketing') || messageText.includes('social media') ||
      messageText.includes('client') || messageText.includes('pricing') || messageText.includes('revenue')) {
      specialization = 'business'
    }
    // Psychology keywords
    else if (messageText.includes('motivation') || messageText.includes('psychology') || messageText.includes('habit') ||
      messageText.includes('mental') || messageText.includes('mindset')) {
      specialization = 'psychology'
    }

    // Use mode if explicitly provided
    if (mode && SPECIALIZATION_PROMPTS[mode as keyof typeof SPECIALIZATION_PROMPTS]) {
      specialization = mode as keyof typeof SPECIALIZATION_PROMPTS
    }

    // Build context-aware system prompt with client data
    const systemPrompt = CONTEXT_ENHANCED_PROMPT(
      specialization,
      clientContext ? {
        name: clientContext.name,
        goals: clientContext.goals,
        injuries: clientContext.injuries,
        experience: clientContext.skillLevel || undefined,
        equipment: [], // Can add later from client preferences
      } : undefined,
      dbUser ? {
        specialty: dbUser.specialties?.[0],
        clientCount: dbUser.clients?.length || 0,
        businessGoals: [], // Add if available in DB
      } : undefined
    )

    // Inject file context and client hint into the last message
    const coreMessages = messages.slice(0, -1)
    const lastMessageContent = `${lastUserMessage.content}${fileContext}${clientContextHint}`

    const result = streamText({
      model: openai('gpt-4o'), // Upgraded to GPT-4o for "Legora" level intelligence
      system: systemPrompt,
      messages: [
        ...coreMessages,
        { role: 'user', content: lastMessageContent }
      ],
      tools: getGiaTools(authUser.id),
      temperature: 0.7,
    })

    return result.toDataStreamResponse()

  } catch (error: any) {
    console.error('[GIA Chat] Error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
