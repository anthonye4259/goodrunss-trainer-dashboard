/**
 * Auto-trigger outgoing webhooks when bookings are created/updated
 * This ensures Zapier gets notified automatically
 */

export async function triggerOutgoingWebhooks(
  bookingId: string,
  action: 'created' | 'updated' | 'cancelled'
) {
  try {
    // Call the outgoing webhook endpoint
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/zapier/outgoing`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, action }),
      }
    );

    if (!response.ok) {
      console.error('Failed to trigger outgoing webhooks:', await response.text());
      return { success: false, error: 'Webhook trigger failed' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error triggering outgoing webhooks:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Trigger webhooks in background (non-blocking)
 * Use this when you don't want to wait for webhooks to complete
 */
export function triggerOutgoingWebhooksBackground(
  bookingId: string,
  action: 'created' | 'updated' | 'cancelled'
) {
  // Trigger in background, don't wait
  triggerOutgoingWebhooks(bookingId, action).catch((error) => {
    console.error('Background webhook trigger failed:', error);
  });
}

