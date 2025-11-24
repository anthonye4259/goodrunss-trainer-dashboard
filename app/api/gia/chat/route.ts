import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from "@/lib/get-or-create-user"
import OpenAI from 'openai'
import { GIA_CORE_IDENTITY, SPECIALIZATION_PROMPTS, CONTEXT_ENHANCED_PROMPT } from '@/lib/gia/expert-prompts'
import { parseGIAResponse } from '@/lib/gia/program-parser'
import { prisma } from '@/lib/prisma'
import { GIA_TOOLS } from '@/lib/gia/tools'
import { executeToolCall } from '@/lib/gia/functions'

export async function POST(request: NextRequest) {
  try {
    const authUser = await getOrCreateUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { messages, files, mode, clientId } = body

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

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

    // Get last user message
    const lastUserMessage = messages[messages.length - 1]

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
      } : undefined
    )

    // Call OpenAI with expert prompt and tools
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        ...messages.slice(0, -1).map((m: any) => ({
          role: m.role,
          content: m.content
        })),
        {
          role: 'user',
          content: `${lastUserMessage.content}${fileContext}${clientContextHint}`
        }
      ],
      tools: GIA_TOOLS as any,
      tool_choice: 'auto',
      max_tokens: 2048, // Increased for detailed responses
      temperature: 0.7,
    })

    const responseMessage = completion.choices[0]?.message
    let aiResponse = responseMessage?.content || ''

    // Handle Tool Calls
    if (responseMessage?.tool_calls) {
      const toolCalls = responseMessage.tool_calls

      // Execute each tool
      const toolOutputs = []
      for (const toolCall of toolCalls) {
        // Cast to any to avoid strict type issues with OpenAI SDK versions
        const functionCall = (toolCall as any).function
        if (!functionCall) continue

        const functionName = functionCall.name
        const functionArgs = JSON.parse(functionCall.arguments)

        // Inject trainerId for security
        const result = await executeToolCall(functionName, functionArgs, authUser.id)

        toolOutputs.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          name: functionName,
          content: JSON.stringify(result)
        })
      }

      // Second call to OpenAI with tool outputs
      const secondResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(0, -1).map((m: any) => ({ role: m.role, content: m.content })),
          { role: 'user', content: `${lastUserMessage.content}${fileContext}${clientContextHint}` },
          responseMessage,
          ...toolOutputs as any
        ],
      })

      aiResponse = secondResponse.choices[0]?.message?.content || 'Action completed.'
    }

    // Parse response to check if it's a saveable program
    const parsedProgram = parseGIAResponse(aiResponse, specialization)

    return NextResponse.json({
      success: true,
      response: aiResponse,
      program: parsedProgram, // Include parsed program data if available
    })
  } catch (error: any) {
    console.error('[GIA Chat] Error:', error)

    let errorMessage = `I'm having trouble connecting right now. 🤖\n\nError: ${error.message}`

    // Check for specific error types
    if (error.message?.includes('Tenant or user not found') || error.code === 'P1001') {
      errorMessage = "⚠️ **Database Connection Error**\n\nIt looks like your Supabase database is paused or unreachable. Please check your Supabase dashboard and ensure the project is active."
    } else if (error.message?.includes('OPENAI_API_KEY')) {
      errorMessage = "⚠️ **Configuration Error**\n\nPlease check that OPENAI_API_KEY is set correctly in your Vercel environment variables."
    }

    return NextResponse.json({
      success: true,
      response: errorMessage,
    })
  }
}
