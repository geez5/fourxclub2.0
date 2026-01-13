import Razorpay from 'razorpay'
import crypto from 'crypto'

// Export the Razorpay instance
export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
})

const ZERO_DECIMAL_CURRENCIES = new Set([
  'BIF','CLP','DJF','GNF','JPY','KMF','KRW','PYG','RWF','UGX','VND','VUV','XAF','XOF','XPF'
])

function toSmallestUnit(amount: number, currency = 'INR') {
  const cur = (currency || 'INR').toUpperCase()
  if (ZERO_DECIMAL_CURRENCIES.has(cur)) return Math.round(amount)
  return Math.round(amount * 100)
}

export async function createOrder(amountMajor: number, currency = process.env.PAYMENT_CURRENCY || 'INR', receipt = '') {
  const cur = (currency || 'INR').toUpperCase()
  const amount = toSmallestUnit(amountMajor, cur)
  const order = await razorpay.orders.create({
    amount,
    currency: cur,
    receipt,
    payment_capture: true
  })
  return order
}

export function verifyWebhookSignature(payload: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || ''
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  return expected === signature
}

// Course prices
export const PRICES = {
  COURSE: {
    INR: {
      amount: 149900, // ₹1,499 in paise
      currency: 'INR',
    },
    USD: {
      amount: 1800, // $18 in cents
      currency: 'USD',
    },
  }
}

// Discord subscription plan IDs
export const DISCORD_PLANS = {
  INR: process.env.RAZORPAY_DISCORD_PLAN_ID_INR!,
  USD: process.env.RAZORPAY_DISCORD_PLAN_ID_USD!,
}