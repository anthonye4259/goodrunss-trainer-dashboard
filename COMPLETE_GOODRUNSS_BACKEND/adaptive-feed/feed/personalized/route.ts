import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/feed/personalized - Get personalized feed for user (TikTok-style)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const sessionToken = searchParams.get('sessionToken'); // Support anonymous users
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const contentTypes = searchParams.get('contentTypes')?.split(',') || ['trainer', 'facility', 'workout', 'ai_persona'];

    // Support both authenticated users and anonymous sessions
    const identifier = userId || sessionToken;

    if (!identifier) {
      return NextResponse.json(
        { error: 'userId or sessionToken is required' },
        { status: 400 }
      );
    }

    const isAnonymous = !userId;

    // Start feed session
    const sessionId = await startFeedSession(identifier);

    // Get user preferences (or onboarding prefs for anonymous)
    const preferences = await getUserPreferences(identifier, isAnonymous, sessionToken);

    // Get candidate content
    const candidates = await getCandidateContent(contentTypes, limit * 3); // Get 3x for filtering

    // Score each candidate
    const scoredContent = await scoreContent(identifier, preferences, candidates);

    // Sort by score and apply diversity
    const rankedContent = applyDiversityFilter(scoredContent);

    // Paginate
    const feed = rankedContent.slice(offset, offset + limit);

    // Cache recommendation scores
    await cacheRecommendations(identifier, feed);

    return NextResponse.json({
      feed,
      sessionId,
      isAnonymous,
      meta: {
        total: rankedContent.length,
        offset,
        limit,
        hasMore: offset + limit < rankedContent.length,
      },
      algorithm: {
        version: 'v1',
        personalizedFor: identifier,
        isAnonymous,
        factorsConsidered: [
          'user_preferences',
          'past_interactions',
          'content_popularity',
          'recency',
          'diversity',
          'location_proximity',
        ],
      },
    });
  } catch (error) {
    console.error('Error generating personalized feed:', error);
    return NextResponse.json(
      { error: 'Failed to generate personalized feed' },
      { status: 500 }
    );
  }
}

// Start a feed session for analytics
async function startFeedSession(userId: string): Promise<string> {
  const session = await prisma.feedSession.create({
    data: {
      userId,
      algorithmVersion: 'v1',
    },
  });
  return session.id;
}

// Get user preferences or create defaults
async function getUserPreferences(identifier: string, isAnonymous: boolean, sessionToken?: string | null) {
  // For anonymous users, try to get onboarding preferences
  if (isAnonymous && sessionToken) {
    const onboardingPrefs = await prisma.onboardingPreference.findUnique({
      where: { sessionToken },
    });

    if (onboardingPrefs) {
      // Convert onboarding prefs to user preference format
      const workoutTypes: any = {};
      onboardingPrefs.workoutTypes.forEach((type) => {
        workoutTypes[type] = 0.8; // Higher score for explicitly selected
      });

      const specialties: any = {};
      onboardingPrefs.fitnessGoals.forEach((goal) => {
        specialties[goal] = 0.8;
      });

      return {
        userId: identifier,
        workoutTypes,
        trainerStyles: { motivational: 0.5, technical: 0.5, gentle: 0.5 },
        contentFormats: { video: 1.0, audio: 0.5, text: 0.3 },
        specialties,
        preferredTimes: onboardingPrefs.availability,
        preferredDays: [],
        trainerIds: [],
        intensityLevel: onboardingPrefs.experience || 'medium',
        videoLength: 'medium',
        maxDistance: onboardingPrefs.maxDistance,
      };
    }

    // Anonymous user with no onboarding - use defaults
    return {
      userId: identifier,
      workoutTypes: { strength: 0.5, cardio: 0.5, yoga: 0.5, hiit: 0.5 },
      trainerStyles: { motivational: 0.5, technical: 0.5, gentle: 0.5 },
      contentFormats: { video: 1.0, audio: 0.5, text: 0.3 },
      specialties: {},
      preferredTimes: [],
      preferredDays: [],
      trainerIds: [],
      intensityLevel: 'medium',
      videoLength: 'medium',
    };
  }

  // Authenticated user - get from database
  let preferences = await prisma.userPreference.findUnique({
    where: { userId: identifier },
  });

  if (!preferences) {
    // Create default preferences for new users
    preferences = await prisma.userPreference.create({
      data: {
        userId: identifier,
        workoutTypes: { strength: 0.5, cardio: 0.5, yoga: 0.5, hiit: 0.5 },
        trainerStyles: { motivational: 0.5, technical: 0.5, gentle: 0.5 },
        contentFormats: { video: 1.0, audio: 0.5, text: 0.3 },
        specialties: {},
        preferredTimes: [],
        preferredDays: [],
        trainerIds: [],
        intensityLevel: 'medium',
        videoLength: 'medium',
      },
    });
  }

  return preferences;
}

// Get candidate content from database
async function getCandidateContent(contentTypes: string[], limit: number) {
  const content = await prisma.contentFeature.findMany({
    where: {
      contentType: { in: contentTypes },
    },
    orderBy: [
      { engagementScore: 'desc' },
      { publishedAt: 'desc' },
    ],
    take: limit,
  });

  return content;
}

// Score content based on user preferences
async function scoreContent(userId: string, preferences: any, candidates: any[]) {
  const scoredContent = [];

  // Get user's past interactions
  const pastInteractions = await prisma.userInteraction.findMany({
    where: { userId },
    select: {
      contentId: true,
      action: true,
    },
  });

  const viewedContentIds = new Set(
    pastInteractions.filter((i) => i.action === 'view').map((i) => i.contentId)
  );
  const likedContentIds = new Set(
    pastInteractions.filter((i) => i.action === 'like').map((i) => i.contentId)
  );
  const skippedContentIds = new Set(
    pastInteractions.filter((i) => i.action === 'skip').map((i) => i.contentId)
  );

  for (const content of candidates) {
    // Skip if already viewed recently (last 100 items)
    if (viewedContentIds.has(content.contentId)) continue;

    // Heavy penalty if previously skipped
    if (skippedContentIds.has(content.contentId)) continue;

    // Calculate personalization score (0-1)
    let personalScore = 0.5; // Base score

    // Workout type match
    if (content.workoutType && preferences.workoutTypes[content.workoutType]) {
      personalScore += preferences.workoutTypes[content.workoutType] * 0.2;
    }

    // Trainer style match
    if (content.trainerStyle && preferences.trainerStyles[content.trainerStyle]) {
      personalScore += preferences.trainerStyles[content.trainerStyle] * 0.15;
    }

    // Favorite trainer boost
    if (content.trainerId && preferences.trainerIds.includes(content.trainerId)) {
      personalScore += 0.2;
    }

    // Intensity match
    if (content.intensity === preferences.intensityLevel) {
      personalScore += 0.1;
    }

    // Boost if previously liked similar content
    if (likedContentIds.size > 0) {
      personalScore += 0.05;
    }

    // Calculate popularity score (0-1)
    const popularityScore = Math.min(
      (content.viewCount * 0.3 + content.likeCount * 2 + content.bookingCount * 5 + content.shareCount * 3) / 1000,
      1.0
    );

    // Calculate recency score (0-1)
    const daysSincePublished = content.publishedAt
      ? (Date.now() - new Date(content.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
      : 999;
    const recencyScore = Math.max(0, 1 - daysSincePublished / 30); // Decay over 30 days

    // Quality score from engagement
    const qualityScore = content.engagementScore;

    // Combined final score
    // Weights: 40% personal, 25% popularity, 15% recency, 20% quality
    const finalScore =
      personalScore * 0.4 + popularityScore * 0.25 + recencyScore * 0.15 + qualityScore * 0.2;

    scoredContent.push({
      ...content,
      scores: {
        personal: personalScore,
        popularity: popularityScore,
        recency: recencyScore,
        quality: qualityScore,
        final: finalScore,
      },
      reasoning: {
        workoutMatch: content.workoutType && preferences.workoutTypes[content.workoutType] > 0.6,
        favoriteTrainer: preferences.trainerIds.includes(content.trainerId),
        trending: popularityScore > 0.7,
        fresh: recencyScore > 0.7,
      },
    });
  }

  // Sort by final score
  scoredContent.sort((a, b) => b.scores.final - a.scores.final);

  return scoredContent;
}

// Apply diversity filter (don't show same trainer/workout type back-to-back)
function applyDiversityFilter(content: any[]): any[] {
  const diversified = [];
  const recentTrainers = new Set<string>();
  const recentWorkoutTypes = new Set<string>();
  const windowSize = 3; // Don't repeat within 3 items

  for (const item of content) {
    // Check diversity
    let diversityPenalty = 0;
    if (item.trainerId && recentTrainers.has(item.trainerId)) diversityPenalty += 0.2;
    if (item.workoutType && recentWorkoutTypes.has(item.workoutType)) diversityPenalty += 0.1;

    // Apply penalty
    item.scores.diversity = 1 - diversityPenalty;
    item.scores.final = item.scores.final * item.scores.diversity;

    diversified.push(item);

    // Track recent items
    if (item.trainerId) recentTrainers.add(item.trainerId);
    if (item.workoutType) recentWorkoutTypes.add(item.workoutType);

    // Clear window after N items
    if (diversified.length % windowSize === 0) {
      recentTrainers.clear();
      recentWorkoutTypes.clear();
    }
  }

  // Re-sort after diversity adjustments
  diversified.sort((a, b) => b.scores.final - a.scores.final);

  return diversified;
}

// Cache recommendation scores for analytics
async function cacheRecommendations(userId: string, feed: any[]) {
  try {
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour cache

    for (let i = 0; i < feed.length; i++) {
      const item = feed[i];
      await prisma.recommendationScore.upsert({
        where: {
          userId_contentType_contentId: {
            userId,
            contentType: item.contentType,
            contentId: item.contentId,
          },
        },
        update: {
          personalScore: item.scores.personal,
          popularityScore: item.scores.popularity,
          recencyScore: item.scores.recency,
          diversityScore: item.scores.diversity || 1.0,
          finalScore: item.scores.final,
          rank: i + 1,
          expiresAt,
          computedAt: new Date(),
          reasoning: item.reasoning,
        },
        create: {
          userId,
          contentType: item.contentType,
          contentId: item.contentId,
          personalScore: item.scores.personal,
          popularityScore: item.scores.popularity,
          recencyScore: item.scores.recency,
          diversityScore: item.scores.diversity || 1.0,
          finalScore: item.scores.final,
          rank: i + 1,
          expiresAt,
          reasoning: item.reasoning,
        },
      });
    }
  } catch (error) {
    console.error('Error caching recommendations:', error);
  }
}

