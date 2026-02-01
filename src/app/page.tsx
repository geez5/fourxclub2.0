'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import HomePageClient from '@/components/HomePageClients';

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      // Don't redirect - just track if user is authenticated
      setIsAuthenticated(!!session);
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <HomePageClient isAuthenticated={isAuthenticated} />;
}