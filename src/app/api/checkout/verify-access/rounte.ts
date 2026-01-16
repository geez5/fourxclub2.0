// src/app/api/checkout/verify-access/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// Demo access codes - you can give these to partners
const VALID_ACCESS_CODES = new Set([
  'DEMO2025',
  'PARTNER2025',
  'FOURXVIP',
  'BETA2025',
  // Add more codes as needed
])

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', valid: false },
        { status: 401 }
      )
    }

    const { accessCode } = await req.json()

    if (!accessCode) {
      return NextResponse.json(
        { error: 'Access code required', valid: false },
        { status: 400 }
      )
    }

    // Check if access code is valid
    const isValid = VALID_ACCESS_CODES.has(accessCode.toUpperCase())

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid access code', valid: false },
        { status: 400 }
      )
    }

    // TODO: Grant access in your database
    // Example with Supabase:
    // await supabase
    //   .from('user_access')
    //   .upsert({
    //     user_id: userId,
    //     access_granted: true,
    //     access_code: accessCode,
    //     granted_at: new Date().toISOString()
    //   })

    return NextResponse.json({
      valid: true,
      message: 'Access granted successfully'
    })

  } catch (error) {
    console.error('Access verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error', valid: false },
      { status: 500 }
    )
  }
}