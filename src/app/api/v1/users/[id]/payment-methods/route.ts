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
 * GET /api/v1/users/[id]/payment-methods
 * Get user's saved payment methods
 */
export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id: userId } = await context.params;

    const { data: paymentMethods, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to get payment methods', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ paymentMethods: paymentMethods || [] });
  } catch (error) {
    console.error('Get payment methods error:', error);
    return NextResponse.json(
      { error: 'Failed to get payment methods' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/users/[id]/payment-methods
 * Add new payment method
 */
export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id: userId } = await context.params;
    const { paymentMethodId, setAsDefault } = await req.json();

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'paymentMethodId is required' },
        { status: 400 }
      );
    }

    // Get payment method details from Stripe
    const stripePaymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    if (!stripePaymentMethod) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      );
    }

    // Save to database
    const { data: paymentMethod, error } = await supabase
      .from('payment_methods')
      .insert({
        user_id: userId,
        stripe_pm_id: paymentMethodId,
        type: stripePaymentMethod.type,
        brand: stripePaymentMethod.card?.brand,
        last4: stripePaymentMethod.card?.last4,
        exp_month: stripePaymentMethod.card?.exp_month,
        exp_year: stripePaymentMethod.card?.exp_year,
        is_default: setAsDefault || false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save payment method', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ paymentMethod }, { status: 201 });
  } catch (error) {
    console.error('Add payment method error:', error);
    return NextResponse.json(
      { error: 'Failed to add payment method' },
      { status: 500 }
    );
  }
}

