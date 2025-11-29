import { z } from "zod"

// ========================================
// PROGRAMS VALIDATION
// ========================================

export const createProgramSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  duration: z.number().int().positive(),
  sport: z.string().min(1),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  sessionsPerWeek: z.number().int().positive(),
  programGoals: z.array(z.string()).default([]),
  syllabus: z.any().optional(),
  milestones: z.any().optional(),
  price: z.number().positive().optional(),
  currency: z.string().default("USD"),
  isTemplate: z.boolean().default(false),
})

export const updateProgramSchema = createProgramSchema.partial()

// ========================================
// PACKAGES VALIDATION
// ========================================

export const createPackageSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  sessionsIncluded: z.number().int().positive(),
  packageType: z.string().min(1),
  sport: z.string().optional(),
  price: z.number().positive(),
  savings: z.number().positive().optional(),
  currency: z.string().default("USD"),
  validityDays: z.number().int().positive().optional(),
  features: z.array(z.string()).default([]),
  stripePriceId: z.string().optional(),
})

export const updatePackageSchema = createPackageSchema.partial()

// ========================================
// GROUP CLASSES VALIDATION
// ========================================

export const createGroupClassSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  sport: z.string().min(1),
  level: z.enum(["beginner", "intermediate", "advanced", "all"]).optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(), // HH:MM
  duration: z.number().int().positive(),
  specificDate: z.string().datetime().optional(),
  maxParticipants: z.number().int().positive(),
  minParticipants: z.number().int().positive().default(1),
  pricePerPerson: z.number().positive(),
  currency: z.string().default("USD"),
  location: z.string().optional(),
  meetingLink: z.string().url().optional(),
  isRecurring: z.boolean().default(false),
})

export const updateGroupClassSchema = createGroupClassSchema.partial()

// ========================================
// CHECK-INS VALIDATION
// ========================================

export const createCheckInSchema = z.object({
  clientId: z.string().uuid(),
  checkInType: z.enum(["weekly", "monthly", "assessment", "custom"]),
  weight: z.number().positive().optional(),
  bodyFat: z.number().min(0).max(100).optional(),
  muscleMass: z.number().positive().optional(),
  measurements: z.any().optional(),
  performanceData: z.any().optional(),
  energyLevel: z.number().int().min(1).max(10).optional(),
  motivation: z.number().int().min(1).max(10).optional(),
  overallFeeling: z.number().int().min(1).max(10).optional(),
  goalsProgress: z.any().optional(),
  clientNotes: z.string().max(2000).optional(),
  trainerNotes: z.string().max(2000).optional(),
  progressPhotos: z.array(z.string().url()).default([]),
  nextCheckInDate: z.string().datetime().optional(),
  actionItems: z.array(z.string()).default([]),
})

export const updateCheckInSchema = createCheckInSchema.partial()

// ========================================
// ANALYTICS VALIDATION
// ========================================

export const createAnalyticsSchema = z.object({
  date: z.string().datetime(),
  metric: z.string().min(1),
  value: z.number(),
  metadata: z.any().optional(),
})

// ========================================
// REPORTS VALIDATION
// ========================================

export const createReportSchema = z.object({
  reportType: z.enum(["revenue", "clients", "sessions", "performance"]),
  reportName: z.string().min(1).max(200),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
})

// ========================================
// WAITLIST VALIDATION
// ========================================

export const createWaitlistSchema = z.object({
  playerId: z.string().uuid(),
  playerEmail: z.string().email(),
  playerPhone: z.string().optional(),
  desiredDate: z.string().datetime().optional(),
  desiredTimeSlot: z.enum(["morning", "afternoon", "evening", "flexible"]).optional(),
  sessionType: z.string().optional(),
  duration: z.number().int().positive().default(60),
  notes: z.string().max(1000).optional(),
  priority: z.number().int().min(0).default(0),
})

// ========================================
// RETENTION VALIDATION
// ========================================

export const calculateRetentionSchema = z.object({
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  periodType: z.enum(["weekly", "monthly", "quarterly", "yearly"]),
})

// ========================================
// MARKETING VALIDATION
// ========================================

export const createCampaignSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(["email", "sms", "social", "referral"]),
  targetAudience: z.string().min(1),
  targetFilters: z.any().optional(),
  subject: z.string().max(200).optional(),
  content: z.string().min(1),
  callToAction: z.string().max(200).optional(),
  scheduledFor: z.string().datetime().optional(),
})

export const updateCampaignSchema = createCampaignSchema.partial()

// ========================================
// VIDEO LIBRARY VALIDATION
// ========================================

export const createVideoSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  sport: z.string().min(1),
  category: z.string().min(1),
  videoUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  duration: z.number().int().positive().optional(),
  tags: z.array(z.string()).default([]),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  equipment: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false),
  isShared: z.boolean().default(false),
})

export const updateVideoSchema = createVideoSchema.partial()

// ========================================
// AI PERSONA VALIDATION
// ========================================

export const createAIPersonaSchema = z.object({
  name: z.string().min(1).max(200),
  tagline: z.string().max(300).optional(),
  bio: z.string().max(2000).optional(),
  avatarUrl: z.string().url().optional(),
  voiceFileUrl: z.string().url().optional(),
  voiceSampleText: z.string().max(500).optional(),
  videoUrl: z.string().url().optional(),
  teachingStyle: z.enum(["motivational", "technical", "gentle", "tough_love"]),
  personality: z.any(), // JSON object with personality traits
  specialties: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  pricePerSession: z.number().positive().default(0.30),
  isActive: z.boolean().default(false),
  isDiscoverable: z.boolean().default(true),
})

export const updateAIPersonaSchema = createAIPersonaSchema.partial()

// ========================================
// SOCIAL/VIRAL CONTENT VALIDATION
// ========================================

export const createViralContentSchema = z.object({
  contentType: z.string().min(1),
  contentData: z.any(), // JSON object
})

// ========================================
// CONFLICTS VALIDATION
// ========================================

export const createConflictSchema = z.object({
  sessionId: z.string().uuid(),
  clientId: z.string().uuid(),
  originalTime: z.string().datetime(),
  conflictType: z.enum(["double_booking", "trainer_unavailable", "client_request", "calendar_sync"]),
  conflictSource: z.string().optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  conflictReason: z.string().min(1),
  suggestedSlots: z.any().optional(),
})

// ========================================
// REFERRALS VALIDATION
// ========================================

export const createReferralSchema = z.object({
  referrerId: z.string().uuid().optional(),
  referredEmail: z.string().email(),
  source: z.string().min(1),
  referralCode: z.string().min(1),
})

// ========================================
// TRAINING PLANS VALIDATION
// ========================================

export const createTrainingPlanSchema = z.object({
  clientId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  goal: z.string().min(1),
  duration: z.number().int().positive(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  clientGoals: z.any(), // JSON object
  fitnessLevel: z.string().min(1),
  availableTime: z.number().int().positive(),
  sessionsPerWeek: z.number().int().positive(),
  equipment: z.array(z.string()).default([]),
  injuries: z.array(z.string()).default([]),
  preferences: z.any().optional(),
  isTemplate: z.boolean().default(false),
})

export const updateTrainingPlanSchema = createTrainingPlanSchema.partial()

// ========================================
// HELPER FUNCTIONS
// ========================================

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, errors: result.error }
  }
}

export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {}
  error.issues.forEach((err) => {
    const path = err.path.join(".")
    formatted[path] = err.message
  })
  return formatted
}

