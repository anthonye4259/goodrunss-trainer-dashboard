import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/feed/interactions - Log user interaction for adaptive algorithm
export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      sessionToken, // Support anonymous users
      contentType,
      contentId,
      action,
      actionValue,
      sessionId,
      deviceType,
      location,
      metadata,
    } = await req.json();

    // Support both authenticated and anonymous users
    const identifier = userId || sessionToken;

    if (!identifier || !contentType || !contentId || !action) {
      return NextResponse.json(
        { error: 'userId or sessionToken, contentType, contentId, and action are required' },
        { status: 400 }
      );
    }

    // Determine time context
    const now = new Date();
    const hour = now.getHours();
    let timeOfDay = 'morning';
    if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else if (hour >= 21 || hour < 6) timeOfDay = 'night';

    // Log interaction
    const interaction = await prisma.userInteraction.create({
      data: {
        userId: identifier, // Use identifier (userId or sessionToken)
        contentType,
        contentId,
        action,
        actionValue,
        sessionId,
        deviceType,
        location,
        timeOfDay,
        dayOfWeek: now.getDay(),
        metadata,
      },
    });

    // Update content features (engagement metrics)
    await updateContentMetrics(contentType, contentId, action);

    // Update anonymous session activity if applicable
    if (sessionToken) {
      await updateAnonymousSessionActivity(sessionToken);
    }

    // Trigger preference recomputation if enough interactions
    await maybeUpdatePreferences(identifier);

    return NextResponse.json(
      {
        interaction,
        message: 'Interaction logged successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error logging interaction:', error);
    return NextResponse.json(
      { error: 'Failed to log interaction' },
      { status: 500 }
    );
  }
}

// GET /api/feed/interactions - Get user's interaction history
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const contentType = searchParams.get('contentType');
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const where: any = { userId };
    if (contentType) where.contentType = contentType;
    if (action) where.action = action;

    const interactions = await prisma.userInteraction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Get stats
    const stats = {
      total: interactions.length,
      byAction: {} as any,
      byContentType: {} as any,
    };

    interactions.forEach((interaction) => {
      stats.byAction[interaction.action] = (stats.byAction[interaction.action] || 0) + 1;
      stats.byContentType[interaction.contentType] = (stats.byContentType[interaction.contentType] || 0) + 1;
    });

    return NextResponse.json({
      interactions,
      stats,
    });
  } catch (error) {
    console.error('Error fetching interactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interactions' },
      { status: 500 }
    );
  }
}

// Helper: Update content engagement metrics
async function updateContentMetrics(contentType: string, contentId: string, action: string) {
  try {
    // Find or create content feature record
    let feature = await prisma.contentFeature.findUnique({
      where: {
        contentType_contentId: {
          contentType,
          contentId,
        },
      },
    });

    if (!feature) {
      // Create new feature record with minimal data
      feature = await prisma.contentFeature.create({
        data: {
          contentType,
          contentId,
          viewCount: action === 'view' ? 1 : 0,
          likeCount: action === 'like' ? 1 : 0,
          bookingCount: action === 'book' ? 1 : 0,
          shareCount: action === 'share' ? 1 : 0,
        },
      });
    } else {
      // Update existing metrics
      const updates: any = {};
      if (action === 'view') updates.viewCount = feature.viewCount + 1;
      if (action === 'like') updates.likeCount = feature.likeCount + 1;
      if (action === 'book') updates.bookingCount = feature.bookingCount + 1;
      if (action === 'share') updates.shareCount = feature.shareCount + 1;

      if (Object.keys(updates).length > 0) {
        await prisma.contentFeature.update({
          where: { id: feature.id },
          data: updates,
        });
      }
    }
  } catch (error) {
    console.error('Error updating content metrics:', error);
  }
}

// Helper: Update anonymous session activity
async function updateAnonymousSessionActivity(sessionToken: string) {
  try {
    const session = await prisma.anonymousSession.findUnique({
      where: { sessionToken },
    });

    if (session) {
      await prisma.anonymousSession.update({
        where: { sessionToken },
        data: {
          totalInteractions: session.totalInteractions + 1,
          lastActiveAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error('Error updating anonymous session:', error);
  }
}

// Helper: Maybe trigger preference recomputation
async function maybeUpdatePreferences(identifier: string) {
  try {
    // Check if preferences exist
    const preference = await prisma.userPreference.findUnique({
      where: { userId: identifier },
    });

    if (!preference) {
      // For anonymous users, don't create UserPreference (use OnboardingPreference instead)
      // For real users, create initial preferences
      if (!identifier.startsWith('anon_')) {
        await prisma.userPreference.create({
          data: {
            userId: identifier,
            workoutTypes: {},
            trainerStyles: {},
            contentFormats: {},
            specialties: {},
            preferredTimes: [],
            preferredDays: [],
            trainerIds: [],
          },
        });
      }
    } else {
      // Check if needs recomputation (every 50 interactions)
      const interactionCount = await prisma.userInteraction.count({
        where: { userId: identifier },
      });

      if (interactionCount % 50 === 0) {
        // Trigger background recomputation
        // In production, this would be a queue job
        console.log(`Triggering preference recomputation for user ${identifier}`);
      }
    }
  } catch (error) {
    console.error('Error updating preferences:', error);
  }
}

