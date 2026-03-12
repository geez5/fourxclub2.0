'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, RefreshCw, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [errorMessage, setErrorMessage] = useState('An authentication error occurred.');

  useEffect(() => {
    if (error) {
      console.error('[AUTH ERROR]:', error);
      
      switch (error) {
        case 'Configuration':
          setErrorMessage('There is a problem with the server authentication configuration.');
          break;
        case 'AccessDenied':
          setErrorMessage('You do not have permission to sign in.');
          break;
        case 'Verification':
          setErrorMessage('The sign in link is no longer valid or has expired.');
          break;
        case 'OAuthSignin':
          setErrorMessage('Error starting the Google sign-in process.');
          break;
        case 'OAuthCallback':
          setErrorMessage('Error receiving the callback from Google. This is usually temporary.');
          break;
        case 'OAuthCreateAccount':
          setErrorMessage('Could not create your account in the database.');
          break;
        case 'Callback':
          setErrorMessage('Error during the sign-in callback process.');
          break;
        case 'Default':
        default:
          setErrorMessage(`An unexpected authentication error occurred (${error}).`);
          break;
      }
    }
  }, [error]);

  return (
    <div className="bg-[#0f1738] border border-[#a78bfa]/30 rounded-2xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden">
      {/* Glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#ef4444]/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-[#ef4444]/10 rounded-full flex items-center justify-center mb-6 border border-[#ef4444]/20">
          <ShieldAlert className="w-8 h-8 text-[#ef4444]" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-3">Authentication Failed</h1>
        
        <div className="bg-[#0b1026] border border-[#a78bfa]/10 rounded-lg p-4 mb-8 w-full">
          <p className="text-[#e0e7ff] text-sm leading-relaxed font-medium">
            {errorMessage}
          </p>
          {error && (
            <p className="text-xs text-[#94a3b8] mt-2 font-mono pb-1">
              Error code: {error}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => signIn('google')}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#00c9ff] hover:bg-[#00b0df] text-[#0b1026] text-sm font-bold rounded-lg transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          
          <Link href="/">
            <button className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-transparent border border-[#a78bfa]/30 hover:bg-[#a78bfa]/10 text-white text-sm font-medium rounded-lg transition-all duration-200">
              <ArrowLeft className="w-4 h-4" />
              Return to Homepage
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-[#0b1026] flex items-center justify-center p-4 relative">
      {/* Background elements to match the site theme */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[100px] bg-[#00c9ff]/5" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[100px] bg-[#a78bfa]/5" />
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center text-[#e0e7ff]">
          <RefreshCw className="w-8 h-8 animate-spin text-[#00c9ff]" />
        </div>
      }>
        <ErrorContent />
      </Suspense>
    </div>
  );
}
