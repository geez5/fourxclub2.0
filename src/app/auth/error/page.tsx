'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    const errorMessages: Record<string, string> = {
        Configuration: 'There is a problem with the server configuration. Please contact support.',
        AccessDenied: 'Access denied. You do not have permission to sign in.',
        Verification: 'The verification link has expired or has already been used.',
        OAuthSignin: 'Error occurred during OAuth sign in. Please try again.',
        OAuthCallback: 'Error occurred during OAuth callback. Please try again.',
        OAuthCreateAccount: 'Could not create OAuth account. Please try again.',
        EmailCreateAccount: 'Could not create email account. Please try again.',
        Callback: 'Error occurred during callback. Please try again.',
        OAuthAccountNotLinked: 'This email is already associated with another account.',
        Default: 'An error occurred during sign in. Please try again.',
    }

    const message = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="max-w-md w-full mx-4 p-8 bg-zinc-900 rounded-2xl border border-zinc-800 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Authentication Error</h1>
                <p className="text-zinc-400 mb-6">{message}</p>
                {error && (
                    <p className="text-xs text-zinc-500 mb-6">Error code: {error}</p>
                )}
                <Link
                    href="/auth/signin"
                    className="inline-block w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                    Try Again
                </Link>
                <Link
                    href="/"
                    className="inline-block mt-4 text-zinc-400 hover:text-white transition-colors"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    )
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-white">Loading...</div>
            </div>
        }>
            <ErrorContent />
        </Suspense>
    )
}
