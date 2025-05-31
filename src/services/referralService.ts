
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CourseReferralCode {
  id: string;
  user_id: string;
  course_id: string;
  referral_code: string;
  created_at: string;
}

export interface ReferralStats {
  courseReferrals: Array<{
    courseId: string;
    courseTitle: string;
    referralCode: string;
    totalEarned: number;
    totalReferrals: number;
  }>;
  canRefer: boolean;
  overallStats: {
    totalEarned: number;
    totalReferrals: number;
  };
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

// Get or create referral code for a specific course
export async function getCourseReferralCode(courseId: string): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    console.log('Getting referral code for user:', user.id, 'course:', courseId);

    // Use the database function to get or create the referral code
    const { data, error } = await supabase.rpc('get_or_create_course_referral_code', {
      p_user_id: user.id,
      p_course_id: courseId
    });

    if (error) {
      console.error('Error getting course referral code:', error);
      return null;
    }

    console.log('Course referral code:', data);
    return data;
  } catch (error) {
    console.error('Exception getting course referral code:', error);
    return null;
  }
}

// Get all course referral codes for user
export async function getAllCourseReferralCodes(): Promise<CourseReferralCode[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('course_referral_codes')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching course referral codes:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching course referral codes:', error);
    return [];
  }
}

// Get comprehensive referral statistics with per-course breakdown
export async function getReferralStats(): Promise<ReferralStats> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { 
        courseReferrals: [], 
        canRefer: false, 
        overallStats: { totalEarned: 0, totalReferrals: 0 }
      };
    }

    console.log('Getting comprehensive referral stats for user:', user.id);

    // Check eligibility
    const eligibility = await checkReferralEligibility();
    if (!eligibility.canRefer) {
      return { 
        courseReferrals: [], 
        canRefer: false, 
        overallStats: { totalEarned: 0, totalReferrals: 0 }
      };
    }

    // Get purchased courses with referral codes
    const { data: purchasedCourses, error: coursesError } = await supabase
      .from('purchases')
      .select(`
        course_id,
        courses(id, title)
      `)
      .eq('user_id', user.id)
      .eq('payment_status', 'completed');

    if (coursesError) {
      console.error('Error fetching purchased courses:', coursesError);
      return { 
        courseReferrals: [], 
        canRefer: true, 
        overallStats: { totalEarned: 0, totalReferrals: 0 }
      };
    }

    // Get referral statistics for each course
    const courseReferrals = await Promise.all(
      (purchasedCourses || []).map(async (purchase) => {
        const courseId = purchase.course_id;
        const courseTitle = purchase.courses?.title || 'Unknown Course';

        // Get or create referral code for this course
        const referralCode = await getCourseReferralCode(courseId);

        // Get referral stats for this course
        const { data: referrals, error: referralsError } = await supabase
          .from('referrals')
          .select('commission_amount, status')
          .eq('user_id', user.id)
          .eq('course_id', courseId);

        if (referralsError) {
          console.error('Error fetching referrals for course:', courseId, referralsError);
          return {
            courseId,
            courseTitle,
            referralCode: referralCode || '',
            totalEarned: 0,
            totalReferrals: 0
          };
        }

        const completedReferrals = referrals?.filter(r => r.status === 'completed') || [];
        const totalEarned = completedReferrals.reduce((sum, ref) => sum + (ref.commission_amount || 0), 0);
        const totalReferrals = completedReferrals.length;

        return {
          courseId,
          courseTitle,
          referralCode: referralCode || '',
          totalEarned,
          totalReferrals
        };
      })
    );

    // Calculate overall stats
    const overallStats = courseReferrals.reduce(
      (acc, course) => ({
        totalEarned: acc.totalEarned + course.totalEarned,
        totalReferrals: acc.totalReferrals + course.totalReferrals
      }),
      { totalEarned: 0, totalReferrals: 0 }
    );

    return {
      courseReferrals: courseReferrals.filter(c => c.referralCode), // Only include courses with referral codes
      canRefer: true,
      overallStats
    };
  } catch (error) {
    console.error('Exception getting referral stats:', error);
    return { 
      courseReferrals: [], 
      canRefer: false, 
      overallStats: { totalEarned: 0, totalReferrals: 0 }
    };
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
