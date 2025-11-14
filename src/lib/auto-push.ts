/**
 * Auto-Push to External Systems
 * Automatically pushes bookings to facility's external system when created via GoodRunss
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Auto-push booking to facility's external system
 * Call this after creating a booking in GoodRunss
 */
export async function autoPushBooking(
  facilityId: string,
  booking: {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    resource_name?: string; // court name, tee, etc.
    notes?: string;
  }
) {
  try {
    console.log(`Auto-push: Checking integrations for facility ${facilityId}`);
    
    // Get all active scraper integrations for this facility
    const { data: integrations, error } = await supabase
      .from('facility_integrations')
      .select('*')
      .eq('facility_id', facilityId)
      .in('integration_type', ['courtreserve', 'golfnow', 'podplay'])
      .eq('is_active', true);
    
    if (error || !integrations || integrations.length === 0) {
      console.log(`No scraper integrations found for facility ${facilityId}`);
      return { success: true, pushed: false, reason: 'No integrations' };
    }
    
    // Push to each integration
    const results = [];
    
    for (const integration of integrations) {
      try {
        console.log(`Pushing to ${integration.integration_type} for facility ${facilityId}`);
        
        // Parse dates
        const startDateTime = new Date(booking.start_time);
        const endDateTime = new Date(booking.end_time);
        const date = startDateTime.toISOString().split('T')[0]; // YYYY-MM-DD
        const startTime = startDateTime.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        }); // "2:00 PM"
        const endTime = endDateTime.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        });
        
        // Prepare booking data
        const bookingData = {
          courtName: booking.resource_name || 'Court 1',
          date,
          startTime,
          endTime,
          playerName: booking.customer_name || 'GoodRunss User',
          playerEmail: booking.customer_email,
          playerPhone: booking.customer_phone,
          sport: 'tennis', // Default, could be extracted from notes
          players: 4, // Default for golf
          holes: 18, // Default for golf
          bookingType: 'private', // Default for PodPlay
        };
        
        // Call push API
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/scraper/push`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              facilityId,
              scraperType: integration.integration_type,
              booking: bookingData,
            }),
          }
        );
        
        const result = await response.json();
        
        if (response.ok) {
          console.log(`✅ Pushed to ${integration.integration_type}: ${result.externalId}`);
          
          // Update booking with external ID
          await supabase
            .from('bookings')
            .update({
              external_id: result.externalId,
              external_source: integration.integration_type,
            })
            .eq('id', booking.id);
          
          results.push({
            integrationType: integration.integration_type,
            success: true,
            externalId: result.externalId,
          });
        } else {
          console.error(`❌ Failed to push to ${integration.integration_type}:`, result.error);
          results.push({
            integrationType: integration.integration_type,
            success: false,
            error: result.error,
          });
        }
      } catch (error) {
        console.error(`Error pushing to ${integration.integration_type}:`, error);
        results.push({
          integrationType: integration.integration_type,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    return {
      success: true,
      pushed: true,
      results,
    };
    
  } catch (error) {
    console.error('Auto-push error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

