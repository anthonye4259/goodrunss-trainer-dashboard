import { NextRequest } from 'next/server'
import { getOrCreateUser } from "@/lib/get-or-create-user"
import { openai } from '@ai-sdk/openai'
import { generateText, streamText, CoreMessage } from 'ai'
import { z } from 'zod'
import { SPECIALIZATION_PROMPTS, CONTEXT_ENHANCED_PROMPT } from '@/lib/gia/expert-prompts'
import { prisma } from '@/lib/prisma'
import { getHotLeads } from '@/lib/gia/functions'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

// Helper to extract text from message content
function getMessageContent(content: string | Array<any>): string {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content
      .filter(part => part.type === 'text')
      .map(part => part.text)
      .join(' ')
  }
  return ''
}

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('[GIA Chat] OPENAI_API_KEY is not configured')
      return new Response(JSON.stringify({
        error: 'OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const authUser = await getOrCreateUser()

    if (!authUser) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { messages, files, mode, clientId } = await request.json() as {
      messages: CoreMessage[],
      files: any,
      mode: string,
      clientId: string
    }

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

    if (!dbUser) {
      return new Response('User not found', { status: 404 })
    }

    // If specific client mentioned, get their context
    let clientContext = null
    if (clientId && dbUser) {
      clientContext = dbUser.clients.find(c => c.id === clientId)
    } else if (dbUser) {
      // Try to detect client name in message
      const lastMessage = getMessageContent(messages[messages.length - 1]?.content).toLowerCase()
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
    const messageText = getMessageContent(lastUserMessage.content).toLowerCase()
    let specialization: keyof typeof SPECIALIZATION_PROMPTS = 'sports' // Default to sports

    // Wellness keywords
    if (messageText.includes('yoga') || messageText.includes('pilates') || messageText.includes('barre') ||
      messageText.includes('meditation') || messageText.includes('breathwork') || messageText.includes('mindfulness') ||
      messageText.includes('stretching') || messageText.includes('flexibility') || messageText.includes('mind-body')) {
      specialization = 'wellness'
    }
    // Swimming keywords
    else if (messageText.includes('swim') || messageText.includes('freestyle') || messageText.includes('backstroke') ||
      messageText.includes('breaststroke') || messageText.includes('butterfly') || messageText.includes('stroke') ||
      messageText.includes('pool') || messageText.includes('lap') || messageText.includes('triathlon') ||
      messageText.includes('flip turn') || messageText.includes('open water') || messageText.includes('aquatic')) {
      specialization = 'swimming'
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

    // Load relevant memories for this trainer
    const { getRelevantMemories, formatMemoriesForPrompt } = await import('@/lib/gia/memory')
    const conversationContext = messages.map(m => getMessageContent(m.content)).join(' ')
    const relevantMemories = await getRelevantMemories(dbUser.id, conversationContext, 10)
    const memoryPrompt = formatMemoriesForPrompt(relevantMemories)

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
    ) + memoryPrompt // Inject memories into system prompt

    // Inject file context and client hint into the last message
    const coreMessages = messages.slice(0, -1)
    const lastMessageContent = `${lastUserMessage.content}${fileContext}${clientContextHint}`

    const result = await generateText({
      model: openai('gpt-4o'), // Upgraded to GPT-4o for "Legora" level intelligence
      system: systemPrompt,
      messages: [
        ...coreMessages,
        { role: 'user', content: lastMessageContent }
      ],
      temperature: 0.7,
      tools: {
        sendSMS: {
          description: 'Send SMS messages to clients via Twilio. Can send to specific clients, all clients, or custom phone numbers. Use this when the trainer asks to send messages, reminders, or bulk communications.',
          inputSchema: z.object({
            message: z.string().describe('The SMS message to send. Use {name} or {client_name} for personalization.'),
            clientIds: z.array(z.string()).optional().describe('Array of client IDs to send to'),
            sendToAll: z.boolean().optional().describe('Set to true to send to all clients with phone numbers'),
            phoneNumbers: z.array(z.string()).optional().describe('Custom phone numbers to send to (in E.164 format, e.g., +1234567890)')
          }),
          execute: async ({ message, clientIds, sendToAll, phoneNumbers }) => {
            try {
              console.log('[GIA SMS] Sending SMS:', { message, clientIds, sendToAll, phoneNumbers })

              const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/gia/send-sms`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Cookie': request.headers.get('cookie') || ''
                },
                body: JSON.stringify({
                  message,
                  clientIds,
                  sendToAll,
                  phoneNumbers
                })
              })

              const data = await response.json()

              if (!response.ok) {
                return {
                  success: false,
                  error: data.error || 'Failed to send SMS'
                }
              }

              return {
                success: true,
                sent: data.sent,
                failed: data.failed,
                total: data.total,
                message: `Successfully sent ${data.sent} message(s). ${data.failed > 0 ? `${data.failed} failed.` : ''}`
              }
            } catch (error: any) {
              console.error('[GIA SMS] Error:', error)
              return {
                success: false,
                error: error.message || 'Failed to send SMS'
              }
            }
          }
        },
        analyzeClasses: {
          description: 'Analyze class performance, attendance patterns, and revenue. Use this when the trainer asks about class analytics, attendance trends, or which classes are performing well.',
          inputSchema: z.object({
            timeframe: z.enum(['week', 'month', 'quarter']).optional().describe('Timeframe for analysis (defaults to month)')
          }),
          execute: async ({ timeframe }) => {
            try {
              console.log('[GIA CLASS ANALYTICS] Analyzing classes:', { timeframe })

              const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/gia/class-analytics`, {
                method: 'GET',
                headers: {
                  'Cookie': request.headers.get('cookie') || ''
                }
              })

              const data = await response.json()

              if (!response.ok) {
                return {
                  success: false,
                  error: data.error || 'Failed to analyze classes'
                }
              }

              const { classInsights, attendancePatterns, revenueBreakdown, topPerformingClasses, recommendations } = data.data

              // Format insights for Gia
              const summary = {
                success: true,
                totalRevenue: revenueBreakdown.total,
                topClasses: topPerformingClasses.map((c: any) => ({
                  name: c.className,
                  revenue: c.revenue,
                  attendance: c.attendance
                })),
                underperforming: classInsights.filter((c: any) => c.profitability === 'low').map((c: any) => ({
                  name: c.className,
                  issue: c.recommendations.join(', ')
                })),
                dropoffs: attendancePatterns.filter((p: any) => p.dropoffDetected).map((p: any) => ({
                  client: p.clientName,
                  recommendation: p.recommendation
                })),
                recommendations
              }

              return summary
            } catch (error: any) {
              console.error('[GIA CLASS ANALYTICS] Error:', error)
              return {
                success: false,
                error: error.message || 'Failed to analyze classes'
              }
            }
          }
        },
        getHotLeads: {
          description: 'Fetch hot client leads for the trainer. Use this when the trainer asks: "find leads", "get leads", "show me leads", "generate leads", "who should I contact", or any variation asking for potential clients. ALWAYS use this tool when leads are mentioned.',
          inputSchema: z.object({}),
          execute: async () => {
            try {
              console.log('[GIA Chat] Calling getHotLeads tool')
              const result = await getHotLeads({}, dbUser.id)
              console.log('[GIA Chat] getHotLeads result:', JSON.stringify(result, null, 2))
              return result
            } catch (error: any) {
              console.error('[GIA Chat] getHotLeads error:', error)
              return { success: false, error: error.message }
            }
          }
        },
        draftLeadMessage: {
          description: 'Draft a personalized intro message for a lead. Use this when the trainer wants to contact a lead.',
          inputSchema: z.object({
            leadId: z.string().describe('ID of the lead'),
            leadName: z.string().describe('Name of the lead'),
            sport: z.string().optional().describe('Sport interest'),
            goals: z.string().optional().describe('Fitness goals')
          }),
          execute: async ({ leadId, leadName, sport, goals }) => {
            try {
              // 1. Generate message
              const draftRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/gia/draft-message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Cookie': request.headers.get('cookie') || '' },
                body: JSON.stringify({
                  type: 'lead_intro',
                  recipientId: leadId,
                  recipientName: leadName,
                  context: { sport, goals }
                })
              })
              const draftData = await draftRes.json()

              // 2. Add to queue
              const queueRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/gia/message-queue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Cookie': request.headers.get('cookie') || '' },
                body: JSON.stringify({
                  recipientId: leadId,
                  recipientName: leadName,
                  message: draftData.message,
                  type: 'lead_intro',
                  channel: 'sms'
                })
              })

              return {
                success: true,
                message: `Draft created for ${leadName}: "${draftData.message}". It has been added to your Draft Queue for approval.`
              }
            } catch (error: any) {
              return { error: error.message }
            }
          }
        },
        draftReengagementMessage: {
          description: 'Draft a re-engagement message for an at-risk client. Use this when the trainer wants to reach out to a client who hasn\'t visited in a while.',
          inputSchema: z.object({
            clientId: z.string().describe('ID of the client'),
            clientName: z.string().describe('Name of the client'),
            missedSessions: z.number().optional().describe('Number of missed sessions')
          }),
          execute: async ({ clientId, clientName, missedSessions }) => {
            try {
              // 1. Generate message
              const draftRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/gia/draft-message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Cookie': request.headers.get('cookie') || '' },
                body: JSON.stringify({
                  type: 'churn_reengagement',
                  recipientId: clientId,
                  recipientName: clientName,
                  context: { missedSessions }
                })
              })
              const draftData = await draftRes.json()

              // 2. Add to queue
              const queueRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/gia/message-queue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Cookie': request.headers.get('cookie') || '' },
                body: JSON.stringify({
                  recipientId: clientId,
                  recipientName: clientName,
                  message: draftData.message,
                  type: 'churn_reengagement',
                  channel: 'sms'
                })
              })

              return {
                success: true,
                message: `Draft created for ${clientName}: "${draftData.message}". It has been added to your Draft Queue for approval.`
              }
            } catch (error: any) {
              return { error: error.message }
            }
          }
        },
        getMessageQueue: {
          description: 'View pending message drafts. Use this when the trainer asks "what drafts do I have" or "show my queue".',
          inputSchema: z.object({}),
          execute: async () => {
            try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/gia/message-queue`, {
                headers: { 'Cookie': request.headers.get('cookie') || '' }
              })
              const data = await response.json()
              return data
            } catch (error: any) {
              return { error: error.message }
            }
          }
        }
      },
    })

    // Extract memories in the background after response
    if (dbUser && result.text) {
      const { extractAndStoreMemories } = await import('@/lib/gia/memory-extraction')
      const fullConversation = [
        ...coreMessages,
        { role: 'user', content: lastMessageContent },
        { role: 'assistant', content: result.text }
      ]
      extractAndStoreMemories(dbUser.id, fullConversation).catch(err =>
        console.error('Background memory extraction failed:', err)
      )
    }

    // Return the text response as a stream for compatibility with frontend
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        // Send the full text response
        controller.enqueue(encoder.encode(result.text))
        controller.close()
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      }
    })

  } catch (error: any) {
    console.error('[GIA Chat] Error:', error)
    console.error('[GIA Chat] Error stack:', error.stack)
    console.error('[GIA Chat] Error details:', {
      message: error.message,
      name: error.name,
      cause: error.cause
    })
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
