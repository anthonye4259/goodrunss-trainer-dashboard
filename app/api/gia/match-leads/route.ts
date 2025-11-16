/**
 * API Route: Match Client Leads
 * POST /api/gia/match-leads
 * 
 * Accepts incoming client leads and uses AI to match them with the best trainers
 * based on specialization, location, availability, budget, and preferences
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { matchLeadWithTrainers } from '@/lib/services/lead-matcher'
import type {
  ClientLeadInput,
  TrainerProfile,
  SubmitLeadResponse,
  GetLeadsResponse,
  GetMatchesResponse,
} from '@/lib/types/lead-matching'

const prisma = new PrismaClient()

/**
 * POST: Submit a new client lead and get AI-matched trainers
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body: ClientLeadInput = await request.json()

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, email' },
        { status: 400 }
      )
    }

    console.log(`📥 New lead: ${body.name} (${body.email})`)

    // 1. Get all active trainers from the database
    // TODO: Replace with actual trainer fetching logic
    // For now, we'll create mock trainers (in production, fetch from your trainers table)
    const trainers: TrainerProfile[] = await fetchAvailableTrainers()

    if (trainers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No trainers available at this time' },
        { status: 404 }
      )
    }

    // 2. Use AI to match lead with trainers
    const matchResult = await matchLeadWithTrainers(body, trainers)

    // 3. Save lead to database
    const clientLead = await prisma.clientLead.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        city: body.location?.city,
        state: body.location?.state,
        zipCode: body.location?.zipCode,
        country: body.location?.country,
        fitnessGoals: body.fitnessGoals as any,
        experienceLevel: body.experienceLevel,
        preferredSport: body.preferredSport,
        availableDays: body.availability?.daysOfWeek as any,
        availableTimes: body.availability?.timeOfDay as any,
        sessionsPerWeek: body.availability?.sessionsPerWeek,
        preferredGender: body.trainerPreferences?.gender,
        preferredLanguages: body.trainerPreferences?.language as any,
        preferredCertifications: body.trainerPreferences?.certifications as any,
        minYearsExperience: body.trainerPreferences?.minYearsExperience,
        budgetMin: body.budgetRange?.min,
        budgetMax: body.budgetRange?.max,
        budgetCurrency: body.budgetRange?.currency,
        additionalNotes: body.additionalNotes,
        howDidYouHear: body.howDidYouHear,
        source: body.source,
        referredBy: body.referredBy,
        status: 'new',
        aiProcessed: true,
        aiProcessedAt: new Date(),
        aiModel: 'claude-3-5-sonnet',
        aiSummary: matchResult.aiSummary,
      },
    })

    // Update matchResult with the created lead ID
    matchResult.leadId = clientLead.id

    // 4. Save top 5 matches to database
    for (const match of matchResult.topMatches) {
      await prisma.leadMatch.create({
        data: {
          clientLeadId: clientLead.id,
          trainerId: match.trainerId,
          overallScore: match.overallScore,
          specializationScore: match.scores.specialization,
          locationScore: match.scores.location,
          availabilityScore: match.scores.availability,
          budgetScore: match.scores.budget,
          experienceScore: match.scores.experience,
          preferencesScore: match.scores.preferences,
          matchReasons: match.matchReasons as any,
          potentialConcerns: match.potentialConcerns as any,
          confidence: match.confidence,
          status: 'suggested',
        },
      })
    }

    const totalTime = Date.now() - startTime

    console.log(`✅ Lead matched and saved in ${totalTime}ms`)
    console.log(`   Top match: ${matchResult.topMatches[0]?.trainerName} (${matchResult.topMatches[0]?.overallScore.toFixed(0)}%)`)

    const response: SubmitLeadResponse = {
      success: true,
      data: {
        lead: clientLead as any,
        matchResult,
      },
      processingTime: totalTime,
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'X-Processing-Time': `${totalTime}ms`,
      },
    })
  } catch (error) {
    console.error('❌ Error in match-leads API:', error)

    const errorMessage = error instanceof Error ? error.message : 'Failed to process lead'

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        processingTime: Date.now() - startTime,
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * GET: Retrieve leads and their matches
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')
    const trainerId = searchParams.get('trainerId')
    const status = searchParams.get('status')

    if (leadId) {
      // Get specific lead and its matches
      const lead = await prisma.clientLead.findUnique({
        where: { id: leadId },
      })

      if (!lead) {
        return NextResponse.json(
          { success: false, error: 'Lead not found' },
          { status: 404 }
        )
      }

      const matches = await prisma.leadMatch.findMany({
        where: { clientLeadId: leadId },
        orderBy: { overallScore: 'desc' },
      })

      const response: GetMatchesResponse = {
        success: true,
        data: {
          matches: matches.map(m => ({
            ...m,
            lead,
            matchReasons: m.matchReasons as string[],
            potentialConcerns: m.potentialConcerns as string[] | undefined,
          })),
          total: matches.length,
        },
      }

      return NextResponse.json(response)
    } else if (trainerId) {
      // Get all matches for a specific trainer
      const matches = await prisma.leadMatch.findMany({
        where: {
          trainerId,
          ...(status && { status }),
        },
        include: {
          lead: true,
        },
        orderBy: { overallScore: 'desc' },
        take: 50,
      })

      const response: GetMatchesResponse = {
        success: true,
        data: {
          matches: matches.map(m => ({
            ...m,
            lead: m.lead as any,
            matchReasons: m.matchReasons as string[],
            potentialConcerns: m.potentialConcerns as string[] | undefined,
          })),
          total: matches.length,
        },
      }

      return NextResponse.json(response)
    } else {
      // Get all recent leads
      const leads = await prisma.clientLead.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      })

      const response: GetLeadsResponse = {
        success: true,
        data: {
          leads: leads.map(l => ({
            ...l,
            fitnessGoals: l.fitnessGoals as string[],
            availableDays: l.availableDays as string[],
            availableTimes: l.availableTimes as string[],
            preferredLanguages: l.preferredLanguages as string[],
            preferredCertifications: l.preferredCertifications as string[],
          })),
          total: leads.length,
        },
      }

      return NextResponse.json(response)
    }
  } catch (error) {
    console.error('Error fetching leads/matches:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * PUT: Trainer responds to a lead match
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { leadMatchId, trainerId, action, message } = body

    if (!leadMatchId || !trainerId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: leadMatchId, trainerId, action' },
        { status: 400 }
      )
    }

    // Find the match
    const match = await prisma.leadMatch.findUnique({
      where: { id: leadMatchId },
    })

    if (!match || match.trainerId !== trainerId) {
      return NextResponse.json(
        { success: false, error: 'Match not found or unauthorized' },
        { status: 404 }
      )
    }

    // Update the match
    const updatedMatch = await prisma.leadMatch.update({
      where: { id: leadMatchId },
      data: {
        status: action === 'accept' ? 'accepted' : 'declined',
        respondedAt: new Date(),
        trainerResponse: message,
      },
    })

    // If accepted, update lead status
    if (action === 'accept') {
      await prisma.clientLead.update({
        where: { id: match.clientLeadId },
        data: { status: 'matched' },
      })
    }

    console.log(`✅ Trainer ${trainerId} ${action}ed lead match ${leadMatchId}`)

    return NextResponse.json({
      success: true,
      data: { match: updatedMatch },
    })
  } catch (error) {
    console.error('Error responding to lead:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to respond to lead' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Helper: Fetch available trainers
 * TODO: Replace with actual trainer fetching from your database
 */
async function fetchAvailableTrainers(): Promise<TrainerProfile[]> {
  // In production, fetch from your trainers/users table
  // For now, return mock data
  
  // Example: const trainers = await prisma.user.findMany({ where: { role: 'trainer', isActive: true } })
  
  return [
    {
      id: 'trainer-1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      location: {
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
      },
      specializations: ['weight_loss', 'strength_training', 'cardio'],
      sports: ['running', 'cycling'],
      certifications: ['NASM-CPT', 'Precision Nutrition'],
      yearsOfExperience: 8,
      availability: {
        daysOfWeek: ['monday', 'wednesday', 'friday'],
        timeOfDay: ['morning', 'afternoon'],
      },
      pricing: {
        sessionRate: 80,
        currency: 'USD',
      },
      gender: 'female',
      languages: ['English', 'Spanish'],
    },
    {
      id: 'trainer-2',
      name: 'Mike Chen',
      email: 'mike@example.com',
      location: {
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
      },
      specializations: ['sports_performance', 'strength_training', 'athletic_training'],
      sports: ['basketball', 'tennis'],
      certifications: ['NSCA-CSCS', 'USA Weightlifting'],
      yearsOfExperience: 12,
      availability: {
        daysOfWeek: ['tuesday', 'thursday', 'saturday'],
        timeOfDay: ['afternoon', 'evening'],
      },
      pricing: {
        sessionRate: 100,
        currency: 'USD',
      },
      gender: 'male',
      languages: ['English', 'Mandarin'],
    },
    {
      id: 'trainer-3',
      name: 'Emily Rodriguez',
      email: 'emily@example.com',
      location: {
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
      },
      specializations: ['rehabilitation', 'flexibility', 'injury_prevention'],
      sports: ['yoga', 'pilates'],
      certifications: ['ACE-CPT', 'RYT-200', 'Certified Pilates Instructor'],
      yearsOfExperience: 6,
      availability: {
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timeOfDay: ['morning', 'afternoon'],
      },
      pricing: {
        sessionRate: 70,
        currency: 'USD',
      },
      gender: 'female',
      languages: ['English', 'Spanish'],
    },
  ]
}

