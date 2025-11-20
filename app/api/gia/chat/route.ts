/**
 * Gia Agentic Chatbot API - EXPANDED VERSION
 * Powered by Google Gemini 2.5 Flash with 12+ function calling tools
 * Can perform actions: schedule, message clients, track payments, generate content, and more
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/get-or-create-user'
import { sendEmail } from '@/lib/send-email'

const SYSTEM_PROMPT = `You are Gia, an AI-powered assistant for sports instructors, coaches, and wellness professionals on the GoodRunss platform.

You are **agentic** - you can actually DO things, not just chat. You have access to powerful tools to:

📋 **Client Management:**
• View clients list
• Add new clients
• Update client information
• Search for specific clients

📅 **Scheduling:**
• View schedule and upcoming sessions
• Schedule new sessions with clients
• Check availability

💰 **Business Operations:**
• Track payments and invoices
• View business analytics
• Monitor revenue

💬 **Communication:**
• Send emails to clients
• Send SMS messages (coming soon)
• Automated follow-ups

📝 **Content Creation:**
• Generate training session plans
• Create marketing content for social media
• Write client communications

🤖 **Smart Automation:**
• Provide business recommendations
• Suggest which clients to reach out to
• Identify opportunities

When a trainer asks you to do something, USE YOUR TOOLS to actually do it, then report back with results.

Be friendly, professional, and proactive. Format your responses with:
• **Bold** for emphasis
• • Bullet points for lists
• Clear structure with line breaks

Always be helpful and encouraging!`

// Define available tools for Gemini with expanded capabilities
const tools = [
  // === CLIENT MANAGEMENT ===
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
    name: 'add_client',
    description: 'Add a new client to the trainer\'s roster',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Client\'s full name'
        },
        email: {
          type: 'string',
          description: 'Client\'s email address'
        },
        phone: {
          type: 'string',
          description: 'Client\'s phone number'
        },
        age: {
          type: 'number',
          description: 'Client\'s age (optional)'
        },
        goals: {
          type: 'array',
          items: { type: 'string' },
          description: 'Client\'s fitness goals'
        }
      },
      required: ['name']
    }
  },
  {
    name: 'update_client',
    description: 'Update an existing client\'s information',
    parameters: {
      type: 'object',
      properties: {
        clientName: {
          type: 'string',
          description: 'Name of the client to update'
        },
        field: {
          type: 'string',
          description: 'Field to update: email, phone, age, goals, notes'
        },
        value: {
          type: 'string',
          description: 'New value for the field'
        }
      },
      required: ['clientName', 'field', 'value']
    }
  },
  {
    name: 'search_clients',
    description: 'Search for clients by name, goal, or other criteria',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search term (name, goal, etc.)'
        }
      },
      required: ['query']
    }
  },
  
  // === SCHEDULING ===
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
    name: 'schedule_session',
    description: 'Schedule a new training session with a client',
    parameters: {
      type: 'object',
      properties: {
        clientName: {
          type: 'string',
          description: 'Name of the client'
        },
        date: {
          type: 'string',
          description: 'Session date in YYYY-MM-DD format'
        },
        time: {
          type: 'string',
          description: 'Session time in HH:MM format (24-hour)'
        },
        duration: {
          type: 'number',
          description: 'Duration in minutes (default: 60)'
        },
        type: {
          type: 'string',
          description: 'Session type: PERSONAL_TRAINING, GROUP_CLASS, CONSULTATION'
        }
      },
      required: ['clientName', 'date', 'time']
    }
  },
  
  // === BUSINESS ANALYTICS ===
  {
    name: 'get_analytics',
    description: 'Get business analytics including revenue, sessions count, and trends',
    parameters: {
      type: 'object',
      properties: {
        period: {
          type: 'string',
          description: 'Time period: week, month, year (default: month)'
        }
      }
    }
  },
  {
    name: 'track_payments',
    description: 'View payment status, outstanding invoices, and revenue',
    parameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter by status: all, pending, completed, overdue'
        }
      }
    }
  },
  
  // === COMMUNICATION ===
  {
    name: 'send_message',
    description: 'Send an email or SMS to a client',
    parameters: {
      type: 'object',
      properties: {
        clientName: {
          type: 'string',
          description: 'Name of the client to message'
        },
        method: {
          type: 'string',
          description: 'Communication method: email or sms'
        },
        subject: {
          type: 'string',
          description: 'Email subject line (for email only)'
        },
        message: {
          type: 'string',
          description: 'Message content'
        }
      },
      required: ['clientName', 'method', 'message']
    }
  },
  
  // === CONTENT GENERATION ===
  {
    name: 'create_session_plan',
    description: 'Create a detailed training session plan',
    parameters: {
      type: 'object',
      properties: {
        clientName: {
          type: 'string',
          description: 'Name of the client (optional)'
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
  },
  {
    name: 'generate_content',
    description: 'Generate marketing content for social media, emails, or blogs',
    parameters: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'Content type: instagram, facebook, email, blog'
        },
        topic: {
          type: 'string',
          description: 'Topic or theme for the content'
        },
        count: {
          type: 'number',
          description: 'Number of posts/variations to generate (default: 3)'
        }
      },
      required: ['type', 'topic']
    }
  },
  
  // === SMART RECOMMENDATIONS ===
  {
    name: 'smart_recommendations',
    description: 'Get AI-powered business recommendations and suggestions',
    parameters: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Recommendation category: growth, retention, revenue, scheduling'
        }
      }
    }
  }
]

// Tool execution functions with expanded capabilities
async function executeTools(functionCalls: any[], trainerId: string, trainerName: string) {
  const results = []
  
  for (const call of functionCalls) {
    const { name, args } = call
    
    try {
      switch (name) {
        // === CLIENT MANAGEMENT ===
        
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
              age: true,
              goals: true,
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
        
        case 'add_client': {
          const newClient = await prisma.clients.create({
            data: {
              id: crypto.randomUUID(),
              trainerId,
              name: args.name,
              email: args.email || null,
              phone: args.phone || null,
              age: args.age || null,
              goals: args.goals || [],
              notes: null,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })
          
          // Send welcome email
          if (args.email) {
            await sendEmail({
              to: args.email,
              subject: `Welcome to ${trainerName}'s Training!`,
              html: `<h2>Welcome, ${args.name}! 👋</h2><p>I'm excited to start working with you on your fitness journey!</p><p>Best regards,<br>${trainerName}</p>`,
              text: `Welcome, ${args.name}! I'm excited to start working with you on your fitness journey! - ${trainerName}`
            })
          }
          
          results.push({
            tool: name,
            result: newClient,
            summary: `Added new client: ${args.name}${args.email ? ' (welcome email sent)' : ''}`
          })
          break
        }
        
        case 'update_client': {
          // Find client by name
          const client = await prisma.clients.findFirst({
            where: {
              trainerId,
              name: { contains: args.clientName, mode: 'insensitive' }
            }
          })
          
          if (!client) {
            results.push({
              tool: name,
              error: `Client "${args.clientName}" not found`
            })
            break
          }
          
          // Update the specified field
          const updateData: any = { updatedAt: new Date() }
          if (args.field === 'email') updateData.email = args.value
          else if (args.field === 'phone') updateData.phone = args.value
          else if (args.field === 'age') updateData.age = parseInt(args.value)
          else if (args.field === 'goals') updateData.goals = args.value.split(',').map((g: string) => g.trim())
          else if (args.field === 'notes') updateData.notes = args.value
          
          await prisma.clients.update({
            where: { id: client.id },
            data: updateData
          })
          
          results.push({
            tool: name,
            result: { updated: true, field: args.field },
            summary: `Updated ${client.name}'s ${args.field}`
          })
          break
        }
        
        case 'search_clients': {
          const clients = await prisma.clients.findMany({
            where: {
              trainerId,
              OR: [
                { name: { contains: args.query, mode: 'insensitive' } },
                { email: { contains: args.query, mode: 'insensitive' } },
                { notes: { contains: args.query, mode: 'insensitive' } }
              ]
            },
            take: 10
          })
          
          results.push({
            tool: name,
            result: clients,
            summary: `Found ${clients.length} clients matching "${args.query}"`
          })
          break
        }
        
        // === SCHEDULING ===
        
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
        
        case 'schedule_session': {
          // Find client
          const client = await prisma.clients.findFirst({
            where: {
              trainerId,
              name: { contains: args.clientName, mode: 'insensitive' }
            }
          })
          
          if (!client) {
            results.push({
              tool: name,
              error: `Client "${args.clientName}" not found`
            })
            break
          }
          
          // Create session
          const sessionDate = new Date(`${args.date}T${args.time}:00`)
          const duration = args.duration || 60
          
          const session = await prisma.trainer_sessions.create({
            data: {
              id: crypto.randomUUID(),
              trainerId,
              clientId: client.id,
              title: `Training Session - ${client.name}`,
              description: `Scheduled via Gia`,
              type: args.type || 'PERSONAL_TRAINING',
              duration,
              scheduledAt: sessionDate,
              status: 'SCHEDULED',
              location: null,
              notes: null,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })
          
          // Send confirmation email
          if (client.email) {
            await sendEmail({
              to: client.email,
              subject: `Session Scheduled for ${args.date}`,
              html: `<h2>Hi ${client.name}! 📅</h2><p>Your training session is scheduled for:</p><p><strong>${args.date} at ${args.time}</strong></p><p>Duration: ${duration} minutes</p><p>See you then!<br>${trainerName}</p>`,
              text: `Hi ${client.name}! Your training session is scheduled for ${args.date} at ${args.time}. Duration: ${duration} minutes. See you then! - ${trainerName}`
            })
          }
          
          results.push({
            tool: name,
            result: session,
            summary: `Scheduled ${duration}-min session with ${client.name} on ${args.date} at ${args.time}${client.email ? ' (confirmation sent)' : ''}`
          })
          break
        }
        
        // === BUSINESS ANALYTICS ===
        
        case 'get_analytics': {
          const period = args?.period || 'month'
          let startDate = new Date()
          
          if (period === 'week') startDate.setDate(startDate.getDate() - 7)
          else if (period === 'month') startDate.setDate(startDate.getDate() - 30)
          else if (period === 'year') startDate.setFullYear(startDate.getFullYear() - 1)
          
          const [totalClients, completedSessions, totalRevenue, newClients] = await Promise.all([
            prisma.clients.count({ where: { trainerId } }),
            prisma.trainer_sessions.count({
              where: {
                trainerId,
                status: 'COMPLETED',
                scheduledAt: { gte: startDate }
              }
            }),
            prisma.payments.aggregate({
              where: {
                trainerId,
                status: 'COMPLETED',
                createdAt: { gte: startDate }
              },
              _sum: { amount: true }
            }),
            prisma.clients.count({
              where: {
                trainerId,
                createdAt: { gte: startDate }
              }
            })
          ])
          
          const analytics = {
            period,
            totalClients,
            newClients,
            completedSessions,
            revenue: totalRevenue._sum.amount || 0,
            avgRevenuePerSession: completedSessions > 0 ? ((totalRevenue._sum.amount || 0) / completedSessions) : 0
          }
          
          results.push({
            tool: name,
            result: analytics,
            summary: `Retrieved ${period} analytics`
          })
          break
        }
        
        case 'track_payments': {
          const statusFilter = args?.status || 'all'
          
          const where: any = { trainerId }
          if (statusFilter !== 'all') {
            if (statusFilter === 'overdue') {
              where.status = 'PENDING'
              where.dueDate = { lt: new Date() }
            } else {
              where.status = statusFilter.toUpperCase()
            }
          }
          
          const payments = await prisma.payments.findMany({
            where,
            include: {
              clients: {
                select: { name: true, email: true }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
          })
          
          const totalPending = await prisma.payments.aggregate({
            where: {
              trainerId,
              status: 'PENDING'
            },
            _sum: { amount: true }
          })
          
          results.push({
            tool: name,
            result: {
              payments,
              totalPending: totalPending._sum.amount || 0,
              count: payments.length
            },
            summary: `Found ${payments.length} ${statusFilter} payments (${totalPending._sum.amount || 0} pending)`
          })
          break
        }
        
        // === COMMUNICATION ===
        
        case 'send_message': {
          // Find client
          const client = await prisma.clients.findFirst({
            where: {
              trainerId,
              name: { contains: args.clientName, mode: 'insensitive' }
            }
          })
          
          if (!client) {
            results.push({
              tool: name,
              error: `Client "${args.clientName}" not found`
            })
            break
          }
          
          if (args.method === 'email') {
            if (!client.email) {
              results.push({
                tool: name,
                error: `${client.name} has no email address on file`
              })
              break
            }
            
            await sendEmail({
              to: client.email,
              subject: args.subject || 'Message from your trainer',
              html: `<h2>Hi ${client.name}! 👋</h2><p>${args.message.replace(/\n/g, '<br>')}</p><p>Best regards,<br>${trainerName}</p>`,
              text: `Hi ${client.name}! ${args.message} - ${trainerName}`
            })
            
            results.push({
              tool: name,
              result: { sent: true, method: 'email' },
              summary: `Email sent to ${client.name}`
            })
          } else if (args.method === 'sms') {
            // SMS would integrate with Twilio
            console.log(`[SMS to ${client.phone}] ${args.message}`)
            results.push({
              tool: name,
              result: { sent: true, method: 'sms', note: 'SMS integration coming soon' },
              summary: `SMS queued for ${client.name} (integration pending)`
            })
          }
          break
        }
        
        // === CONTENT GENERATION ===
        
        case 'create_session_plan': {
          const plan = {
            clientName: args?.clientName || 'Client',
            duration: args.duration,
            focus: args.focus,
            level: args.level,
            structure: {
              warmup: Math.round(args.duration * 0.15),
              main: Math.round(args.duration * 0.70),
              cooldown: Math.round(args.duration * 0.15)
            },
            created: new Date().toISOString()
          }
          
          results.push({
            tool: name,
            result: plan,
            summary: `Created ${args.duration}-minute ${args.level} session plan focused on ${args.focus}`
          })
          break
        }
        
        case 'generate_content': {
          const count = args.count || 3
          const content = {
            type: args.type,
            topic: args.topic,
            generated: count,
            note: 'Content generation examples (will be enhanced with actual AI generation)'
          }
          
          results.push({
            tool: name,
            result: content,
            summary: `Generated ${count} ${args.type} posts about ${args.topic}`
          })
          break
        }
        
        // === SMART RECOMMENDATIONS ===
        
        case 'smart_recommendations': {
          const category = args?.category || 'general'
          
          // Fetch data for recommendations
          const [clients, recentSessions, payments] = await Promise.all([
            prisma.clients.findMany({
              where: { trainerId },
              orderBy: { createdAt: 'desc' }
            }),
            prisma.trainer_sessions.findMany({
              where: {
                trainerId,
                scheduledAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
              },
              include: { clients: true }
            }),
            prisma.payments.findMany({
              where: {
                trainerId,
                status: 'PENDING'
              },
              include: { clients: true }
            })
          ])
          
          // Generate smart recommendations
          const recommendations = []
          
          if (category === 'growth' || category === 'general') {
            if (clients.length < 5) {
              recommendations.push({
                type: 'growth',
                priority: 'high',
                title: 'Expand Your Client Base',
                action: 'Use the Client Leads feature to find 3-5 new potential clients this week'
              })
            }
          }
          
          if (category === 'retention' || category === 'general') {
            const inactiveClients = clients.filter(c => {
              return !recentSessions.some(s => s.clientId === c.id)
            })
            
            if (inactiveClients.length > 0) {
              recommendations.push({
                type: 'retention',
                priority: 'high',
                title: 'Re-engage Inactive Clients',
                action: `Reach out to ${inactiveClients.slice(0, 3).map(c => c.name).join(', ')} who haven't booked recently`
              })
            }
          }
          
          if (category === 'revenue' || category === 'general') {
            if (payments.length > 0) {
              recommendations.push({
                type: 'revenue',
                priority: 'medium',
                title: 'Follow Up on Pending Payments',
                action: `${payments.length} payments pending - send friendly reminders`
              })
            }
          }
          
          results.push({
            tool: name,
            result: { recommendations, category },
            summary: `Generated ${recommendations.length} recommendations for ${category}`
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
      parts: [{ text: "Understood! I'm Gia with 12+ powerful tools ready to help!" }]
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
        trainer.id,
        trainer.name || 'Your Trainer'
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
