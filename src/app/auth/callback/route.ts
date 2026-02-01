import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Default redirect to dashboard after successful auth
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      // Sync user data with your database
      try {
        await prisma.user.upsert({
          where: { email: data.session.user.email! },
          update: {
            fullName: data.session.user.user_metadata.full_name || null,
          },
          create: {
            id: data.session.user.id,
            email: data.session.user.email!,
            fullName: data.session.user.user_metadata.full_name || null,
          },
        })
      } catch (dbError) {
        console.error('Database sync error:', dbError)
        // Continue with redirect even if DB sync fails
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}