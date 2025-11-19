/**
 * TypeScript Types for Client Lead Matching System (Feature 5)
 * 
 * AI-powered system to match incoming client leads with the best trainer
 * based on specialization, location, availability, and client needs
 */

// ===========================
// LEAD INPUT TYPES
// ===========================

export interface ClientLeadInput {
  // Basic info
  name: string
  email: string
  phone?: string
  
  // Location
  location?: {
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  
  // Fitness details
  fitnessGoals?: string[] // e.g., ["weight_loss", "strength_training", "marathon_prep"]
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced'
  preferredSport?: string // e.g., "tennis", "basketball", "pilates"
  
  // Schedule
  availability?: {
    daysOfWeek?: string[] // ["monday", "wednesday", "friday"]
    timeOfDay?: string[] // ["morning", "afternoon", "evening"]
    sessionsPerWeek?: number
  }
  
  // Preferences
  trainerPreferences?: {
    gender?: 'male' | 'female' | 'no_preference'
    language?: string[]
    certifications?: string[]
    minYearsExperience?: number
  }
  
  // Budget
  budgetRange?: {
    min?: number
    max?: number
    currency?: string
  }
  
  // Additional context
  additionalNotes?: string
  howDidYouHear?: string
  
  // Source tracking
  source?: 'website' | 'referral' | 'social_media' | 'google' | 'other'
  referredBy?: string
}

// ===========================
// TRAINER PROFILE TYPES
// ===========================

export interface TrainerProfile {
  id: string
  name: string
  email: string
  phone?: string
  
  // Location
  location: {
    city: string
    state: string
    zipCode?: string
    country: string
  }
  
  // Specializations
  specializations: string[] // e.g., ["weight_loss", "strength_training", "sports_performance"]
  sports: string[] // e.g., ["tennis", "basketball", "swimming"]
  
  // Certifications & Experience
  certifications: string[]
  yearsOfExperience: number
  
  // Availability
  availability: {
    daysOfWeek: string[]
    timeOfDay: string[]
    currentClientCount?: number
    maxClientCapacity?: number
  }
  
  // Pricing
  pricing: {
    sessionRate: number
    packageRates?: {
      sessions: number
      price: number
    }[]
    currency: string
  }
  
  // Demographics
  gender?: 'male' | 'female' | 'other'
  languages: string[]
  
  // Performance metrics
  metrics?: {
    averageRating?: number
    totalClients?: number
    responseRate?: number // 0-1
    conversionRate?: number // 0-1
  }
  
  // Bio
  bio?: string
  profileImageUrl?: string
}

// ===========================
// AI MATCHING TYPES
// ===========================

export interface LeadMatchScore {
  trainerId: string
  trainerName: string
  
  // Overall match
  overallScore: number // 0-100
  confidence: number // 0-1
  
  // Breakdown scores
  scores: {
    specialization: number // 0-100
    location: number // 0-100
    availability: number // 0-100
    budget: number // 0-100
    experience: number // 0-100
    preferences: number // 0-100
  }
  
  // AI reasoning
  matchReasons: string[] // ["Specialized in weight loss", "Available Monday/Wednesday", ...]
  potentialConcerns?: string[] // ["Budget might be slightly high", ...]
  
  // Trainer details
  trainer: TrainerProfile
}

export interface LeadMatchResult {
  leadId: string
  topMatches: LeadMatchScore[] // Sorted by overallScore, top 5
  aiSummary: string // Overall analysis of the lead and matching strategy
  suggestedAction: 'auto_assign' | 'manual_review' | 'needs_more_info'
  processingTime: number // milliseconds
}

// ===========================
// DATABASE OUTPUT TYPES
// ===========================

export interface ClientLead {
  id: string
  
  // Basic info
  name: string
  email: string
  phone?: string
  
  // Location
  city?: string
  state?: string
  zipCode?: string
  country?: string
  
  // Fitness details
  fitnessGoals?: string[]
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced'
  preferredSport?: string
  
  // Schedule
  availableDays?: string[]
  availableTimes?: string[]
  sessionsPerWeek?: number
  
  // Preferences
  preferredGender?: string
  preferredLanguages?: string[]
  preferredCertifications?: string[]
  minYearsExperience?: number
  
  // Budget
  budgetMin?: number
  budgetMax?: number
  budgetCurrency?: string
  
  // Additional
  additionalNotes?: string
  howDidYouHear?: string
  source?: string
  referredBy?: string
  
  // Status
  status: 'new' | 'matched' | 'contacted' | 'converted' | 'lost'
  
  // AI processing
  aiProcessed: boolean
  aiProcessedAt?: Date
  aiModel?: string
  aiSummary?: string
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

export interface LeadMatch {
  id: string
  clientLeadId: string
  trainerId: string
  
  // Match scores
  overallScore: number
  specializationScore: number
  locationScore: number
  availabilityScore: number
  budgetScore: number
  experienceScore: number
  preferencesScore: number
  
  // AI analysis
  matchReasons: string[]
  potentialConcerns?: string[]
  confidence: number
  
  // Status
  status: 'suggested' | 'sent_to_trainer' | 'accepted' | 'declined' | 'expired'
  
  // Actions
  sentAt?: Date
  respondedAt?: Date
  trainerResponse?: string
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

// ===========================
// API RESPONSE TYPES
// ===========================

export interface SubmitLeadResponse {
  success: boolean
  data?: {
    lead: ClientLead
    matchResult: LeadMatchResult
  }
  error?: string
  processingTime?: number
}

export interface GetLeadsResponse {
  success: boolean
  data?: {
    leads: ClientLead[]
    total: number
  }
  error?: string
}

export interface GetMatchesResponse {
  success: boolean
  data?: {
    matches: (LeadMatch & {
      lead?: ClientLead
      trainer?: TrainerProfile
    })[]
    total: number
  }
  error?: string
}

// ===========================
// TRAINER RESPONSE TYPES
// ===========================

export interface TrainerLeadResponse {
  leadMatchId: string
  trainerId: string
  action: 'accept' | 'decline'
  message?: string
}

export interface RespondToLeadResponse {
  success: boolean
  data?: {
    match: LeadMatch
  }
  error?: string
}


