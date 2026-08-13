import Razorpay from 'razorpay'
import crypto from 'crypto'
import { config } from '../config/env.js'

export const razorpay = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
})

// Prices in paise
export const PRICES = {
    course: 599900, // ₹5,999 (Base Course)
    combo: 599900, // ₹5,999 (Base Course - legacy)
    pro: 1499900, // ₹14,999 (Pro Mentorship)
    discord_subscription: 200000, // ₹2,000
}

/**
 * Verify Razorpay payment signature (for Orders)
 */
export function verifyRazorpaySignature(
    orderId: string,
    paymentId: string,
    signature: string
): boolean {
    const body = orderId + '|' + paymentId
    const expectedSignature = crypto
        .createHmac('sha256', config.razorpay.keySecret)
        .update(body)
        .digest('hex')
    return expectedSignature === signature
}

/**
 * Verify Razorpay subscription signature
 */
export function verifySubscriptionSignature(
    subscriptionId: string,
    paymentId: string,
    signature: string
): boolean {
    const body = paymentId + '|' + subscriptionId
    const expectedSignature = crypto
        .createHmac('sha256', config.razorpay.keySecret)
        .update(body)
        .digest('hex')
    return expectedSignature === signature
}

/**
 * Verify Razorpay webhook signature
 */
export function verifyWebhookSignature(
    payload: string,
    signature: string
): boolean {
    const expectedSignature = crypto
        .createHmac('sha256', config.razorpay.webhookSecret)
        .update(payload)
        .digest('hex')
    return expectedSignature === signature
}
