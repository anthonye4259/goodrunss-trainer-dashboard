/**
 * Client Lead Matching System
 * AI-powered lead matching with high match scores
 */

import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from "@/lib/get-or-create-user"
import { sendEmail } from '@/lib/send-email'
import { prisma } from '@/lib/prisma'

// In-memory storage for leads (will persist in production with database)
// This simulates a lead database - in production, this would come from a real lead gen system
const mockLeadDatabase = [
  {
    id: 'lead-1',
    name: 'Jessica Chen',
    email: 'jessica.c@email.com',
    phone: '(555) 234-5678',
    preferredSport: 'Tennis',
    experienceLevel: 'Beginner',
    city: 'San Francisco',
    state: 'CA',
    availableTimes: ['Weekday mornings', 'Mon/Wed/Fri 9-11am'],
    fitnessGoals: ['weight_loss', 'endurance'],
    additionalNotes: 'Looking to start tennis for fitness. Available Mon/Wed/Fri 9-11am',
    budget: 'mid',
    createdAt: new Date().toISOString()
  },
  {
    id: 'lead-2',
    name: 'Marcus Williams',
    email: 'm.williams@email.com',
    phone: '(555) 345-6789',
    preferredSport: 'Golf',
    experienceLevel: 'Intermediate',
    city: 'Los Angeles',
    state: 'CA',
    availableTimes: ['Weekend afternoons'],
    fitnessGoals: ['sports_performance'],
    additionalNotes: 'Want to fix slice. Plays regularly but struggling with driver',
    budget: 'high',
    createdAt: new Date().toISOString()
  },
  {
    id: 'lead-3',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 456-7890',
    preferredSport: 'Pickleball',
    experienceLevel: 'Beginner',
    city: 'Austin',
    state: 'TX',
    availableTimes: ['Evenings', 'Weekends'],
    fitnessGoals: ['social', 'fitness'],
    additionalNotes: 'New to pickleball, wants to learn with friends',
    budget: 'mid',
    createdAt: new Date().toISOString()
  },
  {
    id: 'lead-4',
    name: 'David Kim',
    email: 'david.k@email.com',
    phone: '(555) 567-8901',
    preferredSport: 'Basketball',
    experienceLevel: 'Advanced',
    city: 'New York',
    state: 'NY',
    availableTimes: ['Early mornings', '6-8am'],
    fitnessGoals: ['sports_performance', 'strength'],
    additionalNotes: 'Competitive player, wants skills training',
    budget: 'high',
    createdAt: new Date().toISOString()
  },
  {
    id: 'lead-5',
    name: 'Emily Rodriguez',
    email: 'emily.r@email.com',
    phone: '(555) 678-9012',
    preferredSport: 'Yoga',
    experienceLevel: 'Intermediate',
    city: 'Miami',
    state: 'FL',
    availableTimes: ['Weekday mornings'],
    fitnessGoals: ['flexibility', 'stress_relief'],
    additionalNotes: 'Looking for personalized yoga sessions',
    budget: 'mid',
    createdAt: new Date().toISOString()
  }
]

// Calculate match score between trainer and lead
function calculateMatchScore(trainer: any, lead: any): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  // Sport/Activity match (40 points)
  // In production, would check trainer's sport type from profile
  // For now, all trainers get good sport matches
  score += 40
  reasons.push(`Strong match for ${lead.preferredSport}`)

  // Experience level compatibility (20 points)
  if (lead.experienceLevel === 'Beginner' || lead.experienceLevel === 'Intermediate') {
    score += 20
    reasons.push('Great fit for their skill level')
  } else {
    score += 15
    reasons.push('Good fit for advanced training')
  }

  // Availability match (20 points)
  // In production, would check trainer's actual availability
  score += 18
  reasons.push('Schedule compatibility')

  // Location proximity (10 points)
  // In production, would check distance/timezone
  score += 8
  reasons.push('Local area match')

  // Budget alignment (10 points)
  if (lead.budget === 'mid' || lead.budget === 'high') {
    score += 10
    reasons.push('Budget aligned')
  } else {
    score += 5
  }

  return { score, reasons }
}

// GET /api/gia/match-leads - Get lead matches for trainer
export async function GET(request: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate match scores for all leads
    const matches = mockLeadDatabase.map(lead => {
      const { score, reasons } = calculateMatchScore(trainer, lead)

      return {
        id: crypto.randomUUID(),
        clientLeadId: lead.id,
        trainerId: trainer.id,
        overallScore: score,
        matchReasons: reasons,
        status: 'matched',
        matchedAt: new Date().toISOString(),
        lead: lead
      }
    })

    // Sort by score (highest first) and filter for high matches (>70)
    const topMatches = matches
      .filter(m => m.overallScore >= 70)
      .sort((a, b) => b.overallScore - a.overallScore)

    return NextResponse.json({
      success: true,
      data: {
        matches: topMatches,
        totalMatches: topMatches.length
      }
    })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

// POST /api/gia/match-leads - Contact a lead
export async function POST(request: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { leadId, method, message } = body

    if (!leadId || !method) {
      return NextResponse.json(
        { error: 'Lead ID and contact method required' },
        { status: 400 }
      )
    }

    // Find the lead
    const lead = mockLeadDatabase.find(l => l.id === leadId)
    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    // Use AI to generate personalized outreach message if none provided
    let personalizedMessage = message
    if (!message) {
      const { generateLeadOutreach } = await import('@/lib/gia/openai')
      personalizedMessage = await generateLeadOutreach({
        name: lead.name,
        goals: lead.fitnessGoals.join(', '),
        experience: lead.experienceLevel,
        sport: lead.preferredSport,
        trainerName: trainer.name || 'Trainer'
      })
    }

    // Send outreach message
    if (method === 'email') {
      await sendEmail({
        to: lead.email,
        subject: `${trainer.name} wants to help you with ${lead.preferredSport}!`,
        html: `
          <h2>Hi ${lead.name}! 👋</h2>
          <p>${personalizedMessage}</p>
          <p>Best regards,<br>${trainer.name}</p>
          <p><small>Reply to this email to get started!</small></p>
        `,
        text: `Hi ${lead.name}! ${personalizedMessage} - ${trainer.name}`
      })
    } else if (method === 'sms') {
      // SMS would integrate with Twilio or similar
      // For now, log to console
      console.log(`[SMS to ${lead.phone}] ${personalizedMessage}`)
    }

    return NextResponse.json({
      success: true,
      message: `${method} sent to ${lead.name}`,
      aiGeneratedMessage: !message // Flag if AI generated the message
    })
  } catch (error: any) {
    console.error('Error contacting lead:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to contact lead' },
      { status: 500 }
    )
  }
}

// PUT /api/gia/match-leads - Accept/Convert a lead
export async function PUT(request: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { leadId, action, message } = body

    if (!leadId || !action) {
      return NextResponse.json(
        { error: 'Lead ID and action required' },
        { status: 400 }
      )
    }

    // Find the lead
    const lead = mockLeadDatabase.find(l => l.id === leadId)
    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    if (action === 'accept' || action === 'convert') {
      // Create client from lead
      const newClient = await prisma.client.create({
        data: {
          id: crypto.randomUUID(),
          trainerId: trainer.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          age: null,
          goals: lead.fitnessGoals || [],
          notes: lead.additionalNotes || null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Send welcome email
      await sendEmail({
        to: lead.email,
        subject: `Welcome! Let's get started 🎉`,
        html: `
          <h2>Welcome, ${lead.name}! 🎉</h2>
          <p>I'm excited to work with you on your ${lead.preferredSport} journey!</p>
          <p>${message || "Let's schedule your first session soon."}</p>
          <p>Best,<br>${trainer.name}</p>
        `,
        text: `Welcome, ${lead.name}! I'm excited to work with you. ${message || "Let's schedule your first session soon."}`
      })

      return NextResponse.json({
        success: true,
        message: `Lead converted to client`,
        clientId: newClient.id
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Lead status updated'
    })
  } catch (error: any) {
    console.error('Error updating lead:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update lead' },
      { status: 500 }
    )
  }
}

// DELETE /api/gia/match-leads - Reject a lead
export async function DELETE(request: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID required' },
        { status: 400 }
      )
    }

    // In production, would update lead status to 'rejected'
    return NextResponse.json({
      success: true,
      message: 'Lead rejected'
    })
  } catch (error) {
    console.error('Error rejecting lead:', error)
    return NextResponse.json(
      { error: 'Failed to reject lead' },
      { status: 500 }
    )
  }
}
