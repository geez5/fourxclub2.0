'use client';

import { useSession } from 'next-auth/react';
import HomePageClient from '@/components/HomePageClients';

export default function HomePage() {
  const { status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <HomePageClient isAuthenticated={status === 'authenticated'} />;
}