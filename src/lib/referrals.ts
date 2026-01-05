import { nanoid } from 'nanoid'
import { supabaseAdmin } from './supabase'

// Generate unique referral code
export async function generateReferralCode(userId: string): Promise<string> {
  // Check if user already has a code
  const { data: existing } = await supabaseAdmin
    .from('referral_codes')
    .select('code')
    .eq('user_id', userId)
    .single()
  
  if (existing) {
    return existing.code
  }
  
  // Generate new code: 4X-XXXXXX (6 random chars)
  let code: string
  let isUnique = false
  
  while (!isUnique) {
    code = `4X-${nanoid(6).toUpperCase()}`
    
    // Check if code already exists
    const { data } = await supabaseAdmin
      .from('referral_codes')
      .select('id')
      .eq('code', code)
      .single()
    
    if (!data) {
      isUnique = true
    }
  }
  
  // Store code
  await supabaseAdmin.from('referral_codes').insert({
    user_id: userId,
    code: code!
  })
  
  return code!
}

// Validate and apply referral code
export async function applyReferralCode(
  code: string,
  referredUserId: string
): Promise<{ success: boolean; extraDays?: number; error?: string }> {
  // Check if code exists
  const { data: referralCode, error: codeError } = await supabaseAdmin
    .from('referral_codes')
    .select('id, user_id')
    .eq('code', code)
    .single()
  
  if (codeError || !referralCode) {
    return { success: false, error: 'Invalid referral code' }
  }
  
  // Check if user is trying to use their own code
  if (referralCode.user_id === referredUserId) {
    return { success: false, error: 'Cannot use your own referral code' }
  }
  
  // Check if user already used a referral
  const { data: existingUse } = await supabaseAdmin
    .from('referral_uses')
    .select('id')
    .eq('referred_user_id', referredUserId)
    .single()
  
  if (existingUse) {
    return { success: false, error: 'You have already used a referral code' }
  }
  
  // Record the use
  await supabaseAdmin.from('referral_uses').insert({
    referral_code_id: referralCode.id,
    referred_user_id: referredUserId,
    extra_trial_days: 15
  })
  
  // Increment uses count
  await supabaseAdmin.rpc('increment', {
    row_id: referralCode.id,
    table_name: 'referral_codes',
    column_name: 'uses_count'
  })
  
  return { success: true, extraDays: 15 }
}

// Get referral stats for a user
export async function getReferralStats(userId: string) {
  const { data: code } = await supabaseAdmin
    .from('referral_codes')
    .select('id, code, uses_count')
    .eq('user_id', userId)
    .single()
  
  const { data: uses } = await supabaseAdmin
    .from('referral_uses')
    .select('referred_user_id, used_at')
    .eq('referral_code_id', code?.id)
  
  return {
    code: code?.code || null,
    totalUses: code?.uses_count || 0,
    uses: uses || []
  }
}