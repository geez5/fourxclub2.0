import React from 'react'
import { createOrderClient } from '@/lib/paymentClient'

export default function CheckoutButton({ amount, currency = 'INR' }: { amount: number; currency?: string }) {
  async function handleClick() {
    try {
      const { order, keyId } = await createOrderClient(amount, currency, `rcpt_${Date.now()}`)
      console.log('Order created', order, keyId)
      // TODO: pass order.id and keyId to Razorpay Checkout
    } catch (err) {
      console.error('Create order error', err)
    }
  }

  return <button onClick={handleClick}>Pay {amount} {currency}</button>
}