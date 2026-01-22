import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  // Get authenticated user from Supabase
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { id: userId }, // Changed from clerkId to id
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { action, metadata } = await req.json();

  const activity = await prisma.userActivity.create({
    data: {
      userId: user.id,
      action,
      metadata,
    },
  });

  return NextResponse.json(activity);
}