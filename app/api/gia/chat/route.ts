import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import OpenAI from 'openai'
import { GIA_CORE_IDENTITY, SPECIALIZATION_PROMPTS, CONTEXT_ENHANCED_PROMPT } from '@/lib/gia/expert-prompts'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { messages, files, mode } = body

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Get trainer context from database
    const trainer = await prisma.users.findUnique({
      where: { clerkUserId: user.id },
      include: {
        clients: {
          select: { id: true }
        }
      }
    })

    // Get last user message
    const lastUserMessage = messages[messages.length - 1]
    
    // Build file context
    let fileContext = ''
    if (files && files.length > 0) {
      fileContext = `\n\n**Attached Files:**\n${files.map((f: any) => `- ${f.name} (${f.type})`).join('\n')}\n\n`
    }

    // Detect specialization from message content
    const messageText = lastUserMessage.content.toLowerCase()
    let specialization: keyof typeof SPECIALIZATION_PROMPTS = 'programming'
    
    if (messageText.includes('nutrition') || messageText.includes('diet') || messageText.includes('meal') || messageText.includes('macro')) {
      specialization = 'nutrition'
    } else if (messageText.includes('injury') || messageText.includes('pain') || messageText.includes('rehab') || messageText.includes('mobility')) {
      specialization = 'rehab'
    } else if (messageText.includes('business') || messageText.includes('client') || messageText.includes('marketing') || messageText.includes('social media')) {
      specialization = 'business'
    } else if (messageText.includes('motivation') || messageText.includes('psychology') || messageText.includes('habit')) {
      specialization = 'psychology'
    } else if (messageText.includes('sport') || messageText.includes('basketball') || messageText.includes('soccer') || messageText.includes('tennis')) {
      specialization = 'sports'
    } else if (messageText.includes('yoga') || messageText.includes('pilates') || messageText.includes('barre') || messageText.includes('wellness') || messageText.includes('meditation') || messageText.includes('breathwork') || messageText.includes('mindfulness')) {
      specialization = 'wellness'
    }

    // Use mode if explicitly provided
    if (mode && SPECIALIZATION_PROMPTS[mode as keyof typeof SPECIALIZATION_PROMPTS]) {
      specialization = mode as keyof typeof SPECIALIZATION_PROMPTS
    }

    // Build context-aware system prompt
    const systemPrompt = CONTEXT_ENHANCED_PROMPT(
      specialization,
      undefined, // Client context (will add later)
      {
        clientCount: trainer?.clients?.length || 0,
      }
    )

    // Call OpenAI with expert prompt
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
          content: `${lastUserMessage.content}${fileContext}`
        }
      ],
      max_tokens: 2048, // Increased for detailed responses
      temperature: 0.7,
    })

    const aiResponse = completion.choices[0]?.message?.content || 'No response'
      
    return NextResponse.json({
      success: true,
      response: aiResponse,
    })
  } catch (error: any) {
    console.error('[GIA Chat] OpenAI error:', error)
    console.error('[GIA Chat] Error details:', {
      message: error.message,
      stack: error.stack,
      hasApiKey: !!process.env.OPENAI_API_KEY,
    })
    
    return NextResponse.json({
      success: true,
      response: `I'm having trouble connecting right now. 🤖\n\nError: ${error.message}\n\nPlease check that OPENAI_API_KEY is set in Vercel.`,
    })
  }
}
