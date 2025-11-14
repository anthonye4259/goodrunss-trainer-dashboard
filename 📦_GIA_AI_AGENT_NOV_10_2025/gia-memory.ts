/**
 * GIA Memory System Integration
 * Helper functions to make GIA remember everything about users
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Get full context for GIA chat
 * This is what GIA "knows" about the user
 */
export async function getGIAContext(userId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/v1/gia/context?userId=${userId}`
  );
  
  if (!response.ok) {
    return null;
  }
  
  const { context } = await response.json();
  return context;
}

/**
 * Format context into prompt for GIA
 */
export function formatContextForPrompt(context: any): string {
  if (!context) return '';

  const parts: string[] = [];

  // User's preferences
  if (context.favoriteSports?.length > 0) {
    parts.push(`Favorite sports: ${context.favoriteSports.join(', ')}`);
  }

  if (context.skillLevels && Object.keys(context.skillLevels).length > 0) {
    const skills = Object.entries(context.skillLevels)
      .map(([sport, level]) => `${sport}: ${level}`)
      .join(', ');
    parts.push(`Skill levels: ${skills}`);
  }

  if (context.playingStyle) {
    parts.push(`Playing style: ${context.playingStyle}`);
  }

  if (context.communicationStyle) {
    parts.push(`Prefers ${context.communicationStyle} communication`);
  }

  // Current state
  if (context.currentGoals?.length > 0) {
    parts.push(`Current goals: ${context.currentGoals.join(', ')}`);
  }

  if (context.workingOn?.length > 0) {
    parts.push(`Working on: ${context.workingOn.join(', ')}`);
  }

  // Recent activity
  if (context.lastSport) {
    parts.push(`Last played: ${context.lastSport}`);
  }

  if (context.lastFacility) {
    parts.push(`Last facility: ${context.lastFacility}`);
  }

  // Key facts
  if (context.keyFacts?.length > 0) {
    const topFacts = context.keyFacts.slice(0, 5).map((f: any) => f.fact);
    parts.push(`Key facts: ${topFacts.join('; ')}`);
  }

  // Patterns
  if (context.observedPatterns?.length > 0) {
    const patterns = context.observedPatterns
      .slice(0, 3)
      .map((p: any) => `${p.type} ${p.frequency}`)
      .join(', ');
    parts.push(`Patterns: ${patterns}`);
  }

  // Relationships
  if (context.relationships?.length > 0) {
    const relationships = context.relationships
      .slice(0, 3)
      .map((r: any) => `${r.type} with ${r.with}`)
      .join(', ');
    parts.push(`Relationships: ${relationships}`);
  }

  // Recent events
  if (context.recentEvents?.length > 0) {
    const events = context.recentEvents
      .slice(0, 2)
      .map((e: any) => e.event)
      .join('; ');
    parts.push(`Recent: ${events}`);
  }

  return parts.join('\n');
}

/**
 * Store memory from conversation
 */
export async function storeMemory(params: {
  userId: string;
  memoryType: string;
  category: string;
  key: string;
  value: string;
  source?: string;
  importance?: number;
}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/v1/gia/memory`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }
  );

  return response.json();
}

/**
 * Update user context after conversation
 */
export async function updateContext(userId: string, updates: any) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/v1/gia/context`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, updates }),
    }
  );

  return response.json();
}

/**
 * Record activity pattern
 */
export async function recordPattern(params: {
  userId: string;
  patternType: string;
  patternData: any;
  frequency?: string;
}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/v1/gia/patterns`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }
  );

  return response.json();
}

/**
 * Extract and store learnings from conversation
 */
export async function extractLearnings(userId: string, conversation: string) {
  // Simple extraction (in production, use AI to extract)
  const learnings: any[] = [];

  // Extract sports mentions
  const sports = ['tennis', 'pickleball', 'basketball', 'volleyball', 'badminton'];
  sports.forEach(sport => {
    if (conversation.toLowerCase().includes(sport)) {
      learnings.push({
        userId,
        memoryType: 'preference',
        category: 'sports',
        key: `plays_${sport}`,
        value: 'true',
        source: 'inferred',
        importance: 5,
      });
    }
  });

  // Extract time preferences
  const timeWords = {
    'morning': 'morning',
    'afternoon': 'afternoon',
    'evening': 'evening',
    'early': 'morning',
    'late': 'evening',
  };

  Object.entries(timeWords).forEach(([word, time]) => {
    if (conversation.toLowerCase().includes(word)) {
      learnings.push({
        userId,
        memoryType: 'preference',
        category: 'schedule',
        key: 'preferred_time',
        value: time,
        source: 'inferred',
        importance: 6,
      });
    }
  });

  // Store all learnings
  for (const learning of learnings) {
    await storeMemory(learning);
  }

  return learnings;
}

/**
 * Track booking behavior for pattern analysis
 */
export async function trackBookingBehavior(userId: string, bookingData: any) {
  // Record booking pattern
  await recordPattern({
    userId,
    patternType: 'booking',
    patternData: {
      sport: bookingData.sport,
      time: bookingData.time,
      day: new Date(bookingData.date).getDay(),
      facility: bookingData.facilityId,
      duration: bookingData.duration,
    },
    frequency: 'weekly', // Will be calculated based on observation count
  });

  // Update context
  await updateContext(userId, {
    last_booking_date: bookingData.date,
    last_sport_played: bookingData.sport,
    last_facility_visited: bookingData.facilityId,
  });
}

