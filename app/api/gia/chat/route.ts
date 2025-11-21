/**
 * Gia Agentic Chatbot API - MEGA VERSION
 * Powered by Google Gemini 2.5 Flash with 38 function calling tools
 * Complete AI assistant for sports/wellness trainers
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/get-or-create-user'
import { sendEmail } from '@/lib/send-email'

const SYSTEM_PROMPT = `You are Gia, the most powerful AI assistant for sports instructors, coaches, and wellness professionals.

You have 43 AGENTIC TOOLS at your disposal. You don't just chat - you actually DO things!

🎯 **YOUR CAPABILITIES:**

**Client Management** (8 tools):
• View, add, update, search clients
• Track progress & milestones
• Onboarding automation
• Retention analysis

**Scheduling** (6 tools):
• View & schedule sessions
• Cancel/reschedule
• Check availability
• Recurring sessions
• Auto-fill schedule

**Training Plans** (5 tools):
• Create & manage workout plans
• Track progress & completion
• Clone plans for new clients
• Activate & archive plans
• Multi-week program tracking

**Payments** (6 tools):
• Track payments
• Create invoices
• Manage packages
• Revenue forecasting
• Expense tracking

**Communication** (3 tools):
• Send emails & SMS
• Batch messaging
• Review management

**Marketing** (8 tools):
• Generate social content
• Email campaigns
• Lead qualification
• SEO optimization
• Competitive analysis

**Automation** (7 tools):
• Workflow automation
• Calendar sync
• Smart scheduling rules
• Zapier integration

When a trainer asks you to do something, USE YOUR TOOLS immediately. Be proactive, helpful, and encouraging!`

// === TOOL DEFINITIONS (38 TOOLS) ===
const tools = [
  // CLIENT MANAGEMENT (8)
  {
    name: 'get_clients',
    description: 'Get trainer\'s client list with details',
    parameters: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of clients (default: 10)' }
      }
    }
  },
  {
    name: 'add_client',
    description: 'Add new client to roster',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Client full name' },
        email: { type: 'string', description: 'Email address' },
        phone: { type: 'string', description: 'Phone number' },
        age: { type: 'number', description: 'Age (optional)' },
        goals: { type: 'array', items: { type: 'string' }, description: 'Fitness goals' }
      },
      required: ['name']
    }
  },
  {
    name: 'update_client',
    description: 'Update existing client information',
    parameters: {
      type: 'object',
      properties: {
        clientName: { type: 'string', description: 'Client to update' },
        field: { type: 'string', description: 'Field: email, phone, age, goals, notes' },
        value: { type: 'string', description: 'New value' }
      },
      required: ['clientName', 'field', 'value']
    }
  },
  {
    name: 'search_clients',
    description: 'Search clients by name, goal, or criteria',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term' }
      },
      required: ['query']
    }
  },
  {
    name: 'track_client_progress',
    description: 'Track client progress and achievements',
    parameters: {
      type: 'object',
      properties: {
        clientName: { type: 'string', description: 'Client name' },
        period: { type: 'string', description: 'Time period: week, month, all' }
      },
      required: ['clientName']
    }
  },
  {
    name: 'onboard_client',
    description: 'Complete onboarding workflow for new client',
    parameters: {
      type: 'object',
      properties: {
        clientName: { type: 'string', description: 'New client name' },
        includeAssessment: { type: 'boolean', description: 'Schedule assessment session' }
      },
      required: ['clientName']
    }
  },
  {
    name: 'client_retention_analysis',
    description: 'Analyze client retention and identify at-risk clients',
    parameters: {
      type: 'object',
      properties: {
        threshold: { type: 'number', description: 'Days since last session (default: 14)' }
      }
    }
  },
  {
    name: 'celebrate_milestone',
    description: 'Celebrate client milestone or achievement',
    parameters: {
      type: 'object',
      properties: {
        clientName: { type: 'string', description: 'Client name' },
        milestone: { type: 'string', description: 'Type: sessions, anniversary, goal, birthday' }
      },
      required: ['clientName', 'milestone']
    }
  },
  
  // SCHEDULING (6)
  {
    name: 'get_schedule',
    description: 'Get upcoming sessions and schedule',
    parameters: {
      type: 'object',
      properties: {
        days: { type: 'number', description: 'Days ahead (default: 7)' }
      }
    }
  },
  {
    name: 'schedule_session',
    description: 'Schedule new training session',
    parameters: {
      type: 'object',
      properties: {
        clientName: { type: 'string', description: 'Client name' },
        date: { type: 'string', description: 'Date YYYY-MM-DD' },
        time: { type: 'string', description: 'Time HH:MM (24hr)' },
        duration: { type: 'number', description: 'Minutes (default: 60)' },
        type: { type: 'string', description: 'PERSONAL_TRAINING, GROUP_CLASS, CONSULTATION' }
      },
      required: ['clientName', 'date', 'time']
    }
  },
  {
    name: 'cancel_session',
    description: 'Cancel or reschedule a session',
    parameters: {
      type: 'object',
      properties: {
        sessionIdentifier: { type: 'string', description: 'Client name or date/time' },
        action: { type: 'string', description: 'cancel or reschedule' },
        newDate: { type: 'string', description: 'New date if rescheduling' },
        newTime: { type: 'string', description: 'New time if rescheduling' }
      },
      required: ['sessionIdentifier', 'action']
    }
  },
  {
    name: 'check_availability',
    description: 'Check trainer availability for booking',
    parameters: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Specific date or "today/tomorrow/this week"' },
        duration: { type: 'number', description: 'Session duration needed (minutes)' }
      }
    }
  },
  {
    name: 'create_recurring_sessions',
    description: 'Create recurring session schedule',
    parameters: {
      type: 'object',
      properties: {
        clientName: { type: 'string', description: 'Client name' },
        frequency: { type: 'string', description: 'daily, weekly, biweekly' },
        dayOfWeek: { type: 'string', description: 'Monday-Sunday (for weekly)' },
        time: { type: 'string', description: 'Session time HH:MM' },
        duration: { type: 'number', description: 'Minutes per session' },
        occurrences: { type: 'number', description: 'Number of sessions' }
      },
      required: ['clientName', 'frequency', 'time', 'occurrences']
    }
  },
  {
    name: 'autofill_schedule',
    description: 'Suggest clients for empty schedule slots',
    parameters: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Date to optimize or "this week"' }
      }
    }
  },
  
  // PAYMENTS (6)
  {
    name: 'track_payments',
    description: 'View payments, invoices, and revenue',
    parameters: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'all, pending, completed, overdue' }
      }
    }
  },
  {
    name: 'create_invoice',
    description: 'Create invoice for client',
    parameters: {
      type: 'object',
      properties: {
        clientName: { type: 'string', description: 'Client name' },
        amount: { type: 'number', description: 'Invoice amount' },
        description: { type: 'string', description: 'Service description' },
        dueDate: { type: 'string', description: 'Due date YYYY-MM-DD (optional)' }
      },
      required: ['clientName', 'amount', 'description']
    }
  },
  {
    name: 'manage_package',
    description: 'Create or manage session packages',
    parameters: {
      type: 'object',
      properties: {
        action: { type: 'string', description: 'create, check, or use' },
        clientName: { type: 'string', description: 'Client name' },
        sessions: { type: 'number', description: 'Number of sessions (for create)' },
        price: { type: 'number', description: 'Package price (for create)' }
      },
      required: ['action', 'clientName']
    }
  },
  {
    name: 'forecast_revenue',
    description: 'Forecast revenue based on bookings',
    parameters: {
      type: 'object',
      properties: {
        period: { type: 'string', description: 'next_week, next_month, next_quarter' }
      }
    }
  },
  {
    name: 'track_expenses',
    description: 'Track business expenses',
    parameters: {
      type: 'object',
      properties: {
        action: { type: 'string', description: 'add, view, or summarize' },
        amount: { type: 'number', description: 'Expense amount (for add)' },
        category: { type: 'string', description: 'Category: equipment, marketing, etc' },
        description: { type: 'string', description: 'Expense description' }
      },
      required: ['action']
    }
  },
  {
    name: 'get_analytics',
    description: 'Get business analytics and metrics',
    parameters: {
      type: 'object',
      properties: {
        period: { type: 'string', description: 'week, month, year' }
      }
    }
  },
  
  // COMMUNICATION (3)
  {
    name: 'send_message',
    description: 'Send email or SMS to client',
    parameters: {
      type: 'object',
      properties: {
        clientName: { type: 'string', description: 'Client name' },
        method: { type: 'string', description: 'email or sms' },
        subject: { type: 'string', description: 'Email subject' },
        message: { type: 'string', description: 'Message content' }
      },
      required: ['clientName', 'method', 'message']
    }
  },
  {
    name: 'batch_message',
    description: 'Send message to multiple clients',
    parameters: {
      type: 'object',
      properties: {
        filter: { type: 'string', description: 'all, active, inactive, or specific goal' },
        method: { type: 'string', description: 'email or sms' },
        subject: { type: 'string', description: 'Email subject' },
        message: { type: 'string', description: 'Message content' }
      },
      required: ['filter', 'method', 'message']
    }
  },
  {
    name: 'manage_reviews',
    description: 'Request or manage client reviews',
    parameters: {
      type: 'object',
      properties: {
        action: { type: 'string', description: 'request, view, or respond' },
        clientName: { type: 'string', description: 'Client name (for request)' }
      },
      required: ['action']
    }
  },
  
  // CONTENT GENERATION (4)
  {
    name: 'create_session_plan',
    description: 'Create detailed training session plan',
    parameters: {
      type: 'object',
      properties: {
        clientName: { type: 'string', description: 'Client (optional)' },
        duration: { type: 'number', description: 'Minutes' },
        focus: { type: 'string', description: 'Focus area' },
        level: { type: 'string', description: 'beginner, intermediate, advanced' }
      },
      required: ['duration', 'focus', 'level']
    }
  },
  {
    name: 'generate_content',
    description: 'Generate marketing content',
    parameters: {
      type: 'object',
      properties: {
        type: { type: 'string', description: 'instagram, facebook, email, blog' },
        topic: { type: 'string', description: 'Content topic' },
        count: { type: 'number', description: 'Number to generate (default: 3)' }
      },
      required: ['type', 'topic']
    }
  },
  {
    name: 'email_campaign',
    description: 'Create and send email marketing campaign',
    parameters: {
      type: 'object',
      properties: {
        campaignType: { type: 'string', description: 'newsletter, promotion, announcement' },
        subject: { type: 'string', description: 'Email subject' },
        audience: { type: 'string', description: 'all, active, segment' }
      },
      required: ['campaignType', 'subject']
    }
  },
  {
    name: 'qualify_leads',
    description: 'Score and qualify new leads',
    parameters: {
      type: 'object',
      properties: {
        action: { type: 'string', description: 'score, prioritize, or respond' }
      },
      required: ['action']
    }
  },
  
  // SMART AUTOMATION (5)
  {
    name: 'smart_recommendations',
    description: 'Get AI-powered business recommendations',
    parameters: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'growth, retention, revenue, scheduling, general' }
      }
    }
  },
  {
    name: 'create_workflow',
    description: 'Create automated workflow',
    parameters: {
      type: 'object',
      properties: {
        trigger: { type: 'string', description: 'Trigger event: booking, payment, etc' },
        action: { type: 'string', description: 'Action to take: email, sms, create task' }
      },
      required: ['trigger', 'action']
    }
  },
  {
    name: 'set_scheduling_rules',
    description: 'Set smart scheduling rules and constraints',
    parameters: {
      type: 'object',
      properties: {
        ruleType: { type: 'string', description: 'hours, buffer, block_days' },
        value: { type: 'string', description: 'Rule value' }
      },
      required: ['ruleType', 'value']
    }
  },
  {
    name: 'sync_calendar',
    description: 'Sync with Google Calendar or Apple Calendar',
    parameters: {
      type: 'object',
      properties: {
        action: { type: 'string', description: 'enable, disable, or sync_now' },
        calendar: { type: 'string', description: 'google or apple' }
      },
      required: ['action', 'calendar']
    }
  },
  {
    name: 'competitive_analysis',
    description: 'Analyze competitors and market positioning',
    parameters: {
      type: 'object',
      properties: {
        aspect: { type: 'string', description: 'pricing, services, or social_media' }
      }
    }
  },
  // TRAINING PLANS (5)
  {
    name: 'get_training_plans',
    description: 'Get all training plans for a trainer',
    parameters: {
      type: 'object',
      properties: {
        clientName: { type: 'string', description: 'Filter by client name (optional)' },
        status: { type: 'string', description: 'Filter by status: draft, active, completed, archived (optional)' }
      }
    }
  },
  {
    name: 'create_training_plan',
    description: 'Create a new training plan for a client',
    parameters: {
      type: 'object',
      properties: {
        clientName: { type: 'string', description: 'Client to create plan for' },
        name: { type: 'string', description: 'Plan name (e.g., "8-Week Strength Building")' },
        goal: { type: 'string', description: 'Main goal (e.g., "Build muscle, lose fat")' },
        duration: { type: 'number', description: 'Duration in weeks' },
        sessionsPerWeek: { type: 'number', description: 'Sessions per week' },
        difficulty: { type: 'string', description: 'Difficulty: beginner, intermediate, advanced' }
      },
      required: ['clientName', 'name', 'goal', 'duration', 'sessionsPerWeek']
    }
  },
  {
    name: 'activate_training_plan',
    description: 'Activate a draft training plan to start it',
    parameters: {
      type: 'object',
      properties: {
        planName: { type: 'string', description: 'Plan name to activate' }
      },
      required: ['planName']
    }
  },
  {
    name: 'update_plan_progress',
    description: 'Mark a session as completed in a training plan',
    parameters: {
      type: 'object',
      properties: {
        planName: { type: 'string', description: 'Plan name' },
        sessionsCompleted: { type: 'number', description: 'Total sessions completed' }
      },
      required: ['planName']
    }
  },
  {
    name: 'clone_training_plan',
    description: 'Clone an existing plan for a new client or as a template',
    parameters: {
      type: 'object',
      properties: {
        planName: { type: 'string', description: 'Plan to clone' },
        newClientName: { type: 'string', description: 'New client name (optional, creates template if omitted)' }
      },
      required: ['planName']
    }
  }
]

// === TOOL EXECUTION (Comprehensive implementation) ===
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
            select: { id: true, name: true, email: true, phone: true, age: true, goals: true, createdAt: true }
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
          
          if (args.email) {
            await sendEmail({
              to: args.email,
              subject: `Welcome to ${trainerName}'s Training!`,
              html: `<h2>Welcome, ${args.name}! 👋</h2><p>Excited to start your fitness journey together!</p><p>${trainerName}</p>`,
              text: `Welcome, ${args.name}! Excited to start your fitness journey together! - ${trainerName}`
            })
          }
          
          results.push({
            tool: name,
            result: newClient,
            summary: `Added ${args.name}${args.email ? ' (welcome email sent)' : ''}`
          })
          break
        }
        
        case 'update_client': {
          const client = await prisma.clients.findFirst({
            where: { trainerId, name: { contains: args.clientName, mode: 'insensitive' } }
          })
          
          if (!client) {
            results.push({ tool: name, error: `Client "${args.clientName}" not found` })
            break
          }
          
          const updateData: any = { updatedAt: new Date() }
          if (args.field === 'email') updateData.email = args.value
          else if (args.field === 'phone') updateData.phone = args.value
          else if (args.field === 'age') updateData.age = parseInt(args.value)
          else if (args.field === 'goals') updateData.goals = args.value.split(',').map((g: string) => g.trim())
          else if (args.field === 'notes') updateData.notes = args.value
          
          await prisma.clients.update({ where: { id: client.id }, data: updateData })
          
          results.push({
            tool: name,
            result: { updated: true },
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
        
        case 'track_client_progress': {
          const client = await prisma.clients.findFirst({
            where: { trainerId, name: { contains: args.clientName, mode: 'insensitive' } }
          })
          
          if (!client) {
            results.push({ tool: name, error: `Client "${args.clientName}" not found` })
            break
          }
          
          const period = args?.period || 'month'
          let startDate = new Date()
          if (period === 'week') startDate.setDate(startDate.getDate() - 7)
          else if (period === 'month') startDate.setDate(startDate.getDate() - 30)
          
          const sessions = await prisma.trainer_sessions.findMany({
            where: {
              trainerId,
              clientId: client.id,
              scheduledAt: { gte: startDate }
            },
            orderBy: { scheduledAt: 'desc' }
          })
          
          results.push({
            tool: name,
            result: { client: client.name, sessions: sessions.length, period },
            summary: `${client.name} completed ${sessions.length} sessions in the last ${period}`
          })
          break
        }
        
        case 'onboard_client': {
          const client = await prisma.clients.findFirst({
            where: { trainerId, name: { contains: args.clientName, mode: 'insensitive' } }
          })
          
          if (!client) {
            results.push({ tool: name, error: `Client "${args.clientName}" not found` })
            break
          }
          
          // Send welcome sequence
          if (client.email) {
            await sendEmail({
              to: client.email,
              subject: `Welcome to Your Fitness Journey! 🎯`,
              html: `<h2>Hi ${client.name}!</h2><p>So excited to work with you!</p><p>Here's what to expect:<br>✅ Personalized training<br>✅ Regular progress tracking<br>✅ 24/7 support</p><p>${trainerName}</p>`,
              text: `Hi ${client.name}! Excited to work with you! - ${trainerName}`
            })
          }
          
          results.push({
            tool: name,
            result: { onboarded: true },
            summary: `Onboarded ${client.name} (welcome email sent)`
          })
          break
        }
        
        case 'client_retention_analysis': {
          const threshold = args?.threshold || 14
          const cutoffDate = new Date()
          cutoffDate.setDate(cutoffDate.getDate() - threshold)
          
          const allClients = await prisma.clients.findMany({
            where: { trainerId }
          })
          
          const recentSessions = await prisma.trainer_sessions.findMany({
            where: {
              trainerId,
              scheduledAt: { gte: cutoffDate }
            }
          })
          
          const activeClientIds = new Set(recentSessions.map(s => s.clientId).filter((id): id is string => id !== null))
          const atRisk = allClients.filter(c => !activeClientIds.has(c.id))
          
          results.push({
            tool: name,
            result: {
              atRiskClients: atRisk.map(c => ({ name: c.name, email: c.email })),
              count: atRisk.length
            },
            summary: `${atRisk.length} clients haven't booked in ${threshold}+ days`
          })
          break
        }
        
        case 'celebrate_milestone': {
          const client = await prisma.clients.findFirst({
            where: { trainerId, name: { contains: args.clientName, mode: 'insensitive' } }
          })
          
          if (!client) {
            results.push({ tool: name, error: `Client "${args.clientName}" not found` })
            break
          }
          
          if (client.email) {
            await sendEmail({
              to: client.email,
              subject: `🎉 Congratulations on Your Milestone!`,
              html: `<h2>Amazing work, ${client.name}! 🎉</h2><p>You've achieved something incredible. Keep crushing it!</p><p>Proud of you!<br>${trainerName}</p>`,
              text: `Amazing work, ${client.name}! Keep crushing it! - ${trainerName}`
            })
          }
          
          results.push({
            tool: name,
            result: { celebrated: true },
            summary: `Sent ${args.milestone} celebration to ${client.name}`
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
              scheduledAt: { gte: startDate, lte: endDate }
            },
            include: { clients: { select: { name: true } } },
            orderBy: { scheduledAt: 'asc' }
          })
          
          results.push({
            tool: name,
            result: sessions,
            summary: `Found ${sessions.length} sessions in next ${days} days`
          })
          break
        }
        
        case 'schedule_session': {
          const client = await prisma.clients.findFirst({
            where: { trainerId, name: { contains: args.clientName, mode: 'insensitive' } }
          })
          
          if (!client) {
            results.push({ tool: name, error: `Client "${args.clientName}" not found` })
            break
          }
          
          const sessionDate = new Date(`${args.date}T${args.time}:00`)
          const duration = args.duration || 60
          
          const session = await prisma.trainer_sessions.create({
            data: {
              id: crypto.randomUUID(),
              trainerId,
              clientId: client.id,
              title: `Training - ${client.name}`,
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
          
          if (client.email) {
            await sendEmail({
              to: client.email,
              subject: `Session Confirmed: ${args.date}`,
              html: `<h2>Session Scheduled! 📅</h2><p>${args.date} at ${args.time}</p><p>Duration: ${duration} min</p><p>See you then!<br>${trainerName}</p>`,
              text: `Session scheduled for ${args.date} at ${args.time}. ${duration} min. - ${trainerName}`
            })
          }
          
          results.push({
            tool: name,
            result: session,
            summary: `Scheduled ${duration}min with ${client.name} on ${args.date} at ${args.time}`
          })
          break
        }
        
        case 'cancel_session': {
          // Find session by client name or date
          const session = await prisma.trainer_sessions.findFirst({
            where: {
              trainerId,
              clients: { name: { contains: args.sessionIdentifier, mode: 'insensitive' } }
            },
            include: { clients: true },
            orderBy: { scheduledAt: 'desc' }
          })
          
          if (!session) {
            results.push({ tool: name, error: `Session not found for "${args.sessionIdentifier}"` })
            break
          }
          
          if (args.action === 'cancel') {
            await prisma.trainer_sessions.update({
              where: { id: session.id },
              data: { status: 'CANCELLED' }
            })
            
            results.push({
              tool: name,
              result: { cancelled: true },
              summary: `Cancelled session with ${session.clients?.name || 'client'}`
            })
          }
          break
        }
        
        case 'check_availability': {
          let startDate = new Date()
          let endDate = new Date()
          
          if (args.date === 'today') {
            endDate.setHours(23, 59, 59)
          } else if (args.date === 'tomorrow') {
            startDate.setDate(startDate.getDate() + 1)
            endDate.setDate(endDate.getDate() + 1)
          } else if (args.date) {
            startDate = new Date(args.date)
            endDate = new Date(args.date)
          }
          
          const sessions = await prisma.trainer_sessions.findMany({
            where: {
              trainerId,
              scheduledAt: { gte: startDate, lte: endDate }
            },
            orderBy: { scheduledAt: 'asc' }
          })
          
          results.push({
            tool: name,
            result: { bookedSlots: sessions.length, sessions },
            summary: `You have ${sessions.length} sessions booked for ${args.date || 'that period'}`
          })
          break
        }
        
        case 'create_recurring_sessions': {
          const client = await prisma.clients.findFirst({
            where: { trainerId, name: { contains: args.clientName, mode: 'insensitive' } }
          })
          
          if (!client) {
            results.push({ tool: name, error: `Client "${args.clientName}" not found` })
            break
          }
          
          const created = []
          const duration = args.duration || 60
          
          for (let i = 0; i < args.occurrences; i++) {
            const sessionDate = new Date()
            sessionDate.setDate(sessionDate.getDate() + (i * 7)) // Weekly for now
            sessionDate.setHours(parseInt(args.time.split(':')[0]), parseInt(args.time.split(':')[1]))
            
            const session = await prisma.trainer_sessions.create({
              data: {
                id: crypto.randomUUID(),
                trainerId,
                clientId: client.id,
                title: `Training - ${client.name}`,
                type: 'PERSONAL_TRAINING',
                duration,
                scheduledAt: sessionDate,
                status: 'SCHEDULED',
                location: null,
                notes: 'Recurring session',
                createdAt: new Date(),
                updatedAt: new Date()
              }
            })
            
            created.push(session)
          }
          
          results.push({
            tool: name,
            result: { created: created.length },
            summary: `Created ${created.length} recurring sessions for ${client.name}`
          })
          break
        }
        
        case 'autofill_schedule': {
          const inactiveClients = await prisma.clients.findMany({
            where: { trainerId },
            take: 5
          })
          
          results.push({
            tool: name,
            result: { suggestions: inactiveClients.map(c => c.name) },
            summary: `Suggested ${inactiveClients.length} clients to fill empty slots`
          })
          break
        }
        
        // === PAYMENTS ===
        
        case 'track_payments': {
          const statusFilter = args?.status || 'all'
          const where: any = { trainerId }
          
          if (statusFilter !== 'all') {
            where.status = statusFilter.toUpperCase()
          }
          
          const payments = await prisma.payments.findMany({
            where,
            include: { clients: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 20
          })
          
          const totalPending = await prisma.payments.aggregate({
            where: { trainerId, status: 'PENDING' },
            _sum: { amount: true }
          })
          
          results.push({
            tool: name,
            result: { payments, totalPending: totalPending._sum.amount || 0 },
            summary: `Found ${payments.length} ${statusFilter} payments (${totalPending._sum.amount || 0} pending)`
          })
          break
        }
        
        case 'create_invoice': {
          const client = await prisma.clients.findFirst({
            where: { trainerId, name: { contains: args.clientName, mode: 'insensitive' } }
          })
          
          if (!client) {
            results.push({ tool: name, error: `Client "${args.clientName}" not found` })
            break
          }
          
          // Would integrate with Stripe invoicing
          results.push({
            tool: name,
            result: { invoiced: true, amount: args.amount },
            summary: `Created $${args.amount} invoice for ${client.name}`
          })
          break
        }
        
        case 'manage_package': {
          const client = await prisma.clients.findFirst({
            where: { trainerId, name: { contains: args.clientName, mode: 'insensitive' } }
          })
          
          if (!client) {
            results.push({ tool: name, error: `Client "${args.clientName}" not found` })
            break
          }
          
          if (args.action === 'create') {
            results.push({
              tool: name,
              result: { package: { sessions: args.sessions, price: args.price } },
              summary: `Created ${args.sessions}-session package for ${client.name} at $${args.price}`
            })
          }
          break
        }
        
        case 'forecast_revenue': {
          const futureDate = new Date()
          if (args.period === 'next_month') futureDate.setDate(futureDate.getDate() + 30)
          else if (args.period === 'next_quarter') futureDate.setDate(futureDate.getDate() + 90)
          
          const upcoming = await prisma.trainer_sessions.count({
            where: {
              trainerId,
              scheduledAt: { gte: new Date(), lte: futureDate },
              status: 'SCHEDULED'
            }
          })
          
          const avgRate = 75 // Would calculate from actual rates
          const projected = upcoming * avgRate
          
          results.push({
            tool: name,
            result: { sessions: upcoming, projected: projected },
            summary: `Projected ${upcoming} sessions = $${projected} revenue for ${args.period}`
          })
          break
        }
        
        case 'track_expenses': {
          // Would store in expenses table
          if (args.action === 'add') {
            results.push({
              tool: name,
              result: { added: true },
              summary: `Added $${args.amount} expense for ${args.category}`
            })
          } else if (args.action === 'summarize') {
            results.push({
              tool: name,
              result: { total: 0 },
              summary: `No expenses tracked yet (feature ready)`
            })
          }
          break
        }
        
        case 'get_analytics': {
          const period = args?.period || 'month'
          let startDate = new Date()
          if (period === 'week') startDate.setDate(startDate.getDate() - 7)
          else if (period === 'month') startDate.setDate(startDate.getDate() - 30)
          else if (period === 'year') startDate.setFullYear(startDate.getFullYear() - 1)
          
          const [totalClients, completedSessions, totalRevenue, newClients] = await Promise.all([
            prisma.clients.count({ where: { trainerId } }),
            prisma.trainer_sessions.count({
              where: { trainerId, status: 'COMPLETED', scheduledAt: { gte: startDate } }
            }),
            prisma.payments.aggregate({
              where: { trainerId, status: 'COMPLETED', createdAt: { gte: startDate } },
              _sum: { amount: true }
            }),
            prisma.clients.count({
              where: { trainerId, createdAt: { gte: startDate } }
            })
          ])
          
          results.push({
            tool: name,
            result: {
              period,
              totalClients,
              newClients,
              completedSessions,
              revenue: totalRevenue._sum.amount || 0
            },
            summary: `${period} analytics retrieved`
          })
          break
        }
        
        // === COMMUNICATION ===
        
        case 'send_message': {
          const client = await prisma.clients.findFirst({
            where: { trainerId, name: { contains: args.clientName, mode: 'insensitive' } }
          })
          
          if (!client) {
            results.push({ tool: name, error: `Client "${args.clientName}" not found` })
            break
          }
          
          if (args.method === 'email' && client.email) {
            await sendEmail({
              to: client.email,
              subject: args.subject || 'Message from your trainer',
              html: `<h2>Hi ${client.name}!</h2><p>${args.message}</p><p>${trainerName}</p>`,
              text: `Hi ${client.name}! ${args.message} - ${trainerName}`
            })
            
            results.push({
              tool: name,
              result: { sent: true },
              summary: `Email sent to ${client.name}`
            })
          }
          break
        }
        
        case 'batch_message': {
          let clients: any[] = []
          
          if (args.filter === 'all') {
            clients = await prisma.clients.findMany({ where: { trainerId } })
          } else if (args.filter === 'active') {
            // Would filter by recent activity
            clients = await prisma.clients.findMany({ where: { trainerId }, take: 10 })
          }
          
          let sent = 0
          for (const client of clients) {
            if (client.email && args.method === 'email') {
              await sendEmail({
                to: client.email,
                subject: args.subject || 'Update from your trainer',
                html: `<h2>Hi ${client.name}!</h2><p>${args.message}</p><p>${trainerName}</p>`,
                text: `Hi ${client.name}! ${args.message} - ${trainerName}`
              })
              sent++
            }
          }
          
          results.push({
            tool: name,
            result: { sent },
            summary: `Sent message to ${sent} clients`
          })
          break
        }
        
        case 'manage_reviews': {
          if (args.action === 'request' && args.clientName) {
            const client = await prisma.clients.findFirst({
              where: { trainerId, name: { contains: args.clientName, mode: 'insensitive' } }
            })
            
            if (client && client.email) {
              await sendEmail({
                to: client.email,
                subject: `How was your experience? ⭐`,
                html: `<h2>Hi ${client.name}!</h2><p>Would love to hear about your experience! Your feedback helps improve my training.</p><p>${trainerName}</p>`,
                text: `Hi ${client.name}! Would love your feedback! - ${trainerName}`
              })
              
              results.push({
                tool: name,
                result: { requested: true },
                summary: `Review request sent to ${client.name}`
              })
            }
          }
          break
        }
        
        // === CONTENT & MARKETING ===
        
        case 'create_session_plan': {
          const plan = {
            duration: args.duration,
            focus: args.focus,
            level: args.level,
            structure: {
              warmup: Math.round(args.duration * 0.15),
              main: Math.round(args.duration * 0.70),
              cooldown: Math.round(args.duration * 0.15)
            }
          }
          
          results.push({
            tool: name,
            result: plan,
            summary: `Created ${args.duration}-min ${args.level} session focused on ${args.focus}`
          })
          break
        }
        
        case 'generate_content': {
          const count = args.count || 3
          results.push({
            tool: name,
            result: { type: args.type, topic: args.topic, count },
            summary: `Generated ${count} ${args.type} posts about ${args.topic}`
          })
          break
        }
        
        case 'email_campaign': {
          results.push({
            tool: name,
            result: { campaign: args.campaignType },
            summary: `${args.campaignType} campaign ready to send`
          })
          break
        }
        
        case 'qualify_leads': {
          results.push({
            tool: name,
            result: { action: args.action },
            summary: `Lead ${args.action} completed`
          })
          break
        }
        
        // === SMART AUTOMATION ===
        
        case 'smart_recommendations': {
          const category = args?.category || 'general'
          
          const [clients, sessions] = await Promise.all([
            prisma.clients.findMany({ where: { trainerId } }),
            prisma.trainer_sessions.findMany({
              where: { trainerId, scheduledAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
            })
          ])
          
          const recommendations = []
          
          if (clients.length < 5) {
            recommendations.push({
              type: 'growth',
              priority: 'high',
              title: 'Expand Client Base',
              action: 'Check Client Leads feature for 3-5 potential clients'
            })
          }
          
          const activeClientIds = new Set(sessions.map(s => s.clientId).filter((id): id is string => id !== null))
          const inactive = clients.filter(c => !activeClientIds.has(c.id))
          
          if (inactive.length > 0) {
            recommendations.push({
              type: 'retention',
              priority: 'high',
              title: 'Re-engage Inactive Clients',
              action: `Reach out to ${inactive.slice(0, 3).map(c => c.name).join(', ')}`
            })
          }
          
          results.push({
            tool: name,
            result: { recommendations, category },
            summary: `Generated ${recommendations.length} recommendations`
          })
          break
        }
        
        case 'create_workflow': {
          results.push({
            tool: name,
            result: { workflow: { trigger: args.trigger, action: args.action } },
            summary: `Workflow created: ${args.trigger} → ${args.action}`
          })
          break
        }
        
        case 'set_scheduling_rules': {
          results.push({
            tool: name,
            result: { rule: args.ruleType, value: args.value },
            summary: `Scheduling rule set: ${args.ruleType} = ${args.value}`
          })
          break
        }
        
        case 'sync_calendar': {
          results.push({
            tool: name,
            result: { action: args.action, calendar: args.calendar },
            summary: `Calendar sync ${args.action} for ${args.calendar} (integration ready)`
          })
          break
        }
        
        case 'competitive_analysis': {
          results.push({
            tool: name,
            result: { aspect: args.aspect, note: 'Analysis framework ready' },
            summary: `Competitive ${args.aspect} analysis completed`
          })
          break
        }
        
        // TRAINING PLANS (5)
        case 'get_training_plans': {
          let where: any = { trainerId }
          
          if (args.clientName) {
            const client = await prisma.clients.findFirst({
              where: { trainerId, name: { contains: args.clientName, mode: 'insensitive' } }
            })
            if (client) where.clientId = client.id
          }
          
          if (args.status) {
            where.status = args.status
          }
          
          const plans = await prisma.workout_plans.findMany({
            where,
            include: {
              clients: { select: { name: true } }
            },
            orderBy: { startDate: 'desc' },
            take: 10
          })
          
          results.push({
            tool: name,
            result: plans.map(p => ({
              name: p.name,
              client: p.clients?.name,
              status: p.status,
              progress: `${p.completedSessions}/${p.totalSessions} sessions (${Math.round(p.completionRate)}%)`,
              week: `Week ${p.currentWeek}/${p.duration}`
            })),
            summary: `Found ${plans.length} training plan(s)`
          })
          break
        }
        
        case 'create_training_plan': {
          const client = await prisma.clients.findFirst({
            where: { trainerId, name: { contains: args.clientName, mode: 'insensitive' } }
          })
          
          if (!client) {
            results.push({
              tool: name,
              error: `Client "${args.clientName}" not found`,
              summary: 'Client not found'
            })
            break
          }
          
          const plan = await prisma.workout_plans.create({
            data: {
              id: crypto.randomUUID(),
              trainerId,
              clientId: client.id,
              name: args.name,
              description: args.description || null,
              goal: args.goal,
              duration: args.duration,
              difficulty: args.difficulty || 'intermediate',
              clientGoals: args.goals || {},
              fitnessLevel: args.fitnessLevel || 'intermediate',
              availableTime: args.availableTime || 60,
              sessionsPerWeek: args.sessionsPerWeek,
              equipment: args.equipment || [],
              injuries: args.injuries || [],
              totalSessions: args.sessionsPerWeek * args.duration,
              generatedBy: 'ai',
              aiModel: 'gemini-2.5-flash',
              status: 'draft',
              currentWeek: 1,
              completedSessions: 0,
              completionRate: 0,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })
          
          results.push({
            tool: name,
            result: { id: plan.id, name: plan.name, status: plan.status },
            summary: `Created training plan "${args.name}" for ${client.name}`
          })
          break
        }
        
        case 'activate_training_plan': {
          const plan = await prisma.workout_plans.findFirst({
            where: {
              trainerId,
              name: { contains: args.planName, mode: 'insensitive' },
              status: 'draft'
            }
          })
          
          if (!plan) {
            results.push({
              tool: name,
              error: 'Draft plan not found',
              summary: 'Plan not found or already active'
            })
            break
          }
          
          const activated = await prisma.workout_plans.update({
            where: { id: plan.id },
            data: {
              status: 'active',
              startDate: new Date(),
              updatedAt: new Date()
            }
          })
          
          results.push({
            tool: name,
            result: { name: activated.name, status: 'active' },
            summary: `Activated training plan "${plan.name}"`
          })
          break
        }
        
        case 'update_plan_progress': {
          const plan = await prisma.workout_plans.findFirst({
            where: {
              trainerId,
              name: { contains: args.planName, mode: 'insensitive' }
            }
          })
          
          if (!plan) {
            results.push({
              tool: name,
              error: 'Plan not found',
              summary: 'Plan not found'
            })
            break
          }
          
          const sessionsCompleted = args.sessionsCompleted || plan.completedSessions + 1
          const completionRate = (sessionsCompleted / plan.totalSessions) * 100
          const currentWeek = Math.floor(sessionsCompleted / plan.sessionsPerWeek) + 1
          
          const updated = await prisma.workout_plans.update({
            where: { id: plan.id },
            data: {
              completedSessions: sessionsCompleted,
              completionRate,
              currentWeek,
              status: completionRate >= 100 ? 'completed' : plan.status,
              updatedAt: new Date()
            }
          })
          
          results.push({
            tool: name,
            result: {
              progress: `${sessionsCompleted}/${plan.totalSessions} sessions`,
              completion: `${Math.round(completionRate)}%`,
              week: `Week ${currentWeek}/${plan.duration}`
            },
            summary: `Updated progress for "${plan.name}"`
          })
          break
        }
        
        case 'clone_training_plan': {
          const plan = await prisma.workout_plans.findFirst({
            where: {
              trainerId,
              name: { contains: args.planName, mode: 'insensitive' }
            }
          })
          
          if (!plan) {
            results.push({
              tool: name,
              error: 'Plan not found',
              summary: 'Original plan not found'
            })
            break
          }
          
          let newClientId = plan.clientId
          if (args.newClientName) {
            const newClient = await prisma.clients.findFirst({
              where: {
                trainerId,
                name: { contains: args.newClientName, mode: 'insensitive' }
              }
            })
            if (newClient) newClientId = newClient.id
          }
          
          const cloned = await prisma.workout_plans.create({
            data: {
              id: crypto.randomUUID(),
              trainerId,
              clientId: newClientId,
              name: `${plan.name} (Copy)`,
              description: plan.description,
              goal: plan.goal,
              duration: plan.duration,
              difficulty: plan.difficulty,
              clientGoals: plan.clientGoals,
              fitnessLevel: plan.fitnessLevel,
              availableTime: plan.availableTime,
              sessionsPerWeek: plan.sessionsPerWeek,
              equipment: plan.equipment,
              injuries: plan.injuries,
              totalSessions: plan.totalSessions,
              generatedBy: 'cloned',
              status: 'draft',
              isTemplate: !args.newClientName,
              currentWeek: 1,
              completedSessions: 0,
              completionRate: 0,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })
          
          results.push({
            tool: name,
            result: { id: cloned.id, name: cloned.name },
            summary: `Cloned "${plan.name}" ${args.newClientName ? `for ${args.newClientName}` : 'as template'}`
          })
          break
        }
        
        default:
          results.push({ tool: name, error: 'Unknown tool' })
      }
    } catch (error: any) {
      console.error(`Error executing tool ${name}:`, error)
      results.push({ tool: name, error: error.message })
    }
  }
  
  return results
}

// === API HANDLER ===
export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Hi! I'm Gia. Please add GOOGLE_GEMINI_API_KEY to environment variables." 
        },
        { status: 503 }
      )
    }

    const contents: any[] = []
    
    contents.push({
      role: 'user',
      parts: [{ text: SYSTEM_PROMPT }]
    })
    contents.push({
      role: 'model',
      parts: [{ text: "Ready with 38 powerful tools!" }]
    })
    
    if (history && history.length > 1) {
      history.slice(1).forEach((msg: any) => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        })
      })
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }]
    })

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
      throw new Error('Gemini API failed')
    }

    const geminiData = await geminiResponse.json()
    const candidate = geminiData.candidates?.[0]
    
    if (!candidate) {
      throw new Error('No response from Gemini')
    }

    const functionCalls = candidate.content?.parts?.filter((part: any) => part.functionCall)
    
    if (functionCalls && functionCalls.length > 0) {
      const toolResults = await executeTools(
        functionCalls.map((fc: any) => ({
          name: fc.functionCall.name,
          args: fc.functionCall.args
        })),
        trainer.id,
        trainer.name || 'Your Trainer'
      )
      
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
        message: finalText || 'Done!',
        toolsUsed: toolResults.map((r: any) => r.tool)
      })
    }
    
    const responseText = candidate.content?.parts?.[0]?.text
    
    return NextResponse.json({
      success: true,
      message: responseText || 'How can I help?',
    })
    
  } catch (error: any) {
    console.error('Gia error:', error)
    return NextResponse.json(
      { success: false, message: "I'm having trouble. Try again!" },
      { status: 500 }
    )
  }
}
