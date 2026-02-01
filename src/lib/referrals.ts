import { supabaseAdmin } from './supabase/index'

export async function generateReferralCode(userId: string): Promise<string> {
  const code = Math.random().toString(36).substring(2, 10).toUpperCase()
  
  await supabaseAdmin
    .from('referral_codes')
    .insert({
      user_id: userId,
      code,
      uses_count: 0
    })
  
  return code
}

export async function applyReferralCode(code: string, userId: string) {
  // Check if code exists
  const { data: referralCode } = await supabaseAdmin
    .from('referral_codes')
    .select('*')
    .eq('code', code)
    .single()
  
  if (!referralCode) {
    return { success: false, error: 'Invalid referral code' }
  }
  
  if (referralCode.user_id === userId) {
    return { success: false, error: 'Cannot use your own referral code' }
  }
  
  // Increment uses
  await supabaseAdmin
    .from('referral_codes')
    .update({ uses_count: referralCode.uses_count + 1 })
    .eq('code', code)
  
  const extraDays = 7
  
  return { success: true, extraDays }
}

export async function getReferralStats(userId: string) {
  const { data: referralCode } = await supabaseAdmin
    .from('referral_codes')
    .select('uses_count')
    .eq('user_id', userId)
    .single()
  
  return {
    totalUses: referralCode?.uses_count || 0
  }
}