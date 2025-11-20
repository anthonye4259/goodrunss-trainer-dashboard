/**
 * Gia Agentic Chatbot API
 * Powered by Google Gemini 2.5 Flash with function calling
 * Can perform actions: view clients, create sessions, fetch analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/get-or-create-user'

const SYSTEM_PROMPT = `You are Gia, an AI-powered assistant for sports instructors, coaches, and wellness professionals on the GoodRunss platform.

You are **agentic** - you can actually DO things, not just chat. You have access to tools to:
• View the trainer's clients list
• View their schedule and upcoming sessions
• Create new training sessions
• Fetch business analytics
• Access their dashboard data

When a trainer asks you to do something, USE YOUR TOOLS to actually do it, then report back with the results.

Be friendly, professional, and proactive. Format your responses with:
• **Bold** for emphasis
• • Bullet points for lists
• Clear structure with line breaks

Always be helpful and encouraging!`

// Define available tools for Gemini
const tools = [
  {
    name: 'get_clients',
    description: 'Get the list of trainer\'s clients with their details',
    parameters: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of clients to return (default: 10)'
        }
      }
    }
  },
  {
    name: 'get_schedule',
    description: 'Get the trainer\'s upcoming sessions and schedule',
    parameters: {
      type: 'object',
      properties: {
        days: {
          type: 'number',
          description: 'Number of days to look ahead (default: 7)'
        }
      }
    }
  },
  {
    name: 'get_analytics',
    description: 'Get business analytics including revenue, sessions count, and trends',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'create_session_plan',
    description: 'Create a detailed training session plan',
    parameters: {
      type: 'object',
      properties: {
        clientName: {
          type: 'string',
          description: 'Name of the client'
        },
        duration: {
          type: 'number',
          description: 'Session duration in minutes'
        },
        focus: {
          type: 'string',
          description: 'Main focus of the session'
        },
        level: {
          type: 'string',
          description: 'Skill level: beginner, intermediate, advanced'
        }
      },
      required: ['duration', 'focus', 'level']
    }
  }
]

// Tool execution functions
async function executeTools(functionCalls: any[], trainerId: string) {
  const results = []
  
  for (const call of functionCalls) {
    const { name, args } = call
    
    try {
      switch (name) {
        case 'get_clients': {
          const limit = args?.limit || 10
          const clients = await prisma.clients.findMany({
            where: { trainerId },
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              status: true,
              createdAt: true
            }
          })
          results.push({
            tool: name,
            result: clients,
            summary: `Found ${clients.length} clients`
          })
          break
        }
        
        case 'get_schedule': {
          const days = args?.days || 7
          const startDate = new Date()
          const endDate = new Date()
          endDate.setDate(endDate.getDate() + days)
          
          const sessions = await prisma.trainer_sessions.findMany({
            where: {
              trainerId,
              scheduledAt: {
                gte: startDate,
                lte: endDate
              }
            },
            include: {
              clients: {
                select: {
                  name: true,
                  email: true
                }
              }
            },
            orderBy: { scheduledAt: 'asc' }
          })
          
          results.push({
            tool: name,
            result: sessions,
            summary: `Found ${sessions.length} upcoming sessions in the next ${days} days`
          })
          break
        }
        
        case 'get_analytics': {
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          
          const [totalClients, completedSessions, totalRevenue] = await Promise.all([
            prisma.clients.count({ where: { trainerId } }),
            prisma.trainer_sessions.count({
              where: {
                trainerId,
                status: 'COMPLETED'
              }
            }),
            prisma.payments.aggregate({
              where: {
                trainerId,
                status: 'COMPLETED',
                createdAt: { gte: thirtyDaysAgo }
              },
              _sum: { amount: true }
            })
          ])
          
          const analytics = {
            totalClients,
            completedSessions,
            revenueLastMonth: totalRevenue._sum.amount || 0
          }
          
          results.push({
            tool: name,
            result: analytics,
            summary: `Retrieved business analytics`
          })
          break
        }
        
        case 'create_session_plan': {
          // Generate session plan (stored in Gia's response, not database yet)
          const plan = {
            clientName: args?.clientName || 'Client',
            duration: args?.duration || 60,
            focus: args?.focus || 'General training',
            level: args?.level || 'intermediate',
            created: new Date().toISOString()
          }
          
          results.push({
            tool: name,
            result: plan,
            summary: `Created ${args?.duration || 60}-minute session plan focused on ${args?.focus || 'training'}`
          })
          break
        }
        
        default:
          results.push({
            tool: name,
            error: 'Unknown tool'
          })
      }
    } catch (error: any) {
      console.error(`Error executing tool ${name}:`, error)
      results.push({
        tool: name,
        error: error.message
      })
    }
  }
  
  return results
}

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get trainer data
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check API key
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    if (!apiKey) {
      console.error('GOOGLE_GEMINI_API_KEY not found')
      return NextResponse.json(
        { 
          success: false, 
          message: "Hi! I'm Gia. Please add GOOGLE_GEMINI_API_KEY to Vercel environment variables." 
        },
        { status: 503 }
      )
    }

    // Build conversation for Gemini
    const contents: any[] = []
    
    // Add system prompt
    contents.push({
      role: 'user',
      parts: [{ text: SYSTEM_PROMPT }]
    })
    contents.push({
      role: 'model',
      parts: [{ text: "Understood! I'm Gia, ready to help with agentic capabilities!" }]
    })
    
    // Add conversation history
    if (history && history.length > 1) {
      history.slice(1).forEach((msg: any) => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        })
      })
    }

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    })

    // Call Gemini with function calling
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          tools: [{ function_declarations: tools }]
        })
      }
    )

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json()
      console.error('Gemini API error:', errorData)
      throw new Error('Gemini API failed')
    }

    const geminiData = await geminiResponse.json()
    const candidate = geminiData.candidates?.[0]
    
    if (!candidate) {
      throw new Error('No response from Gemini')
    }

    // Check if Gemini wants to call functions
    const functionCalls = candidate.content?.parts?.filter((part: any) => part.functionCall)
    
    if (functionCalls && functionCalls.length > 0) {
      // Execute the requested functions
      const toolResults = await executeTools(
        functionCalls.map((fc: any) => ({
          name: fc.functionCall.name,
          args: fc.functionCall.args
        })),
        trainer.id
      )
      
      // Send results back to Gemini for final response
      contents.push({
        role: 'model',
        parts: functionCalls.map((fc: any) => ({ functionCall: fc.functionCall }))
      })
      
      contents.push({
        role: 'user',
        parts: toolResults.map((result: any) => ({
          functionResponse: {
            name: result.tool,
            response: result
          }
        }))
      })
      
      // Get final response from Gemini
      const finalResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents })
        }
      )
      
      const finalData = await finalResponse.json()
      const finalText = finalData.candidates?.[0]?.content?.parts?.[0]?.text
      
      return NextResponse.json({
        success: true,
        message: finalText || 'I executed your request!',
        toolsUsed: toolResults.map((r: any) => r.tool)
      })
    }
    
    // No function calls, just return text response
    const responseText = candidate.content?.parts?.[0]?.text
    
    return NextResponse.json({
      success: true,
      message: responseText || 'I can help you with that!',
    })
    
  } catch (error: any) {
    console.error('Gia chat error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: "I'm having trouble right now. Please try again!" 
      },
      { status: 500 }
    )
  }
}
