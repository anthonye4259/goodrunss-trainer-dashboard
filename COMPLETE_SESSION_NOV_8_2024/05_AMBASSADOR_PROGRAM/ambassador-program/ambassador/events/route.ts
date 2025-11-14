import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/ambassador-program/ambassador/events - Create event
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      userId,
      eventName,
      eventType, // clinic, tournament, meetup, demo
      description,
      sport,
      facilityId,
      locationName,
      eventDate,
      duration,
      maxAttendees,
      budgetAllocated
    } = body;

    if (!userId || !eventName || !eventType || !locationName || !eventDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user is an ambassador
    const ambassadors = await prisma.$queryRawUnsafe(`
      SELECT * FROM ambassadors
      WHERE user_id = $1
      LIMIT 1
    `, userId) as any[];

    if (ambassadors.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User is not an ambassador' },
        { status: 400 }
      );
    }

    const ambassador = ambassadors[0];
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create event
    await prisma.$queryRawUnsafe(`
      INSERT INTO ambassador_events (
        id, ambassador_id, event_name, event_type, description,
        sport, facility_id, location_name, event_date, duration,
        max_attendees, budget_allocated, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
    `, 
      eventId,
      ambassador.id,
      eventName,
      eventType,
      description || null,
      sport || null,
      facilityId || null,
      locationName,
      new Date(eventDate),
      duration || null,
      maxAttendees || null,
      budgetAllocated || 0,
      'planned'
    );

    // Update ambassador stats
    await prisma.$queryRawUnsafe(`
      UPDATE ambassadors
      SET total_events_hosted = total_events_hosted + 1, last_event_at = NOW()
      WHERE id = $1
    `, ambassador.id);

    // Log activity
    const activityId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await prisma.$queryRawUnsafe(`
      INSERT INTO program_activity (
        id, user_id, member_id, role_id, activity_type, activity_data, points_earned, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, NOW())
    `, 
      activityId,
      userId,
      ambassador.member_id,
      'ambassador',
      'event_hosted',
      JSON.stringify({ eventId, eventName, eventType }),
      25 // 25 points per event
    );

    const event = await prisma.$queryRawUnsafe(`
      SELECT * FROM ambassador_events WHERE id = $1
    `, eventId) as any[];

    return NextResponse.json({ 
      success: true, 
      event: event[0]
    });

  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

// GET /api/ambassador-program/ambassador/events?userId=xxx - Get user's events
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    let query = `
      SELECT e.*
      FROM ambassador_events e
      JOIN ambassadors a ON e.ambassador_id = a.id
      WHERE a.user_id = $1
    `;

    const params: any[] = [userId];

    if (status) {
      query += ` AND e.status = $2`;
      params.push(status);
    }

    query += ` ORDER BY e.event_date DESC`;

    const events = await prisma.$queryRawUnsafe(query, ...params) as any[];

    return NextResponse.json({ 
      success: true, 
      events 
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

