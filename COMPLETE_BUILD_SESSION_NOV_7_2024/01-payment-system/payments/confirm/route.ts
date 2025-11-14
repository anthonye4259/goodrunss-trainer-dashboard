import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe, calculateFees } from '@/lib/stripe';

// POST /api/payments/confirm - Confirm payment and create payment record
export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId, sessionId } = await req.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'paymentIntentId is required' },
        { status: 400 }
      );
    }

    // Get payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment has not succeeded yet' },
        { status: 400 }
      );
    }

    // Get our payment intent record
    const intent = await prisma.paymentIntent.findUnique({
      where: { stripeIntentId: paymentIntentId },
    });

    if (!intent) {
      return NextResponse.json(
        { error: 'Payment intent not found' },
        { status: 404 }
      );
    }

    // Check if payment already recorded
    const existingPayment = await prisma.payment.findFirst({
      where: { stripePaymentId: paymentIntentId },
    });

    if (existingPayment) {
      return NextResponse.json({
        payment: existingPayment,
        message: 'Payment already confirmed',
      });
    }

    // Calculate fees
    const fees = calculateFees(intent.amount);

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        amount: intent.amount,
        currency: intent.currency,
        status: 'COMPLETED',
        method: 'CARD',
        description: `Training session payment`,
        stripePaymentId: paymentIntentId,
        stripeChargeId: paymentIntent.latest_charge as string,
        stripeFee: fees.stripeFee,
        platformFee: fees.platformFee,
        trainerPayout: fees.trainerPayout,
        paidAt: new Date(),
        trainerId: intent.trainerId,
        appClientId: intent.userId,
        sessionId: sessionId || intent.sessionId,
      },
    });

    // Update session status if provided
    if (sessionId || intent.sessionId) {
      await prisma.trainerSession.update({
        where: { id: sessionId || intent.sessionId! },
        data: {
          status: 'CONFIRMED',
        },
      });
    }

    // Update payment intent status
    await prisma.paymentIntent.update({
      where: { id: intent.id },
      data: {
        status: 'succeeded',
        paymentMethodId: paymentIntent.payment_method as string,
      },
    });

    return NextResponse.json({
      payment,
      message: 'Payment confirmed successfully',
    });
  } catch (error: any) {
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}

