import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe, toStripeAmount, calculateFees } from '@/lib/stripe';

// POST /api/payments/create-intent - Create payment intent for booking
export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      trainerId,
      sessionId,
      amount,
      currency,
      description,
    } = await req.json();

    if (!userId || !trainerId || !amount) {
      return NextResponse.json(
        { error: 'userId, trainerId, and amount are required' },
        { status: 400 }
      );
    }

    // Get trainer's Stripe account
    const stripeAccount = await prisma.stripeAccount.findUnique({
      where: { userId: trainerId },
    });

    if (!stripeAccount) {
      return NextResponse.json(
        { error: 'Trainer has not set up payments yet' },
        { status: 400 }
      );
    }

    if (!stripeAccount.chargesEnabled) {
      return NextResponse.json(
        { error: 'Trainer is not yet enabled to receive payments' },
        { status: 400 }
      );
    }

    // Calculate fees
    const fees = calculateFees(amount);

    // Convert currency if needed (using our i18n currency conversion)
    const finalCurrency = currency || 'USD';

    // Create payment intent with application fee
    const paymentIntent = await stripe.paymentIntents.create({
      amount: toStripeAmount(amount),
      currency: finalCurrency.toLowerCase(),
      application_fee_amount: toStripeAmount(fees.platformFee),
      transfer_data: {
        destination: stripeAccount.stripeAccountId,
      },
      metadata: {
        userId,
        trainerId,
        sessionId: sessionId || '',
        platform: 'goodrunss',
      },
      description: description || `Training session with trainer`,
    });

    // Save payment intent to database
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Payment intents expire after 24h

    await prisma.paymentIntent.create({
      data: {
        stripeIntentId: paymentIntent.id,
        amount,
        currency: finalCurrency,
        status: paymentIntent.status,
        userId,
        trainerId,
        sessionId,
        clientSecret: paymentIntent.client_secret || '',
        metadata: {
          fees,
          description,
        },
        expiresAt,
      },
    });

    return NextResponse.json({
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount,
      currency: finalCurrency,
      fees: {
        platform: fees.platformFee,
        stripe: fees.stripeFee,
        trainer: fees.trainerPayout,
      },
      message: 'Payment intent created successfully',
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

