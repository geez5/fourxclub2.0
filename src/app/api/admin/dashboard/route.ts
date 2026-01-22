import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

const ADMIN_EMAIL = 'hello@fourxclub.in'

export async function GET(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    const { searchParams } = new URL(req.url)
    const range = searchParams.get('range') || '30d'
    
    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'all':
        startDate = new Date(0)
        break
    }
    
    // Get stats (implement your actual queries)
    const stats = {
      totalRevenue: { inr: 0, usd: 0 },
      totalUsers: 0,
      coursePurchases: 0,
      activeSubscriptions: 0,
      totalReferrals: 0,
      avgCourseCompletion: 0,
      recentUsers: [],
      recentPurchases: []
    }
    
    return NextResponse.json(stats)
    
  } catch (error) {
    console.error('Admin dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}