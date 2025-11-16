/**
 * GIA Session Plan Generator - TypeScript Types
 * Feature 1: AI Session Plan Generator (under 20 seconds)
 */

// Input type for generating a session plan
export interface GenerateSessionPlanInput {
  clientName: string
  clientAge?: number
  clientLevel: 'beginner' | 'intermediate' | 'advanced'
  sport: string // tennis, basketball, pilates, yoga, golf, etc.
}

// Warmup exercise structure
export interface WarmupExercise {
  name: string
  duration: number // minutes
  instructions: string
  reps?: number
  sets?: number
}

// Drill structure
export interface Drill {
  name: string
  duration: number // minutes
  description: string
  instructions: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  focus: string[] // e.g., ['footwork', 'serve', 'accuracy']
  equipment?: string[]
}

// Cooldown exercise structure
export interface CooldownExercise {
  name: string
  duration: number // minutes
  instructions: string
  benefits: string
}

// Video in playlist
export interface Video {
  id: string
  title: string
  url: string
  duration?: number // seconds
  thumbnail?: string
}

// Video playlist structure
export interface VideoPlaylist {
  platform: 'youtube' | 'vimeo' | 'custom'
  videos: Video[]
  totalDuration?: number // seconds
}

// Instagram content structure
export interface InstagramContent {
  caption: string
  hashtags: string[]
  tips: string[]
  suggestedImage?: string
}

// Complete session plan structure (matches Prisma model)
export interface SessionPlan {
  id: string
  trainerId: string
  
  // Client context
  clientName: string
  clientAge?: number
  clientLevel: 'beginner' | 'intermediate' | 'advanced'
  sport: string
  
  // Session content
  sessionDuration: number
  warmup: {
    exercises: WarmupExercise[]
    duration: number
  }
  drills: Drill[]
  cooldown: {
    exercises: CooldownExercise[]
    duration: number
  }
  notes?: string
  progressions?: string
  
  // Media and content
  videoPlaylist?: VideoPlaylist
  instagramContent?: InstagramContent
  messageToClient?: string
  
  // PDF
  pdfUrl?: string
  pdfGeneratedAt?: Date
  
  // Metadata
  aiModel: string
  promptTokens?: number
  completionTokens?: number
  generationTime?: number // milliseconds
  
  // Status
  status: 'generated' | 'sent' | 'viewed'
  sentAt?: Date
  viewedAt?: Date
  
  downloadCount: number
  shareCount: number
  
  createdAt: Date
  updatedAt: Date
}

// API Response type
export interface GenerateSessionPlanResponse {
  success: boolean
  data?: SessionPlan
  error?: string
  generationTime?: number // milliseconds
}

// AI Generation result (before saving to DB)
export interface AISessionPlanResult {
  sessionDuration: number
  warmup: {
    exercises: WarmupExercise[]
    duration: number
  }
  drills: Drill[]
  cooldown: {
    exercises: CooldownExercise[]
    duration: number
  }
  notes: string
  progressions: string
  videoPlaylist: VideoPlaylist
  instagramContent: InstagramContent
  messageToClient: string
}

