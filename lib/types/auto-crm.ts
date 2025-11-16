/**
 * TypeScript Types for Auto CRM Document Parser (Feature 4)
 * 
 * These types define the structure for client profiles, progress tracking,
 * goals, and AI-extracted data from uploaded documents.
 */

// ===========================
// INPUT TYPES (API Request)
// ===========================

export interface ProcessDocumentsInput {
  trainerId: string
  files: File[] // Array of uploaded files (PDF, image, etc.)
  clientName?: string // Optional: if trainer wants to associate with specific client
}

// ===========================
// EXTRACTED DATA TYPES
// ===========================

export interface ExtractedClientInfo {
  name: string
  age?: number
  email?: string
  phone?: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  medicalHistory?: string[]
  injuries?: string[]
  medications?: string[]
  allergies?: string[]
}

export interface ExtractedGoalInfo {
  description: string
  category: 'strength' | 'endurance' | 'flexibility' | 'weight_loss' | 'performance' | 'rehabilitation' | 'general_fitness'
  targetDate?: Date
  priority: 'low' | 'medium' | 'high'
  metrics?: {
    current?: string
    target?: string
    unit?: string
  }
}

export interface ExtractedProgressInfo {
  date: Date
  type: 'workout' | 'measurement' | 'assessment' | 'milestone'
  description: string
  metrics?: {
    [key: string]: number | string // e.g., "weight": 180, "reps": 12
  }
  notes?: string
}

export interface ExtractedSessionInfo {
  date: Date
  duration: number // minutes
  exercises: {
    name: string
    sets?: number
    reps?: string
    weight?: string
    notes?: string
  }[]
  intensity?: 'low' | 'moderate' | 'high'
  notes?: string
}

// ===========================
// AI ANALYSIS TYPES
// ===========================

export interface AIAnalysis {
  confidence: number // 0-1 scale
  documentType: 'medical_form' | 'fitness_assessment' | 'workout_log' | 'progress_photo' | 'intake_form' | 'other'
  extractedData: {
    clientInfo?: ExtractedClientInfo
    goals?: ExtractedGoalInfo[]
    progress?: ExtractedProgressInfo[]
    sessions?: ExtractedSessionInfo[]
  }
  suggestions?: string[] // AI-generated recommendations
  flaggedIssues?: string[] // e.g., "Possible contraindication: recent knee surgery"
}

// ===========================
// DATABASE OUTPUT TYPES
// ===========================

export interface CrmDocument {
  id: string
  trainerId: string
  originalFileName: string
  storagePath: string // Firebase Storage path
  fileType: string // 'image/jpeg', 'application/pdf', etc.
  fileSize: number // bytes
  uploadedAt: Date
  processedAt?: Date
  status: 'pending' | 'processing' | 'completed' | 'failed'
  aiModel?: string
  processingTime?: number // milliseconds
  errorMessage?: string
}

export interface ExtractedClientProfile {
  id: string
  crmDocumentId: string
  trainerId: string
  
  // Client details
  clientName: string
  clientAge?: number
  clientEmail?: string
  clientPhone?: string
  
  // Emergency contact
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelationship?: string
  
  // Health info
  medicalHistory?: string[]
  injuries?: string[]
  medications?: string[]
  allergies?: string[]
  
  // AI metadata
  confidence: number
  
  createdAt: Date
  updatedAt: Date
}

export interface ExtractedProgress {
  id: string
  crmDocumentId: string
  extractedClientProfileId?: string
  trainerId: string
  
  progressDate: Date
  progressType: 'workout' | 'measurement' | 'assessment' | 'milestone'
  description: string
  metrics?: Record<string, any> // JSON field
  notes?: string
  
  confidence: number
  
  createdAt: Date
  updatedAt: Date
}

export interface ExtractedGoal {
  id: string
  crmDocumentId: string
  extractedClientProfileId?: string
  trainerId: string
  
  goalDescription: string
  goalCategory: 'strength' | 'endurance' | 'flexibility' | 'weight_loss' | 'performance' | 'rehabilitation' | 'general_fitness'
  targetDate?: Date
  priority: 'low' | 'medium' | 'high'
  currentMetric?: string
  targetMetric?: string
  unit?: string
  
  status: 'active' | 'achieved' | 'abandoned'
  confidence: number
  
  createdAt: Date
  updatedAt: Date
}

export interface RecommendedSession {
  id: string
  extractedClientProfileId: string
  extractedGoalId?: string
  trainerId: string
  
  recommendationText: string
  suggestedDuration: number // minutes
  suggestedExercises?: string[]
  suggestedIntensity?: 'low' | 'moderate' | 'high'
  reasoning?: string
  
  aiModel: string
  confidence: number
  
  status: 'suggested' | 'scheduled' | 'completed' | 'dismissed'
  
  createdAt: Date
  updatedAt: Date
}

// ===========================
// API RESPONSE TYPES
// ===========================

export interface ProcessDocumentsResponse {
  success: boolean
  data?: {
    documents: CrmDocument[]
    extractedProfiles: ExtractedClientProfile[]
    extractedProgress: ExtractedProgress[]
    extractedGoals: ExtractedGoal[]
    recommendations: RecommendedSession[]
  }
  error?: string
  processingTime?: number
}

export interface GetCrmDataResponse {
  success: boolean
  data?: {
    profiles: ExtractedClientProfile[]
    progress: ExtractedProgress[]
    goals: ExtractedGoal[]
    recommendations: RecommendedSession[]
  }
  error?: string
}

