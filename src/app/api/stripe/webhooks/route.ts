import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

// POST /api/stripe/webhooks - Handle Stripe webhook events
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET is not set');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      // Payment intents
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      // Stripe Connect
      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      // Refunds & disputes
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object as Stripe.Dispute);
        break;

      // Subscriptions
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handle successful payment
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment succeeded:', paymentIntent.id);

    // Update payment intent status
    await prisma.paymentIntent.updateMany({
      where: { stripeIntentId: paymentIntent.id },
      data: {
        status: 'succeeded',
        paymentMethodId: paymentIntent.payment_method as string,
      },
    });

    // Note: Payment record is created by /api/payments/confirm
    // This webhook is for backup/verification
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

// Handle failed payment
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment failed:', paymentIntent.id);

    // Update payment intent status
    await prisma.paymentIntent.updateMany({
      where: { stripeIntentId: paymentIntent.id },
      data: {
        status: 'failed',
      },
    });

    // Update session status if exists
    const intent = await prisma.paymentIntent.findFirst({
      where: { stripeIntentId: paymentIntent.id },
    });

    if (intent?.sessionId) {
      await prisma.trainerSession.update({
        where: { id: intent.sessionId },
        data: { status: 'CANCELLED' },
      });
    }

    // TODO: Send notification to user about failed payment
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

// Handle Stripe Connect account updates
async function handleAccountUpdated(account: Stripe.Account) {
  try {
    console.log('Account updated:', account.id);

    // Update Stripe account in database
    await prisma.stripeAccount.updateMany({
      where: { stripeAccountId: account.id },
      data: {
        detailsSubmitted: account.details_submitted || false,
        chargesEnabled: account.charges_enabled || false,
        payoutsEnabled: account.payouts_enabled || false,
        currentlyDue: (account.requirements?.currently_due as string[]) || [],
        eventuallyDue: (account.requirements?.eventually_due as string[]) || [],
        pastDue: (account.requirements?.past_due as string[]) || [],
        pendingVerification: (account.requirements?.pending_verification as string[]) || [],
        email: account.email || null,
        country: account.country || null,
        defaultCurrency: account.default_currency || null,
        businessName: account.business_profile?.name || null,
        businessUrl: account.business_profile?.url || null,
        supportPhone: account.business_profile?.support_phone || null,
        supportEmail: account.business_profile?.support_email || null,
        payoutSchedule: account.settings?.payouts as any,
      },
    });

    // TODO: If account is now enabled, send notification to trainer
  } catch (error) {
    console.error('Error handling account update:', error);
  }
}

// Handle charge refunded
async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    console.log('Charge refunded:', charge.id);

    // Update refund status
    await prisma.refund.updateMany({
      where: { stripeRefundId: charge.refunds?.data[0]?.id },
      data: {
        status: 'succeeded',
        processedAt: new Date(),
      },
    });

    // TODO: Send notification to user about refund
  } catch (error) {
    console.error('Error handling charge refund:', error);
  }
}

// Handle dispute created
async function handleDisputeCreated(dispute: Stripe.Dispute) {
  try {
    console.log('Dispute created:', dispute.id);

    // TODO: Send urgent notification to admin
    // TODO: Flag payment for review
    // TODO: Contact trainer

    // Update payment record
    await prisma.payment.updateMany({
      where: { stripeChargeId: dispute.charge as string },
      data: {
        status: 'FAILED', // Or create new status: DISPUTED
      },
    });
  } catch (error) {
    console.error('Error handling dispute:', error);
  }
}

// ========================================
// SUBSCRIPTION WEBHOOK HANDLERS
// ========================================

// Handle checkout session completed (new subscription)
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('💎 Checkout session completed:', session.id);

    if (session.mode !== 'subscription') {
      return; // Not a subscription checkout
    }

    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    const planName = session.metadata?.planName;

    if (!userId || !planId) {
      console.error('Missing userId or planId in session metadata');
      return;
    }

    // Get subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      session.subscription as string,
      { expand: ['items.data.price'] }
    );

    // Get plan from database
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      console.error('Plan not found:', planId);
      return;
    }

    // Create user subscription
    const subscription = await prisma.userSubscription.create({
      data: {
        userId,
        userEmail: session.customer_email || '',
        planId: plan.id,
        planName: plan.displayName,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: stripeSubscription.items.data[0].price.id,
        status: stripeSubscription.status,
        billingCycle: stripeSubscription.items.data[0].price.recurring?.interval === 'year' ? 'yearly' : 'monthly',
        currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
        trialStart: (stripeSubscription as any).trial_start ? new Date((stripeSubscription as any).trial_start * 1000) : null,
        trialEnd: (stripeSubscription as any).trial_end ? new Date((stripeSubscription as any).trial_end * 1000) : null,
      },
    });

    // Log history
    await prisma.subscriptionHistory.create({
      data: {
        userId,
        userEmail: session.customer_email || '',
        eventType: stripeSubscription.status === 'trialing' ? 'trial_started' : 'subscribed',
        toPlanId: plan.id,
        toPlanName: plan.displayName,
        amount: (session.amount_total || 0) / 100,
        currency: session.currency || 'usd',
        billingCycle: subscription.billingCycle,
        stripeEventId: session.id,
        stripeSubscriptionId: stripeSubscription.id,
      },
    });

    console.log('✅ Subscription created:', subscription.id);
  } catch (error) {
    console.error('❌ Error handling checkout session:', error);
  }
}

// Handle subscription created
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    console.log('💎 Subscription created:', subscription.id);
    // This is usually handled by checkout.session.completed
    // But we can use it as a backup
  } catch (error) {
    console.error('❌ Error handling subscription creation:', error);
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription) {
  try {
    console.log('💎 Subscription updated:', stripeSubscription.id);

    // Update subscription in database
    const subscription = await prisma.userSubscription.findUnique({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (!subscription) {
      console.error('Subscription not found:', stripeSubscription.id);
      return;
    }

    // Update status and period
    await prisma.userSubscription.update({
      where: { id: subscription.id },
      data: {
        status: stripeSubscription.status,
        currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: (stripeSubscription as any).cancel_at_period_end,
      },
    });

    console.log('✅ Subscription updated:', subscription.id);
  } catch (error) {
    console.error('❌ Error handling subscription update:', error);
  }
}

// Handle subscription deleted (canceled)
async function handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription) {
  try {
    console.log('💎 Subscription deleted:', stripeSubscription.id);

    const subscription = await prisma.userSubscription.findUnique({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (!subscription) {
      console.error('Subscription not found:', stripeSubscription.id);
      return;
    }

    // Update status to canceled
    await prisma.userSubscription.update({
      where: { id: subscription.id },
      data: {
        status: 'canceled',
        canceledAt: new Date(),
      },
    });

    // Log history
    await prisma.subscriptionHistory.create({
      data: {
        userId: subscription.userId,
        userEmail: subscription.userEmail,
        eventType: 'canceled',
        fromPlanId: subscription.planId,
        fromPlanName: subscription.planName,
        stripeEventId: stripeSubscription.id,
        stripeSubscriptionId: stripeSubscription.id,
      },
    });

    console.log('✅ Subscription canceled:', subscription.id);
  } catch (error) {
    console.error('❌ Error handling subscription deletion:', error);
  }
}

// Handle trial ending soon (3 days before)
async function handleTrialWillEnd(stripeSubscription: Stripe.Subscription) {
  try {
    console.log('💎 Trial will end:', stripeSubscription.id);

    const subscription = await prisma.userSubscription.findUnique({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (!subscription) {
      console.error('Subscription not found:', stripeSubscription.id);
      return;
    }

    // TODO: Send notification to user about trial ending
    // Example: "Your 14-day trial ends in 3 days. Add payment method to continue."

    console.log('📧 Trial ending notification sent to:', subscription.userEmail);
  } catch (error) {
    console.error('❌ Error handling trial will end:', error);
  }
}

// Handle successful invoice payment (renewal)
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log('💳 Invoice payment succeeded:', invoice.id);

    if (!(invoice as any).subscription) {
      return; // Not a subscription invoice
    }

    const subscription = await prisma.userSubscription.findUnique({
      where: { stripeSubscriptionId: (invoice as any).subscription as string },
    });

    if (!subscription) {
      console.error('Subscription not found:', (invoice as any).subscription);
      return;
    }

    // Log renewal in history
    await prisma.subscriptionHistory.create({
      data: {
        userId: subscription.userId,
        userEmail: subscription.userEmail,
        eventType: 'renewed',
        toPlanId: subscription.planId,
        toPlanName: subscription.planName,
        amount: (invoice.amount_paid || 0) / 100,
        currency: invoice.currency || 'usd',
        billingCycle: subscription.billingCycle,
        stripeEventId: invoice.id,
        stripeSubscriptionId: (invoice as any).subscription as string,
      },
    });

    console.log('✅ Subscription renewed:', subscription.id);
  } catch (error) {
    console.error('❌ Error handling invoice payment:', error);
  }
}

// Handle failed invoice payment
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log('💳 Invoice payment failed:', invoice.id);

    if (!(invoice as any).subscription) {
      return; // Not a subscription invoice
    }

    const subscription = await prisma.userSubscription.findUnique({
      where: { stripeSubscriptionId: (invoice as any).subscription as string },
    });

    if (!subscription) {
      console.error('Subscription not found:', (invoice as any).subscription);
      return;
    }

    // Update status to past_due
    await prisma.userSubscription.update({
      where: { id: subscription.id },
      data: {
        status: 'past_due',
      },
    });

    // TODO: Send notification to user about failed payment
    // Example: "Your payment failed. Please update your payment method."

    console.log('❌ Subscription payment failed:', subscription.id);
  } catch (error) {
    console.error('❌ Error handling invoice payment failure:', error);
  }
}

// Body parsing is disabled by default in Next.js App Router
// No config export needed

