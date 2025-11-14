import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/anonymous/gates
 * Get authentication gates for features
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const featureId = searchParams.get('feature');
    const sessionToken = searchParams.get('sessionToken');

    // Get all gates (AuthenticationGate model tracks events, not rules)
    // TODO: This model doesn't have isActive, featureId, priority fields
    // Need to either update schema or use a different model for gate rules
    const gates = await prisma.authenticationGate.findMany({
      where: {
        ...(featureId ? { gateType: featureId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit results
    });

    // Check if user is authenticated
    const { userId } = await auth();

    // Check session limits if anonymous
    let sessionChecks: any = {};
    if (!userId && sessionToken) {
      const session = await prisma.anonymousSession.findUnique({
        where: { sessionToken },
      });

      if (session) {
        // Count interactions
        const interactionCount = await prisma.userInteraction.count({
          where: { sessionId: session.id },
        });

        sessionChecks = {
          interactionCount,
          sessionAge: Date.now() - session.createdAt.getTime(),
          hasExceededLimits: interactionCount >= 10, // Example: limit 10 interactions
        };
      }
    }

    // Format gates with access status
    // Note: AuthenticationGate model tracks events, not rules
    // For now, return basic gate info - full implementation needs gate rules model
    const gatesWithStatus = gates.map((gate) => {
      let canAccess = false;
      let reason = '';

      if (userId) {
        // Authenticated users can access everything by default
        canAccess = true;
        reason = 'authenticated';
      } else {
        // Default: require authentication for anonymous users
        // TODO: Implement proper gate rules checking
        canAccess = false;
        reason = 'Authentication required';
      }

      return {
        gateId: gate.id,
        gateType: gate.gateType,
        gateTrigger: gate.gateTrigger,
        gateLocation: gate.gateLocation,
        canAccess,
        reason,
        didAuthenticate: gate.didAuthenticate,
        createdAt: gate.createdAt,
      };
    });

    return NextResponse.json({
      gates: gatesWithStatus,
      isAuthenticated: !!userId,
      sessionChecks,
    });
  } catch (error) {
    console.error('Error fetching authentication gates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/anonymous/gates
 * Check if a specific feature is accessible
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { featureId, sessionToken } = body;

    if (!featureId) {
      return NextResponse.json(
        { error: 'Feature ID required' },
        { status: 400 }
      );
    }

    // Check if user is authenticated
    const { userId } = await auth();

    // Get gate for this feature
    // Note: Using gateType instead of featureId since model doesn't have featureId
    const gate = await prisma.authenticationGate.findFirst({
      where: {
        gateType: featureId,
      },
      orderBy: { createdAt: 'desc' },
    });

    // If no gate exists, feature is open
    if (!gate) {
      return NextResponse.json({
        canAccess: true,
        reason: 'no_gate',
      });
    }

    // Authenticated users can access
    if (userId) {
      return NextResponse.json({
        canAccess: true,
        reason: 'authenticated',
      });
    }

    // Check anonymous access
    // TODO: Implement proper gate rules - current model tracks events, not rules
    // For now, default to requiring authentication
    return NextResponse.json({
      canAccess: false,
      reason: 'Authentication required',
      gateType: gate.gateType,
      requiresAuth: true,
    });
  } catch (error) {
    console.error('Error checking gate access:', error);
    return NextResponse.json(
      { error: 'Failed to check access' },
      { status: 500 }
    );
  }
}

