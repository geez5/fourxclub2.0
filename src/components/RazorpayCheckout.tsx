'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface RazorpayCheckoutProps {
  currency?: 'INR' | 'USD'
  buttonText?: string
  className?: string
}

export default function RazorpayCheckout({ 
  currency = 'INR',
  buttonText = 'Buy Course',
  className = ''
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCheckout = async () => {
    try {
      setLoading(true)

      // Create order
      const response = await fetch('/api/checkout/course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        document.body.appendChild(script)
        await new Promise((resolve) => {
          script.onload = resolve
        })
      }

      // Razorpay options
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: 'FourX Club',
        description: 'Course Purchase',
        image: '/logo.png', // Add your logo
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/checkout/course', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            })

            const verifyData = await verifyResponse.json()

            if (verifyResponse.ok) {
              // Payment successful
              router.push('/dashboard?success=true')
            } else {
              throw new Error(verifyData.error || 'Payment verification failed')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            alert('Payment verification failed. Please contact support.')
            router.push('/course?error=verification_failed')
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: async function() {
            // Payment cancelled by user
            await fetch('/api/checkout/course', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: data.orderId,
                reason: 'Payment cancelled by user'
              })
            })
            router.push('/course?canceled=true')
          }
        }
      }

      const rzp = new window.Razorpay(options)
      
      rzp.on('payment.failed', async function (response: any) {
        // Payment failed
        await fetch('/api/checkout/course', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: data.orderId,
            reason: response.error.description,
            error: response.error.code
          })
        })
        
        alert(`Payment failed: ${response.error.description}`)
        router.push('/course?error=payment_failed')
      })

      rzp.open()
      
    } catch (error) {
      console.error('Checkout error:', error)
      alert(error instanceof Error ? error.message : 'Failed to initiate checkout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={className || 'px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50'}
    >
      {loading ? 'Processing...' : buttonText}
    </button>
  )
}