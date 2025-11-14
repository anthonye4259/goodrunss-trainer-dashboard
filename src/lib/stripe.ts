/**
 * Stripe SDK Configuration
 * 
 * Setup:
 * 1. Get keys from: https://dashboard.stripe.com/apikeys
 * 2. Add to .env:
 *    STRIPE_SECRET_KEY=sk_test_...
 *    STRIPE_PUBLISHABLE_KEY=pk_test_...
 *    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
 *    STRIPE_WEBHOOK_SECRET=whsec_...
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
});

// Platform fee percentage (GoodRunss takes 15%)
export const PLATFORM_FEE_PERCENTAGE = 0.15;

// Calculate fees
export function calculateFees(amount: number) {
  const platformFee = Math.round(amount * PLATFORM_FEE_PERCENTAGE);
  const stripeFee = Math.round(amount * 0.029 + 30); // Stripe: 2.9% + $0.30
  const trainerPayout = amount - platformFee - stripeFee;
  
  return {
    platformFee,
    stripeFee,
    trainerPayout,
    total: amount,
  };
}

// Convert amount to Stripe format (cents)
export function toStripeAmount(amount: number): number {
  return Math.round(amount * 100);
}

// Convert Stripe amount to dollars
export function fromStripeAmount(amount: number): number {
  return amount / 100;
}

