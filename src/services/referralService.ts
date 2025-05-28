
import { supabase } from '@/integrations/supabase/client';

export interface ReferralData {
  course_id: string;
  referral_code: string;
  successful_referrals: number;
  total_earned: number;
}

export interface Course {
  id: string;
  title: string;
  referral_reward: number;
  price: number;
}

// Get user's referral data for all courses
export async function getUserReferrals(): Promise<{ courses: Course[]; referrals: Record<string, ReferralData> }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No authenticated user');
    }

    // Get all courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, referral_reward, price')
      .eq('is_active', true);

    if (coursesError) {
      throw coursesError;
    }

    // Get user's referral data
    const { data: referralData, error: referralError } = await supabase
      .from('referrals')
      .select('course_id, commission_amount')
      .eq('user_id', user.id)
      .eq('status', 'completed');

    if (referralError) {
      console.error('Error fetching referral data:', referralError);
    }

    // Process referral data by course
    const referrals: Record<string, ReferralData> = {};
    
    if (referralData) {
      referralData.forEach(ref => {
        if (!referrals[ref.course_id]) {
          referrals[ref.course_id] = {
            course_id: ref.course_id,
            referral_code: user.user_metadata?.referral_code || `REF${user.id.slice(0, 8).toUpperCase()}`,
            successful_referrals: 0,
            total_earned: 0
          };
        }
        
        referrals[ref.course_id].successful_referrals += 1;
        referrals[ref.course_id].total_earned += ref.commission_amount || 0;
      });
    }

    return {
      courses: courses || [],
      referrals
    };
  } catch (error) {
    console.error('Error fetching user referrals:', error);
    return { courses: [], referrals: {} };
  }
}

// Generate referral code for user if not exists
export async function generateReferralCode(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Check if user already has a referral code
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('referral_code')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return null;
    }

    if (userData?.referral_code) {
      return userData.referral_code;
    }

    // Generate new referral code
    const referralCode = `REF${user.id.slice(0, 8).toUpperCase()}`;
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ referral_code })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating referral code:', updateError);
      return null;
    }

    return referralCode;
  } catch (error) {
    console.error('Error generating referral code:', error);
    return null;
  }
}
