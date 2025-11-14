/**
 * GoodRunss - Activity Types
 * Defines all available activities across Rec Sports and Studios
 */

export const STUDIO_ACTIVITIES = [
  { value: 'yoga', label: 'Yoga', icon: '🧘', category: 'studio' },
  { value: 'pilates', label: 'Pilates', icon: '🏋️', category: 'studio' },
  { value: 'barre', label: 'Barre', icon: '🤸', category: 'studio' },
  { value: 'dance', label: 'Dance', icon: '💃', category: 'studio' },
  { value: 'zumba', label: 'Zumba', icon: '💃', category: 'studio' },
  { value: 'boxing', label: 'Boxing', icon: '🥊', category: 'studio' },
  { value: 'kickboxing', label: 'Kickboxing', icon: '🥊', category: 'studio' },
  { value: 'spin', label: 'Spin/Cycling', icon: '🚴', category: 'studio' },
  { value: 'hiit', label: 'HIIT', icon: '💪', category: 'studio' },
  { value: 'crossfit', label: 'CrossFit', icon: '🏋️', category: 'studio' },
] as const

export const REC_SPORTS = [
  { value: 'basketball', label: 'Basketball', icon: '🏀', category: 'rec' },
  { value: 'pickleball', label: 'Pickleball', icon: '🏓', category: 'rec' },
  { value: 'soccer', label: 'Soccer', icon: '⚽', category: 'rec' },
  { value: 'tennis', label: 'Tennis', icon: '🎾', category: 'rec' },
  { value: 'volleyball', label: 'Volleyball', icon: '🏐', category: 'rec' },
  { value: 'baseball', label: 'Baseball', icon: '⚾', category: 'rec' },
  { value: 'softball', label: 'Softball', icon: '🥎', category: 'rec' },
  { value: 'football', label: 'Football', icon: '🏈', category: 'rec' },
] as const

export const ALL_ACTIVITIES = [
  ...REC_SPORTS,
  ...STUDIO_ACTIVITIES,
] as const

export type ActivityValue = typeof ALL_ACTIVITIES[number]['value']
export type ActivityCategory = 'rec' | 'studio'

/**
 * Get activity by value
 */
export function getActivity(value: string) {
  return ALL_ACTIVITIES.find(a => a.value === value)
}

/**
 * Get activities by category
 */
export function getActivitiesByCategory(category: ActivityCategory) {
  return ALL_ACTIVITIES.filter(a => a.category === category)
}

/**
 * Check if activity is a studio activity
 */
export function isStudioActivity(value: string): boolean {
  return STUDIO_ACTIVITIES.some(a => a.value === value)
}

/**
 * Check if activity is a rec sport
 */
export function isRecSport(value: string): boolean {
  return REC_SPORTS.some(a => a.value === value)
}

/**
 * Activity descriptions for G.I.A and UX
 */
export const ACTIVITY_DESCRIPTIONS: Record<string, string> = {
  // Studio
  yoga: 'Mind-body practice combining physical poses, breathing, and meditation',
  pilates: 'Low-impact exercise focusing on core strength, flexibility, and posture',
  barre: 'Ballet-inspired workout combining dance, pilates, and yoga',
  dance: 'Rhythmic movement classes including various styles',
  zumba: 'High-energy dance fitness with Latin-inspired music',
  boxing: 'Combat sport training focusing on punches and footwork',
  kickboxing: 'Martial arts combining boxing with kicks',
  spin: 'Indoor cycling workout with varying intensity',
  hiit: 'High-Intensity Interval Training for maximum calorie burn',
  crossfit: 'Functional fitness combining weightlifting, cardio, and bodyweight exercises',
  
  // Rec Sports
  basketball: 'Team sport played on a court with hoops',
  pickleball: 'Paddle sport combining tennis, badminton, and ping-pong',
  soccer: 'Team sport played with feet on a large field',
  tennis: 'Racket sport played on a court',
  volleyball: 'Team sport played over a net',
  baseball: 'Bat-and-ball sport played on a diamond field',
  softball: 'Variant of baseball with a larger ball',
  football: 'Team sport with tackle or flag variations',
}

/**
 * Activity intensity levels
 */
export const ACTIVITY_INTENSITY: Record<string, 'low' | 'medium' | 'high'> = {
  // Low intensity
  yoga: 'low',
  pilates: 'low',
  barre: 'low',
  
  // Medium intensity
  dance: 'medium',
  tennis: 'medium',
  volleyball: 'medium',
  baseball: 'medium',
  softball: 'medium',
  
  // High intensity
  zumba: 'high',
  boxing: 'high',
  kickboxing: 'high',
  spin: 'high',
  hiit: 'high',
  crossfit: 'high',
  basketball: 'high',
  pickleball: 'high',
  soccer: 'high',
  football: 'high',
}

/**
 * Recommended session durations (in minutes)
 */
export const RECOMMENDED_DURATION: Record<string, number[]> = {
  // Studio (typically 45-90 min)
  yoga: [60, 75, 90],
  pilates: [45, 60, 75],
  barre: [45, 60],
  dance: [60, 90],
  zumba: [45, 60],
  boxing: [45, 60, 75],
  kickboxing: [45, 60, 75],
  spin: [45, 60],
  hiit: [30, 45, 60],
  crossfit: [60, 75],
  
  // Rec sports (typically 60-120 min)
  basketball: [60, 90, 120],
  pickleball: [60, 90],
  soccer: [60, 90, 120],
  tennis: [60, 90],
  volleyball: [60, 90],
  baseball: [90, 120, 180],
  softball: [90, 120],
  football: [60, 90, 120],
}




