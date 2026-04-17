'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { useSession } from 'next-auth/react'


interface RazorpayResponse {
    razorpay_payment_id: string
    razorpay_order_id?: string
    razorpay_subscription_id?: string
    razorpay_signature: string
}

interface RazorpayOptions {
    key: string
    amount?: number
    currency: string
    name: string
    description?: string
    image?: string
    order_id?: string
    subscription_id?: string
    handler: (response: RazorpayResponse) => void
    prefill?: {
        name?: string
        email?: string
        contact?: string
    }
    notes?: Record<string, string>
    theme?: {
        color?: string
    }
    modal?: {
        ondismiss?: () => void
    }
}

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => { open: () => void }
    }
}

interface RazorpayCheckoutProps {
    type: 'course' | 'combo' | 'pro' | 'discord_subscription'
    buttonText?: string
    className?: string
    onSuccess?: () => void
    onFailure?: (error: string) => void
}

export default function RazorpayCheckout({
    type,
    buttonText,
    className = '',
    onSuccess,
    onFailure,
}: RazorpayCheckoutProps) {
    const { data: session } = useSession()
    const [loading, setLoading] = useState(false)
    const [scriptLoaded, setScriptLoaded] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Check if script is already loaded
        if (typeof window !== 'undefined' && window.Razorpay) {
            setScriptLoaded(true)
        }
    }, [])

    const defaultButtonText = type === 'course' ? 'Get Started — ₹1,499' : type === 'combo' ? 'Level Up — ₹2,499' : type === 'pro' ? 'Go Pro — ₹4,999' : 'Subscribe — ₹2,000/month'

    const handlePayment = async () => {
        // Double check script availability
        if (typeof window === 'undefined' || !window.Razorpay) {
            const msg = !scriptLoaded
                ? 'Payment system is still loading. Please wait a moment and try again.'
                : 'Razorpay script not found. Please refresh the page.';

            if (onFailure) onFailure(msg);
            else alert(msg);
            return
        }

        setLoading(true)

        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' }
            // Cookie-based auth is used automatically via credentials: 'include'

            // 1. Create Order or Subscription on backend
            const response = await fetch(`/api/payments/create`, {
                method: 'POST',
                credentials: 'include',
                headers,
                body: JSON.stringify({ type }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to initialize payment')
            }

            const { method, orderId, subscriptionId, amount, keyId, prefill } = data

            if (!keyId) {
                throw new Error('Payment gateway key is missing. Please contact support.')
            }

            // 2. Configure Razorpay Options
            const options: RazorpayOptions = {
                key: keyId,
                amount: amount,
                currency: 'INR',
                name: 'FourX Club',
                description: type === 'course' ? 'Base Course Access' : type === 'combo' ? 'Intermediate Trading Package' : type === 'pro' ? 'Pro Mentorship Program' : 'Discord Community Subscription',
                image: '/fxclogo.webp',
                prefill: {
                    name: prefill?.name || '',
                    email: prefill?.email || '',
                },
                theme: {
                    color: '#6BBF6A',
                },
                modal: {
                    ondismiss: () => setLoading(false),
                },
                handler: async (response: RazorpayResponse) => {
                    try {
                        setLoading(true) // Set loading during verification
                        // 3. Verify payment on backend
                        const verifyResponse = await fetch(`/api/payments/verify`, {
                            method: 'POST',
                            credentials: 'include',
                            headers,
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_subscription_id: response.razorpay_subscription_id,
                            }),
                        })

                        const verifyData = await verifyResponse.json()

                        if (verifyResponse.ok && verifyData.success) {
                            if (onSuccess) {
                                onSuccess()
                            } else {
                                router.push(`/dashboard?payment=success&type=${type}`)
                                router.refresh()
                            }
                        } else {
                            throw new Error(verifyData.error || 'Payment verification failed')
                        }
                    } catch (error) {
                        console.error('Payment verification error:', error)
                        const msg = error instanceof Error ? error.message : 'Payment verification failed'
                        onFailure?.(msg)
                        router.push('/dashboard?payment=failed')
                    } finally {
                        setLoading(false)
                    }
                },
            }

            // Add conditional ID
            if (method === 'subscription') {
                options.subscription_id = subscriptionId
            } else {
                options.order_id = orderId
            }

            const razorpayInstance = new window.Razorpay(options)
            razorpayInstance.open()
        } catch (error) {
            console.error('Payment error:', error)
            const errorMessage = error instanceof Error ? error.message : 'Payment failed'
            onFailure?.(errorMessage)
            alert(errorMessage) // Add a fallback alert so user knows why it failed
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                onLoad={() => {
                    console.log('Razorpay script loaded successfully')
                    setScriptLoaded(true)
                }}
                onError={(e) => {
                    console.error('Razorpay script failed to load', e)
                    onFailure?.('Failed to load payment system. Please disable ad-blockers and refresh.')
                }}
                strategy="afterInteractive"
            />
            <button
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handlePayment()
                }}
                disabled={loading}
                className={className || 'px-8 py-4 bg-green-500 text-black font-semibold rounded-xl'}
                style={!className ? { backgroundColor: '#6BBF6A', color: '#0a0a0a' } : undefined}
            >
                {loading ? 'Processing...' : (buttonText || defaultButtonText)}
            </button>
        </>
    )
}
