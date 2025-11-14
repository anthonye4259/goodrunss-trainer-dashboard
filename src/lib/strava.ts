/**
 * Strava API Integration
 * OAuth + Activity Sync
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID!;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET!;
const STRAVA_REDIRECT_URI = process.env.STRAVA_REDIRECT_URI || 'http://localhost:3000/api/integrations/strava/callback';

const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

/**
 * Generate Strava OAuth authorization URL
 */
export function getStravaAuthUrl(userId: string): string {
  const params = new URLSearchParams({
    client_id: STRAVA_CLIENT_ID,
    response_type: 'code',
    redirect_uri: STRAVA_REDIRECT_URI,
    approval_prompt: 'auto',
    scope: 'read,activity:read_all,profile:read_all',
    state: userId, // Pass userId to identify user after OAuth
  });

  return `https://www.strava.com/oauth/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeStravaCode(code: string) {
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange Strava code');
  }

  return await response.json();
}

/**
 * Refresh Strava access token
 */
export async function refreshStravaToken(refreshToken: string) {
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Strava token');
  }

  return await response.json();
}

/**
 * Get Strava access token for user (auto-refresh if expired)
 */
async function getStravaAccessToken(userId: string): Promise<string> {
  const { data: integration } = await supabase
    .from('fitness_integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('integration_type', 'strava')
    .eq('is_active', true)
    .single();

  if (!integration) {
    throw new Error('Strava not connected');
  }

  // Check if token is expired
  const expiresAt = new Date(integration.token_expires_at);
  const now = new Date();

  if (expiresAt <= now) {
    // Refresh token
    const tokenData = await refreshStravaToken(integration.refresh_token);

    // Update in database
    await supabase
      .from('fitness_integrations')
      .update({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', integration.id);

    return tokenData.access_token;
  }

  return integration.access_token;
}

/**
 * Get athlete profile from Strava
 */
export async function getStravaAthlete(accessToken: string) {
  const response = await fetch(`${STRAVA_API_BASE}/athlete`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Failed to get Strava athlete');
  }

  return await response.json();
}

/**
 * Get activities from Strava
 */
export async function getStravaActivities(
  userId: string,
  page = 1,
  perPage = 30,
  after?: number // Unix timestamp
) {
  const accessToken = await getStravaAccessToken(userId);

  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });

  if (after) {
    params.append('after', after.toString());
  }

  const response = await fetch(`${STRAVA_API_BASE}/athlete/activities?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Failed to get Strava activities');
  }

  return await response.json();
}

/**
 * Get detailed activity from Strava
 */
export async function getStravaActivity(userId: string, activityId: string) {
  const accessToken = await getStravaAccessToken(userId);

  const response = await fetch(`${STRAVA_API_BASE}/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Failed to get Strava activity');
  }

  return await response.json();
}

/**
 * Sync Strava activities to database
 */
export async function syncStravaActivities(userId: string, daysBack = 30) {
  try {
    const after = Math.floor(Date.now() / 1000) - (daysBack * 24 * 60 * 60);
    const activities = await getStravaActivities(userId, 1, 200, after);

    let syncedCount = 0;

    for (const activity of activities) {
      // Normalize activity type
      const activityType = normalizeActivityType(activity.type);

      // Check if already exists
      const { data: existing } = await supabase
        .from('fitness_activities')
        .select('id')
        .eq('user_id', userId)
        .eq('integration_type', 'strava')
        .eq('external_id', activity.id.toString())
        .single();

      if (existing) continue; // Skip if already synced

      // Insert activity
      const { error } = await supabase
        .from('fitness_activities')
        .insert({
          user_id: userId,
          integration_type: 'strava',
          external_id: activity.id.toString(),
          activity_type: activityType,
          title: activity.name,
          description: activity.description,
          started_at: activity.start_date,
          duration_seconds: activity.elapsed_time,
          moving_time_seconds: activity.moving_time,
          distance_meters: activity.distance,
          average_speed: activity.average_speed,
          max_speed: activity.max_speed,
          average_heartrate: activity.average_heartrate,
          max_heartrate: activity.max_heartrate,
          calories_burned: activity.calories,
          elevation_gain: activity.total_elevation_gain,
          start_location: activity.start_latlng ? {
            lat: activity.start_latlng[0],
            lon: activity.start_latlng[1],
          } : null,
          raw_data: activity,
        });

      if (!error) syncedCount++;
    }

    // Update last synced timestamp
    await supabase
      .from('fitness_integrations')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('integration_type', 'strava');

    // Log sync
    await supabase
      .from('fitness_sync_logs')
      .insert({
        user_id: userId,
        integration_type: 'strava',
        sync_type: 'activities',
        records_synced: syncedCount,
        status: 'success',
      });

    return { success: true, syncedCount };
  } catch (error) {
    // Log error
    await supabase
      .from('fitness_sync_logs')
      .insert({
        user_id: userId,
        integration_type: 'strava',
        sync_type: 'activities',
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });

    throw error;
  }
}

/**
 * Normalize Strava activity types to our standard types
 */
function normalizeActivityType(stravaType: string): string {
  const typeMap: Record<string, string> = {
    'Run': 'run',
    'Ride': 'bike',
    'Swim': 'swim',
    'Walk': 'walk',
    'Hike': 'hike',
    'Tennis': 'tennis',
    'Basketball': 'basketball',
    'Soccer': 'soccer',
    'Workout': 'workout',
    'WeightTraining': 'strength',
    'Yoga': 'yoga',
  };

  return typeMap[stravaType] || stravaType.toLowerCase();
}

/**
 * Calculate daily metrics from activities
 */
export async function updateDailyMetricsFromStrava(userId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Get activities for this day
  const { data: activities } = await supabase
    .from('fitness_activities')
    .select('*')
    .eq('user_id', userId)
    .eq('integration_type', 'strava')
    .gte('started_at', startOfDay.toISOString())
    .lte('started_at', endOfDay.toISOString());

  if (!activities || activities.length === 0) return;

  // Calculate totals
  const totalDistance = activities.reduce((sum, a) => sum + (a.distance_meters || 0), 0);
  const totalCalories = activities.reduce((sum, a) => sum + (a.calories_burned || 0), 0);
  const totalMinutes = activities.reduce((sum, a) => sum + Math.floor((a.duration_seconds || 0) / 60), 0);

  // Upsert daily metrics
  await supabase
    .from('daily_health_metrics')
    .upsert({
      user_id: userId,
      date: date.toISOString().split('T')[0],
      distance_meters: totalDistance,
      calories_burned: totalCalories,
      active_minutes: totalMinutes,
      workout_count: activities.length,
      workout_minutes: totalMinutes,
      sources: ['strava'],
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,date',
    });
}

