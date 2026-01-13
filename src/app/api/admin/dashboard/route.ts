import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs'
import { supabaseAdmin } from '@/lib/supabase'

// ADMIN EMAIL - Only this email can access admin dashboard
const ADMIN_EMAIL = 'hello@fourxclub.in'

export async function GET(req: Request) {
  try {
    const { userId } = auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if user is admin
    const userEmail = user.emailAddresses[0].emailAddress
    if (userEmail !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access only' },
        { status: 403 }
      )
    }
    
    // Get time range from query params
    const { searchParams } = new URL(req.url)
    const range = searchParams.get('range') || '30d'
    
    // Calculate date filter
    const dateFilter = getDateFilter(range)
    
    // Fetch all stats in parallel
    const [
      totalUsers,
      coursePurchases,
      activeSubscriptions,
      totalReferrals,
      courseCompletion,
      recentUsers,
      recentPurchases,
      topReferrers,
      monthlyRevenue
    ] = await Promise.all([
      getTotalUsers(dateFilter),
      getCoursePurchases(dateFilter),
      getActiveSubscriptions(),
      getTotalReferrals(),
      getCourseCompletion(),
      getRecentUsers(),
      getRecentPurchases(),
      getTopReferrers(),
      getMonthlyRevenue()
    ])
    
    return NextResponse.json({
      totalRevenue: coursePurchases.revenue,
      totalUsers: totalUsers.count,
      coursePurchases: coursePurchases.count,
      activeSubscriptions: activeSubscriptions.count,
      totalReferrals: totalReferrals.count,
      avgCourseCompletion: courseCompletion.average,
      recentUsers,
      recentPurchases,
      topReferrers,
      monthlyRevenue
    })
    
  } catch (error) {
    console.error('Admin dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

function getDateFilter(range: string): string {
  const now = new Date()
  let date: Date
  
  switch (range) {
    case '7d':
      date = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      date = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case '90d':
      date = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case '1y':
      date = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      break
    default:
      return '1900-01-01' // All time
  }
  
  return date.toISOString()
}

async function getTotalUsers(dateFilter: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id', { count: 'exact' })
    .gte('created_at', dateFilter)
  
  return {
    count: data?.length || 0
  }
}

async function getCoursePurchases(dateFilter: string) {
  const { data } = await supabaseAdmin
    .from('course_purchases')
    .select('amount, currency')
    .eq('status', 'completed')
    .gte('purchased_at', dateFilter)
  
  let inrTotal = 0
  let usdTotal = 0
  
  data?.forEach(purchase => {
    if (purchase.currency === 'inr') {
      inrTotal += purchase.amount
    } else {
      usdTotal += purchase.amount
    }
  })
  
  return {
    count: data?.length || 0,
    revenue: {
      inr: inrTotal,
      usd: usdTotal
    }
  }
}

async function getActiveSubscriptions() {
  const { data } = await supabaseAdmin
    .from('discord_subscriptions')
    .select('id', { count: 'exact' })
    .in('status', ['active', 'trialing'])
    .gte('current_period_end', new Date().toISOString())
  
  return {
    count: data?.length || 0
  }
}

async function getTotalReferrals() {
  const { data } = await supabaseAdmin
    .from('referral_uses')
    .select('id', { count: 'exact' })
  
  return {
    count: data?.length || 0
  }
}

async function getCourseCompletion() {
  // Get all users with course purchases
  const { data: purchases } = await supabaseAdmin
    .from('course_purchases')
    .select('user_id')
    .eq('status', 'completed')
  
  if (!purchases || purchases.length === 0) {
    return { average: 0 }
  }
  
  // Get video progress for these users
  const userIds = purchases.map(p => p.user_id)
  const { data: progress } = await supabaseAdmin
    .from('video_progress')
    .select('user_id, completed')
    .in('user_id', userIds)
  
  // Calculate average completion
  const completionByUser = new Map()
  
  progress?.forEach(p => {
    if (!completionByUser.has(p.user_id)) {
      completionByUser.set(p.user_id, { completed: 0, total: 10 })
    }
    if (p.completed) {
      completionByUser.get(p.user_id).completed++
    }
  })
  
  let totalCompletion = 0
  completionByUser.forEach(user => {
    totalCompletion += (user.completed / user.total) * 100
  })
  
  const average = completionByUser.size > 0 
    ? Math.round(totalCompletion / completionByUser.size)
    : 0
  
  return { average }
}

async function getRecentUsers() {
  const { data } = await supabaseAdmin
    .from('users')
    .select(`
      id,
      email,
      full_name,
      created_at,
      course_purchases (id)
    `)
    .order('created_at', { ascending: false })
    .limit(10)
  
  return data?.map(user => ({
    name: user.full_name || user.email.split('@')[0],
    email: user.email,
    joinedDate: new Date(user.created_at).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }),
    hasPurchased: user.course_purchases && user.course_purchases.length > 0
  })) || []
}

async function getRecentPurchases() {
  const { data } = await supabaseAdmin
    .from('course_purchases')
    .select(`
      id,
      amount,
      currency,
      purchased_at,
      users (email, full_name)
    `)
    .eq('status', 'completed')
    .order('purchased_at', { ascending: false })
    .limit(10)
  
  return data?.map(purchase => ({
    product: 'FourXClub Course',
    user: purchase.users.full_name || purchase.users.email.split('@')[0],
    amount: purchase.amount,
    currency: purchase.currency,
    date: new Date(purchase.purchased_at).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  })) || []
}

async function getTopReferrers() {
  const { data } = await supabaseAdmin
    .from('referral_codes')
    .select(`
      code,
      uses_count,
      users (email, full_name)
    `)
    .order('uses_count', { ascending: false })
    .limit(5)
  
  return data?.map(ref => ({
    name: ref.users.full_name || ref.users.email.split('@')[0],
    code: ref.code,
    uses: ref.uses_count
  })) || []
}

async function getMonthlyRevenue() {
  // Get last 12 months of revenue
  const { data } = await supabaseAdmin
    .from('course_purchases')
    .select('amount, currency, purchased_at')
    .eq('status', 'completed')
    .gte('purchased_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
  
  // Group by month
  const monthlyData = new Map()
  
  data?.forEach(purchase => {
    const date = new Date(purchase.purchased_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, { amount: 0, month: date.toLocaleDateString('en-IN', { month: 'short' }) })
    }
    
    // Convert USD to INR for chart (approximate)
    const amountInr = purchase.currency === 'inr' 
      ? purchase.amount 
      : purchase.amount * 83 // Approximate conversion
    
    monthlyData.get(monthKey).amount += amountInr
  })
  
  // Get last 6 months
  const result = Array.from(monthlyData.values()).slice(-6)
  
  // If less than 6 months, fill with zeros
  while (result.length < 6) {
    result.unshift({ amount: 0, month: '' })
  }
  
  return result
}

// Export CSV endpoint
export async function POST(req: Request) {
  try {
    const { userId } = auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userEmail = user.emailAddresses[0].emailAddress
    if (userEmail !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    // Get all purchases for CSV export
    const { data: purchases } = await supabaseAdmin
      .from('course_purchases')
      .select(`
        id,
        amount,
        currency,
        purchased_at,
        stripe_payment_id,
        users (email, full_name)
      `)
      .eq('status', 'completed')
      .order('purchased_at', { ascending: false })
    
    // Convert to CSV
    const csv = [
      ['Date', 'User', 'Email', 'Product', 'Amount', 'Currency', 'Payment ID'].join(','),
      ...purchases.map(p => [
        new Date(p.purchased_at).toISOString(),
        p.users.full_name || 'N/A',
        p.users.email,
        'FourXClub Course',
        (p.amount / 100).toFixed(2),
        p.currency.toUpperCase(),
        p.stripe_payment_id
      ].join(','))
    ].join('\n')
    
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="fourxclub-revenue-${Date.now()}.csv"`
      }
    })
    
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    )
  }
}