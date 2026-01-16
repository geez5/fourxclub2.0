'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DemoCheckoutProps {
  currency?: 'INR' | 'USD'
  buttonText?: string
  className?: string
}

export default function DemoCheckout({ 
  currency = 'INR',
  buttonText = 'Get Access',
  className = ''
}: DemoCheckoutProps) {
  const [loading, setLoading] = useState(false)
  const [showAccessForm, setShowAccessForm] = useState(false)
  const [accessCode, setAccessCode] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleCheckout = async () => {
    setShowAccessForm(true)
  }

  const handleAccessCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Verify access code with your API
      const response = await fetch('/api/checkout/verify-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode })
      })

      const data = await response.json()

      if (response.ok && data.valid) {
        // Access granted - redirect to dashboard
        router.push('/dashboard?access=granted')
      } else {
        setError(data.error || 'Invalid access code. Please contact support.')
      }
    } catch (error) {
      console.error('Access verification error:', error)
      setError('Failed to verify access code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (showAccessForm) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 className="text-2xl font-bold mb-4">Access FourX Club</h2>
          <p className="text-gray-600 mb-6">
            Payment system launching soon! For demo access, enter your access code below.
          </p>
          
          <form onSubmit={handleAccessCodeSubmit} className="space-y-4">
            <div>
              <label htmlFor="accessCode" className="block text-sm font-medium mb-2">
                Access Code
              </label>
              <input
                type="text"
                id="accessCode"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="Enter your access code"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAccessForm(false)
                  setError('')
                  setAccessCode('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !accessCode}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Access'}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Don't have an access code?{' '}
              <a href="mailto:support@fourxclub.in" className="text-blue-600 hover:underline">
                Contact us
              </a>
            </p>
          </div>
        </div>
      </div>
    )
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