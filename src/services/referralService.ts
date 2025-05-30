
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ReferralData {
  id: string;
  referral_code: string;
  total_earned: number;
  successful_referrals: number;
  user_id: string;
  created_at: string;
}

export interface ReferralStats {
  referralCode: string;
  totalEarned: number;
  totalReferrals: number;
  canRefer: boolean;
}

// Check if user has purchased any course and can refer
export async function checkReferralEligibility(): Promise<{ canRefer: boolean; coursesPurchased: number }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { canRefer: false, coursesPurchased: 0 };
    }

    console.log('Checking referral eligibility for user:', user.id);

    // Check if user has any completed purchases
    const { data: purchases, error } = await supabase
      .from('purchases')
      .select('id, course_id')
      .eq('user_id', user.id)
      .eq('payment_status', 'completed');

    if (error) {
      console.error('Error checking purchases:', error);
      return { canRefer: false, coursesPurchased: 0 };
    }

    const coursesPurchased = purchases?.length || 0;
    console.log('User has purchased courses:', coursesPurchased);

    return {
      canRefer: coursesPurchased > 0,
      coursesPurchased
    };
  } catch (error) {
    console.error('Exception checking referral eligibility:', error);
    return { canRefer: false, coursesPurchased: 0 };
  }
}

// Get or create referral code for user
export async function getUserReferralCode(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    console.log('Getting referral code for user:', user.id);

    // First check if user already has a referral code in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('referral_code')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
    }

    if (userData?.referral_code) {
      console.log('Found existing referral code:', userData.referral_code);
      return userData.referral_code;
    }

    // Generate new referral code
    const referralCode = `REF${user.id.substring(0, 8).toUpperCase()}`;
    console.log('Generated new referral code:', referralCode);

    // Update user with referral code
    const { error: updateError } = await supabase
      .from('users')
      .update({ referral_code: referralCode })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating user with referral code:', updateError);
      return null;
    }

    return referralCode;
  } catch (error) {
    console.error('Exception getting referral code:', error);
    return null;
  }
}

// Get referral statistics for user
export async function getReferralStats(): Promise<ReferralStats> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { referralCode: '', totalEarned: 0, totalReferrals: 0, canRefer: false };
    }

    console.log('Getting referral stats for user:', user.id);

    // Get eligibility and referral code
    const [eligibility, referralCode] = await Promise.all([
      checkReferralEligibility(),
      getUserReferralCode()
    ]);

    if (!eligibility.canRefer || !referralCode) {
      return { 
        referralCode: referralCode || '', 
        totalEarned: 0, 
        totalReferrals: 0, 
        canRefer: false 
      };
    }

    // Get referral statistics
    const { data: referrals, error } = await supabase
      .from('referrals')
      .select('commission_amount, status')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching referral stats:', error);
      return { 
        referralCode, 
        totalEarned: 0, 
        totalReferrals: 0, 
        canRefer: true 
      };
    }

    const completedReferrals = referrals?.filter(r => r.status === 'completed') || [];
    const totalEarned = completedReferrals.reduce((sum, ref) => sum + (ref.commission_amount || 0), 0);
    const totalReferrals = completedReferrals.length;

    console.log('Referral stats:', { totalEarned, totalReferrals });

    return {
      referralCode,
      totalEarned,
      totalReferrals,
      canRefer: true
    };
  } catch (error) {
    console.error('Exception getting referral stats:', error);
    return { referralCode: '', totalEarned: 0, totalReferrals: 0, canRefer: false };
  }
}

// Get detailed referral history
export async function getReferralHistory(): Promise<any[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: referrals, error } = await supabase
      .from('referrals')
      .select(`
        *,
        courses(title)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching referral history:', error);
      return [];
    }

    return referrals || [];
  } catch (error) {
    console.error('Exception fetching referral history:', error);
    return [];
  }
}
