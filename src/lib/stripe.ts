import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
  appInfo: {
    name: 'FourXClub',
    version: '1.0.0',
  },
})

// Product prices
export const PRICES = {
  COURSE: {
    INR: {
      priceId: process.env.STRIPE_COURSE_PRICE_ID_INR!,
      amount: 149900, // ₹1,499 in paise
      currency: 'inr'
    },
    USD: {
      priceId: process.env.STRIPE_COURSE_PRICE_ID_USD!,
      amount: 1800, // $18 in cents (approx ₹1,499)
      currency: 'usd'
    }
  },
  DISCORD: {
    INR: {
      priceId: process.env.STRIPE_DISCORD_PRICE_ID_INR!,
      amount: 200000, // ₹2,000 in paise
      currency: 'inr'
    },
    USD: {
      priceId: process.env.STRIPE_DISCORD_PRICE_ID_USD!,
      amount: 2400, // $24 in cents (approx ₹2,000)
      currency: 'usd'
    }
  }
}

// Verify webhook signature
export function verifyWebhook(
  payload: string,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}