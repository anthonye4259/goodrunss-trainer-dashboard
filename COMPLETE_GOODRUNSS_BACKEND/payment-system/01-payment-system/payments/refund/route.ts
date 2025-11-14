import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe, toStripeAmount } from '@/lib/stripe';

// POST /api/payments/refund - Process refund
export async function POST(req: NextRequest) {
  try {
    const {
      paymentId,
      amount,
      reason,
      initiatedBy,
    } = await req.json();

    if (!paymentId || !initiatedBy) {
      return NextResponse.json(
        { error: 'paymentId and initiatedBy are required' },
        { status: 400 }
      );
    }

    // Get payment
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        session: true,
        refund: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Only completed payments can be refunded' },
        { status: 400 }
      );
    }

    if (payment.refund) {
      return NextResponse.json(
        { error: 'Payment has already been refunded' },
        { status: 400 }
      );
    }

    // Determine refund amount (full or partial)
    const refundAmount = amount || payment.amount;

    if (refundAmount > payment.amount) {
      return NextResponse.json(
        { error: 'Refund amount cannot exceed payment amount' },
        { status: 400 }
      );
    }

    // Create Stripe refund
    const stripeRefund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentId!,
      amount: amount ? toStripeAmount(amount) : undefined, // undefined = full refund
      reason: reason as any || 'requested_by_customer',
      metadata: {
        paymentId,
        initiatedBy,
      },
    });

    // Create refund record
    const refund = await prisma.refund.create({
      data: {
        paymentId,
        amount: refundAmount,
        currency: payment.currency,
        reason: reason || 'requested_by_customer',
        status: stripeRefund.status,
        stripeRefundId: stripeRefund.id,
        initiatedBy,
        processedAt: stripeRefund.status === 'succeeded' ? new Date() : null,
      },
    });

    // Update payment status
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'REFUNDED',
      },
    });

    // Update session status if exists
    if (payment.sessionId) {
      await prisma.trainerSession.update({
        where: { id: payment.sessionId },
        data: {
          status: 'CANCELLED',
        },
      });
    }

    return NextResponse.json({
      refund,
      message: 'Refund processed successfully',
    });
  } catch (error: any) {
    console.error('Error processing refund:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process refund' },
      { status: 500 }
    );
  }
}

// GET /api/payments/refund - Get refund status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'paymentId is required' },
        { status: 400 }
      );
    }

    const refund = await prisma.refund.findUnique({
      where: { paymentId },
      include: {
        payment: true,
      },
    });

    if (!refund) {
      return NextResponse.json(
        { error: 'Refund not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ refund });
  } catch (error: any) {
    console.error('Error fetching refund:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch refund' },
      { status: 500 }
    );
  }
}

