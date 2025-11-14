/**
 * Whoop API Integration
 * OAuth + Recovery & Strain Sync
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const WHOOP_CLIENT_ID = process.env.WHOOP_CLIENT_ID!;
const WHOOP_CLIENT_SECRET = process.env.WHOOP_CLIENT_SECRET!;
const WHOOP_REDIRECT_URI = process.env.WHOOP_REDIRECT_URI || 'http://localhost:3000/api/integrations/whoop/callback';

const WHOOP_API_BASE = 'https://api.prod.whoop.com/developer/v1';

/**
 * Generate Whoop OAuth authorization URL
 */
export function getWhoopAuthUrl(userId: string): string {
  const params = new URLSearchParams({
    client_id: WHOOP_CLIENT_ID,
    response_type: 'code',
    redirect_uri: WHOOP_REDIRECT_URI,
    scope: 'read:recovery read:cycles read:sleep read:workout read:profile',
    state: userId,
  });

  return `https://api.prod.whoop.com/oauth/oauth2/auth?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeWhoopCode(code: string) {
  const response = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${WHOOP_CLIENT_ID}:${WHOOP_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: WHOOP_REDIRECT_URI,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange Whoop code');
  }

  return await response.json();
}

/**
 * Refresh Whoop access token
 */
export async function refreshWhoopToken(refreshToken: string) {
  const response = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${WHOOP_CLIENT_ID}:${WHOOP_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Whoop token');
  }

  return await response.json();
}

/**
 * Get Whoop access token for user (auto-refresh if expired)
 */
async function getWhoopAccessToken(userId: string): Promise<string> {
  const { data: integration } = await supabase
    .from('fitness_integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('integration_type', 'whoop')
    .eq('is_active', true)
    .single();

  if (!integration) {
    throw new Error('Whoop not connected');
  }

  // Check if token is expired (Whoop tokens last 18 hours)
  const expiresAt = new Date(integration.token_expires_at);
  const now = new Date();

  if (expiresAt <= now) {
    // Refresh token
    const tokenData = await refreshWhoopToken(integration.refresh_token);

    // Update in database
    await supabase
      .from('fitness_integrations')
      .update({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', integration.id);

    return tokenData.access_token;
  }

  return integration.access_token;
}

/**
 * Get user profile from Whoop
 */
export async function getWhoopProfile(accessToken: string) {
  const response = await fetch(`${WHOOP_API_BASE}/user/profile/basic`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Failed to get Whoop profile');
  }

  return await response.json();
}

/**
 * Get recovery data from Whoop
 */
export async function getWhoopRecovery(userId: string, startDate?: string, endDate?: string) {
  const accessToken = await getWhoopAccessToken(userId);

  const params = new URLSearchParams({
    limit: '100',
  });

  if (startDate) params.append('start', startDate);
  if (endDate) params.append('end', endDate);

  const response = await fetch(`${WHOOP_API_BASE}/cycle?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Failed to get Whoop recovery');
  }

  return await response.json();
}

/**
 * Get workout data from Whoop
 */
export async function getWhoopWorkouts(userId: string, startDate?: string, endDate?: string) {
  const accessToken = await getWhoopAccessToken(userId);

  const params = new URLSearchParams({
    limit: '100',
  });

  if (startDate) params.append('start', startDate);
  if (endDate) params.append('end', endDate);

  const response = await fetch(`${WHOOP_API_BASE}/activity/workout?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Failed to get Whoop workouts');
  }

  return await response.json();
}

/**
 * Sync Whoop recovery data to database
 */
export async function syncWhoopRecovery(userId: string, daysBack = 30) {
  try {
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();

    const response = await getWhoopRecovery(userId, startDate, endDate);
    const cycles = response.records || [];

    let syncedCount = 0;

    for (const cycle of cycles) {
      if (!cycle.recovery) continue; // Skip if no recovery data

      const date = cycle.days[0]; // Cycle date

      // Upsert recovery data
      const { error } = await supabase
        .from('whoop_recovery')
        .upsert({
          user_id: userId,
          external_id: cycle.id.toString(),
          date,
          recovery_score: cycle.recovery.score,
          resting_heart_rate: cycle.recovery.resting_heart_rate,
          hrv_rmssd: cycle.recovery.hrv_rmssd_milli,
          sleep_performance: cycle.sleep?.performance_percentage,
          sleep_duration_seconds: cycle.sleep?.quality_duration / 1000,
          sleep_needed_seconds: cycle.sleep?.need_from_strain / 1000,
          day_strain: cycle.strain?.average_heart_rate,
          day_calories: cycle.strain?.kilojoules,
          raw_data: cycle,
        }, {
          onConflict: 'user_id,date',
        });

      if (!error) syncedCount++;

      // Also update daily health metrics
      await supabase
        .from('daily_health_metrics')
        .upsert({
          user_id: userId,
          date,
          recovery_score: cycle.recovery.score,
          strain_score: cycle.strain?.average_heart_rate,
          sleep_hours: cycle.sleep?.quality_duration ? cycle.sleep.quality_duration / 3600000 : null,
          resting_heart_rate: cycle.recovery.resting_heart_rate,
          sources: ['whoop'],
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,date',
        });
    }

    // Update last synced timestamp
    await supabase
      .from('fitness_integrations')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('integration_type', 'whoop');

    // Log sync
    await supabase
      .from('fitness_sync_logs')
      .insert({
        user_id: userId,
        integration_type: 'whoop',
        sync_type: 'recovery',
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
        integration_type: 'whoop',
        sync_type: 'recovery',
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });

    throw error;
  }
}

/**
 * Sync Whoop workouts to database
 */
export async function syncWhoopWorkouts(userId: string, daysBack = 30) {
  try {
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();

    const response = await getWhoopWorkouts(userId, startDate, endDate);
    const workouts = response.records || [];

    let syncedCount = 0;

    for (const workout of workouts) {
      // Check if already exists
      const { data: existing } = await supabase
        .from('fitness_activities')
        .select('id')
        .eq('user_id', userId)
        .eq('integration_type', 'whoop')
        .eq('external_id', workout.id.toString())
        .single();

      if (existing) continue;

      // Insert workout
      const { error } = await supabase
        .from('fitness_activities')
        .insert({
          user_id: userId,
          integration_type: 'whoop',
          external_id: workout.id.toString(),
          activity_type: normalizeWhoopActivityType(workout.sport_id),
          title: `Whoop ${normalizeWhoopActivityType(workout.sport_id)}`,
          started_at: workout.start,
          ended_at: workout.end,
          duration_seconds: (new Date(workout.end).getTime() - new Date(workout.start).getTime()) / 1000,
          average_heartrate: workout.score?.average_heart_rate,
          max_heartrate: workout.score?.max_heart_rate,
          calories_burned: workout.score?.kilojoule,
          strain_score: workout.score?.strain,
          raw_data: workout,
        });

      if (!error) syncedCount++;
    }

    // Log sync
    await supabase
      .from('fitness_sync_logs')
      .insert({
        user_id: userId,
        integration_type: 'whoop',
        sync_type: 'workouts',
        records_synced: syncedCount,
        status: 'success',
      });

    return { success: true, syncedCount };
  } catch (error) {
    await supabase
      .from('fitness_sync_logs')
      .insert({
        user_id: userId,
        integration_type: 'whoop',
        sync_type: 'workouts',
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });

    throw error;
  }
}

/**
 * Normalize Whoop sport IDs to our activity types
 */
function normalizeWhoopActivityType(sportId: number): string {
  const sportMap: Record<number, string> = {
    1: 'run',
    16: 'bike',
    17: 'swim',
    43: 'tennis',
    12: 'basketball',
    59: 'soccer',
    48: 'yoga',
    52: 'strength',
  };

  return sportMap[sportId] || 'workout';
}

