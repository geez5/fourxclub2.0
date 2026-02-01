import Razorpay from 'razorpay'
import crypto from 'crypto'

export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
})

/**
 * Verify Razorpay payment signature (for Orders)
 */
export function verifyRazorpaySignature(
    orderId: string,
    paymentId: string,
    signature: string
): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET!
    const body = orderId + '|' + paymentId
    const expectedSignature = crypto
        .createHmac('sha256', secret)
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
    const secret = process.env.RAZORPAY_KEY_SECRET!
    const body = paymentId + '|' + subscriptionId
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex')
    return expectedSignature === signature
}

/**
 * Verify Razorpay webhook signature
 */
export function verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
): boolean {
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex')
    return expectedSignature === signature
}
