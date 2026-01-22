import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const ADMIN_EMAIL = 'hello@fourxclub.in'

export async function GET(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    
    const users = await prisma.user.findMany({
      where: search ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ]
      } : undefined,
      include: {
        coursePurchases: true,
        discordSubscriptions: true,
        referralCodes: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    
    const formattedUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
      discordId: u.discordId,
      createdAt: u.createdAt,
      coursePurchased: u.coursePurchases.length > 0,
      discordSubscribed: u.discordSubscriptions.some(s => 
        s.status === 'active' || s.status === 'trialing'
      ),
      referralUses: u.referralCodes[0]?.usesCount || 0,
    }))
    
    return NextResponse.json({ users: formattedUsers })
    
  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}