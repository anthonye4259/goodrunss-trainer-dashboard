/**
 * AI Lead Matching Service
 * 
 * Uses Claude 3.5 Sonnet to intelligently match client leads with trainers
 * based on specialization, location, availability, budget, and preferences
 */

import Anthropic from '@anthropic-ai/sdk'
import type {
  ClientLeadInput,
  TrainerProfile,
  LeadMatchScore,
  LeadMatchResult,
} from '@/lib/types/lead-matching'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * Calculate distance score between two locations (0-100)
 * In a real app, you'd use actual geocoding/distance calculation
 */
function calculateLocationScore(
  leadLocation?: { city?: string; state?: string; zipCode?: string },
  trainerLocation?: { city: string; state: string; zipCode?: string }
): number {
  if (!leadLocation || !trainerLocation) return 50 // neutral score if location not specified

  // Exact city match
  if (leadLocation.city?.toLowerCase() === trainerLocation.city.toLowerCase() &&
      leadLocation.state?.toLowerCase() === trainerLocation.state.toLowerCase()) {
    return 100
  }

  // Same state
  if (leadLocation.state?.toLowerCase() === trainerLocation.state.toLowerCase()) {
    return 70
  }

  // Different state
  return 30
}

/**
 * Calculate availability score (0-100)
 */
function calculateAvailabilityScore(
  leadAvailability?: { daysOfWeek?: string[]; timeOfDay?: string[] },
  trainerAvailability?: { daysOfWeek: string[]; timeOfDay: string[] }
): number {
  if (!leadAvailability || !trainerAvailability) return 50

  let score = 0
  let factors = 0

  // Check day overlap
  if (leadAvailability.daysOfWeek && trainerAvailability.daysOfWeek) {
    const dayOverlap = leadAvailability.daysOfWeek.filter(day =>
      trainerAvailability.daysOfWeek.includes(day.toLowerCase())
    ).length

    const dayScore = (dayOverlap / Math.max(leadAvailability.daysOfWeek.length, 1)) * 100
    score += dayScore
    factors++
  }

  // Check time of day overlap
  if (leadAvailability.timeOfDay && trainerAvailability.timeOfDay) {
    const timeOverlap = leadAvailability.timeOfDay.filter(time =>
      trainerAvailability.timeOfDay.includes(time.toLowerCase())
    ).length

    const timeScore = (timeOverlap / Math.max(leadAvailability.timeOfDay.length, 1)) * 100
    score += timeScore
    factors++
  }

  return factors > 0 ? score / factors : 50
}

/**
 * Calculate budget score (0-100)
 */
function calculateBudgetScore(
  leadBudget?: { min?: number; max?: number },
  trainerPricing?: { sessionRate: number }
): number {
  if (!leadBudget || !trainerPricing) return 50

  const rate = trainerPricing.sessionRate

  // Perfect match: rate is within budget range
  if (leadBudget.min && leadBudget.max) {
    if (rate >= leadBudget.min && rate <= leadBudget.max) {
      return 100
    }

    // Slightly below min
    if (rate < leadBudget.min && rate >= leadBudget.min * 0.8) {
      return 80
    }

    // Slightly above max
    if (rate > leadBudget.max && rate <= leadBudget.max * 1.2) {
      return 70
    }

    // Way off
    return 20
  }

  // Only max specified
  if (leadBudget.max) {
    if (rate <= leadBudget.max) return 100
    if (rate <= leadBudget.max * 1.2) return 70
    return 30
  }

  return 50
}

/**
 * Calculate specialization score (0-100)
 */
function calculateSpecializationScore(
  leadGoals?: string[],
  leadSport?: string,
  trainerSpecializations?: string[],
  trainerSports?: string[]
): number {
  if (!trainerSpecializations && !trainerSports) return 50

  let score = 0
  let factors = 0

  // Match fitness goals
  if (leadGoals && trainerSpecializations) {
    const goalMatches = leadGoals.filter(goal =>
      trainerSpecializations.some(spec => spec.toLowerCase().includes(goal.toLowerCase()) || goal.toLowerCase().includes(spec.toLowerCase()))
    ).length

    score += (goalMatches / Math.max(leadGoals.length, 1)) * 100
    factors++
  }

  // Match sport
  if (leadSport && trainerSports) {
    const sportMatch = trainerSports.some(sport =>
      sport.toLowerCase().includes(leadSport.toLowerCase()) || leadSport.toLowerCase().includes(sport.toLowerCase())
    )

    score += sportMatch ? 100 : 0
    factors++
  }

  return factors > 0 ? score / factors : 50
}

/**
 * Calculate experience score (0-100)
 */
function calculateExperienceScore(
  minYearsRequired?: number,
  trainerYears?: number
): number {
  if (!minYearsRequired || !trainerYears) return 50

  if (trainerYears >= minYearsRequired) {
    // Extra points for exceeding requirement
    const excess = Math.min((trainerYears - minYearsRequired) / minYearsRequired, 1)
    return 100 + (excess * 20) // up to 120, capped at 100 later
  }

  // Penalty for not meeting requirement
  return (trainerYears / minYearsRequired) * 80
}

/**
 * Calculate preference score (0-100)
 */
function calculatePreferencesScore(
  leadPreferences?: {
    gender?: string
    language?: string[]
    certifications?: string[]
  },
  trainer?: {
    gender?: string
    languages: string[]
    certifications: string[]
  }
): number {
  if (!leadPreferences || !trainer) return 50

  let score = 0
  let factors = 0

  // Gender preference
  if (leadPreferences.gender && leadPreferences.gender !== 'no_preference') {
    score += trainer.gender === leadPreferences.gender ? 100 : 0
    factors++
  }

  // Language preference
  if (leadPreferences.language && leadPreferences.language.length > 0) {
    const languageMatch = leadPreferences.language.some(lang =>
      trainer.languages.includes(lang)
    )
    score += languageMatch ? 100 : 30
    factors++
  }

  // Certification preference
  if (leadPreferences.certifications && leadPreferences.certifications.length > 0) {
    const certMatches = leadPreferences.certifications.filter(cert =>
      trainer.certifications.some(trainerCert =>
        trainerCert.toLowerCase().includes(cert.toLowerCase())
      )
    ).length

    score += (certMatches / leadPreferences.certifications.length) * 100
    factors++
  }

  return factors > 0 ? score / factors : 50
}

/**
 * Generate human-readable match reasons using AI
 */
async function generateMatchReasons(
  lead: ClientLeadInput,
  trainer: TrainerProfile,
  scores: any
): Promise<{ reasons: string[]; concerns: string[] }> {
  try {
    const prompt = `
You are an expert matchmaker for fitness trainers and clients.

**Client Lead:**
- Goals: ${lead.fitnessGoals?.join(', ') || 'Not specified'}
- Sport: ${lead.preferredSport || 'Not specified'}
- Experience: ${lead.experienceLevel || 'Not specified'}
- Location: ${lead.location?.city || 'Not specified'}, ${lead.location?.state || 'Not specified'}
- Budget: $${lead.budgetRange?.min || '?'} - $${lead.budgetRange?.max || '?'}
- Availability: ${lead.availability?.daysOfWeek?.join(', ') || 'Not specified'}

**Trainer:**
- Name: ${trainer.name}
- Specializations: ${trainer.specializations.join(', ')}
- Sports: ${trainer.sports.join(', ')}
- Experience: ${trainer.yearsOfExperience} years
- Location: ${trainer.location.city}, ${trainer.location.state}
- Rate: $${trainer.pricing.sessionRate}/session
- Availability: ${trainer.availability.daysOfWeek.join(', ')}

**Match Scores:**
- Overall: ${scores.overall.toFixed(0)}%
- Specialization: ${scores.specialization.toFixed(0)}%
- Location: ${scores.location.toFixed(0)}%
- Availability: ${scores.availability.toFixed(0)}%
- Budget: ${scores.budget.toFixed(0)}%

Generate a JSON response with:
1. 3-5 **reasons** why this is a good match (be specific, use trainer's name)
2. 0-3 **concerns** if there are any potential issues

Return ONLY a JSON object:
{
  "reasons": ["Reason 1", "Reason 2", ...],
  "concerns": ["Concern 1", ...]
}
    `.trim()

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = response.content[0].type === 'text' ? response.content[0].text : '{}'
    
    // Parse JSON
    let jsonMatch = textContent.match(/```json\n([\s\S]*?)\n```/)
    let parsed: { reasons: string[]; concerns: string[] }

    if (jsonMatch && jsonMatch[1]) {
      parsed = JSON.parse(jsonMatch[1])
    } else {
      parsed = JSON.parse(textContent)
    }

    return parsed
  } catch (error) {
    console.error('Error generating match reasons:', error)
    return {
      reasons: ['Good overall match based on scores'],
      concerns: [],
    }
  }
}

/**
 * Main function: Match a client lead with trainers
 */
export async function matchLeadWithTrainers(
  lead: ClientLeadInput,
  trainers: TrainerProfile[]
): Promise<LeadMatchResult> {
  const startTime = Date.now()

  console.log(`🎯 Matching lead ${lead.name} with ${trainers.length} trainers...`)

  // Calculate scores for each trainer
  const matchScores: LeadMatchScore[] = []

  for (const trainer of trainers) {
    // Calculate individual scores
    const specializationScore = calculateSpecializationScore(
      lead.fitnessGoals,
      lead.preferredSport,
      trainer.specializations,
      trainer.sports
    )

    const locationScore = calculateLocationScore(lead.location, trainer.location)

    const availabilityScore = calculateAvailabilityScore(
      lead.availability,
      trainer.availability
    )

    const budgetScore = calculateBudgetScore(lead.budgetRange, trainer.pricing)

    const experienceScore = calculateExperienceScore(
      lead.trainerPreferences?.minYearsExperience,
      trainer.yearsOfExperience
    )

    const preferencesScore = calculatePreferencesScore(
      lead.trainerPreferences,
      trainer
    )

    // Weighted overall score
    const overallScore = Math.min(
      (specializationScore * 0.3 +
        locationScore * 0.25 +
        availabilityScore * 0.2 +
        budgetScore * 0.15 +
        experienceScore * 0.05 +
        preferencesScore * 0.05),
      100
    )

    // Generate AI reasons (only for top candidates to save API calls)
    const isTopCandidate = overallScore >= 60

    let reasons: string[] = []
    let concerns: string[] = []

    if (isTopCandidate) {
      const aiAnalysis = await generateMatchReasons(lead, trainer, {
        overall: overallScore,
        specialization: specializationScore,
        location: locationScore,
        availability: availabilityScore,
        budget: budgetScore,
      })
      reasons = aiAnalysis.reasons
      concerns = aiAnalysis.concerns
    }

    matchScores.push({
      trainerId: trainer.id,
      trainerName: trainer.name,
      overallScore,
      confidence: overallScore / 100,
      scores: {
        specialization: specializationScore,
        location: locationScore,
        availability: availabilityScore,
        budget: budgetScore,
        experience: experienceScore,
        preferences: preferencesScore,
      },
      matchReasons: reasons,
      potentialConcerns: concerns.length > 0 ? concerns : undefined,
      trainer,
    })
  }

  // Sort by overall score (descending) and take top 5
  matchScores.sort((a, b) => b.overallScore - a.overallScore)
  const topMatches = matchScores.slice(0, 5)

  // Generate AI summary
  const aiSummary = await generateOverallSummary(lead, topMatches)

  // Suggest action based on top match score
  let suggestedAction: 'auto_assign' | 'manual_review' | 'needs_more_info' = 'manual_review'
  
  if (topMatches.length > 0) {
    if (topMatches[0].overallScore >= 85) {
      suggestedAction = 'auto_assign'
    } else if (topMatches[0].overallScore < 50) {
      suggestedAction = 'needs_more_info'
    }
  }

  const endTime = Date.now()

  console.log(`✅ Matched in ${endTime - startTime}ms. Top match: ${topMatches[0]?.trainerName} (${topMatches[0]?.overallScore.toFixed(0)}%)`)

  return {
    leadId: '', // Will be set by API after creating lead in DB
    topMatches,
    aiSummary,
    suggestedAction,
    processingTime: endTime - startTime,
  }
}

/**
 * Generate overall summary of matching results
 */
async function generateOverallSummary(
  lead: ClientLeadInput,
  topMatches: LeadMatchScore[]
): Promise<string> {
  try {
    const prompt = `
You are an AI assistant for a fitness trainer marketplace.

**Client Lead:**
- Name: ${lead.name}
- Goals: ${lead.fitnessGoals?.join(', ') || 'Not specified'}
- Sport: ${lead.preferredSport || 'Not specified'}

**Top ${topMatches.length} Matches:**
${topMatches.map((m, i) => `${i + 1}. ${m.trainerName} - ${m.overallScore.toFixed(0)}% match`).join('\n')}

Provide a brief 1-2 sentence summary of the matching results and recommended next steps.
Be concise and actionable.
    `.trim()

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    })

    return response.content[0].type === 'text' ? response.content[0].text : 'Matches found.'
  } catch (error) {
    console.error('Error generating summary:', error)
    return `Found ${topMatches.length} potential matches for ${lead.name}.`
  }
}

