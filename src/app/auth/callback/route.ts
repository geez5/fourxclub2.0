import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    if (data.session) {
      // Create or update user in Prisma
      await prisma.user.upsert({
        where: { email: data.session.user.email! },
        update: {
          firstName: data.session.user.user_metadata.full_name?.split(' ')[0],
          lastName: data.session.user.user_metadata.full_name?.split(' ').slice(1).join(' '),
          imageUrl: data.session.user.user_metadata.avatar_url,
        },
        create: {
          id: data.session.user.id,
          email: data.session.user.email!,
          firstName: data.session.user.user_metadata.full_name?.split(' ')[0],
          lastName: data.session.user.user_metadata.full_name?.split(' ').slice(1).join(' '),
          imageUrl: data.session.user.user_metadata.avatar_url,
          username: data.session.user.email?.split('@')[0],
        },
      });
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}