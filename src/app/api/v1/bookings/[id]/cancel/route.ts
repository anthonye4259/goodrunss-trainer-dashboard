import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/bookings/[id]/cancel
 * Cancel booking (with optional refund)
 */
export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id: bookingId } = await context.params;
    const { userId, reason } = await req.json();

    // Get booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if user owns the booking
    if (booking.customer_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if booking can be cancelled
    if (!['CONFIRMED', 'PENDING'].includes(booking.status)) {
      return NextResponse.json(
        { error: `Cannot cancel booking with status: ${booking.status}` },
        { status: 400 }
      );
    }

    // Check cancellation policy (24 hours before)
    const hoursUntilBooking = (new Date(booking.start_time).getTime() - Date.now()) / (1000 * 60 * 60);
    const canRefund = hoursUntilBooking >= 24;

    let refundId = null;

    // Process refund if applicable
    if (canRefund && booking.stripe_pi_id) {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: booking.stripe_pi_id,
        });
        refundId = refund.id;
      } catch (stripeError) {
        console.error('Stripe refund error:', stripeError);
        // Continue with cancellation even if refund fails
      }
    }

    // Update booking status
    const newStatus = canRefund ? 'REFUNDED' : 'CANCELLED';
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        status: newStatus,
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
        refund_id: refundId,
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to cancel booking', details: updateError.message },
        { status: 500 }
      );
    }

    // Send notification
    await supabase.rpc('send_notification', {
      p_user_id: userId,
      p_type: 'booking_cancelled',
      p_title: 'Booking Cancelled',
      p_body: canRefund 
        ? 'Your booking has been cancelled and refunded.' 
        : 'Your booking has been cancelled. No refund (within 24 hours).',
      p_data: { booking_id: bookingId },
    });

    return NextResponse.json({
      booking: updatedBooking,
      refunded: canRefund,
      refundAmount: canRefund ? booking.price_cents : 0,
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}

