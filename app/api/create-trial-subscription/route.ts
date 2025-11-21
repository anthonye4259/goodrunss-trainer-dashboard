/**
 * Create Stripe subscription with 7-day free trial
 * User must enter card but won't be charged until trial ends
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
})

export async function POST(request: NextRequest) {
  try {
    const { email, name, planId } = await request.json()

    if (!email || !planId) {
      return NextResponse.json(
        { error: 'Email and plan ID are required' },
        { status: 400 }
      )
    }

    // Ensure APP_URL has https:// scheme
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://goodrunss-trainer-dashboard.vercel.app'
    const baseUrl = appUrl.startsWith('http') ? appUrl : `https://${appUrl}`

    // Map plan IDs to Stripe Price IDs
    const planPriceMapping: Record<string, { priceId: string; amount: number }> = {
      '6-month': {
        priceId: process.env.STRIPE_PRICE_6_MONTH || 'price_6month',
        amount: 75,
      },
      '3-month': {
        priceId: process.env.STRIPE_PRICE_3_MONTH || 'price_3month',
        amount: 40,
      },
      '1-year': {
        priceId: process.env.STRIPE_PRICE_1_YEAR || 'price_1year',
        amount: 100,
      },
    }

    const plan = planPriceMapping[planId]
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      )
    }

    // Create or retrieve Stripe customer
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    })

    let customer: Stripe.Customer
    if (customers.data.length > 0) {
      customer = customers.data[0]
    } else {
      customer = await stripe.customers.create({
        email: email,
        name: name || undefined,
        metadata: {
          planId: planId,
        },
      })
    }

    // Create Checkout Session with trial
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      
      // 7-day free trial
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          planId: planId,
          userId: email, // Will be updated with actual userId after Clerk creation
        },
      },
      
      // Allow promotion codes
      allow_promotion_codes: true,
      
      // Redirect URLs
      success_url: `${baseUrl}/trial-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/signup?step=plan`,
      
      // Collect payment method (card) but don't charge until trial ends
      payment_method_collection: 'always',
      
      // Customer can cancel anytime
      metadata: {
        planId: planId,
        email: email,
        trialDays: '7',
      },
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    console.error('Create trial subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

