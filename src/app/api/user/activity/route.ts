import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user from Supabase
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return user activity data
    return NextResponse.json({
      userId: user.id,
      email: user.email,
      // Add other activity fields as needed
    })
  } catch (error) {
    console.error('Activity error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}