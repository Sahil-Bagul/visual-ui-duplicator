
import { supabase } from '@/integrations/supabase/client';

// This email will be granted special access to all courses without payment
// Replace with the actual demo email for Razorpay KYC
const DEMO_USER_EMAIL = "demo@learnandearn.in";

/**
 * Checks if the current user is the demo user with special access
 * @returns {Promise<boolean>} True if the user is the demo user
 */
export const isDemoUser = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email === DEMO_USER_EMAIL;
  } catch (error) {
    console.error("Error checking demo user status:", error);
    return false;
  }
};

/**
 * Grant access to all courses for the demo user, if they don't already have access
 * @returns {Promise<void>}
 */
export const grantDemoUserAccess = async (): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user?.email !== DEMO_USER_EMAIL) {
      return;
    }
    
    // Get all available courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id');
      
    if (coursesError) throw coursesError;
    
    if (!courses || courses.length === 0) {
      return;
    }
    
    // Check which courses the user already has access to
    const { data: existingPurchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('course_id')
      .eq('user_id', user.id);
      
    if (purchasesError && purchasesError.code !== 'PGRST116') throw purchasesError;
    
    // Filter out courses the user already has access to
    const existingCourseIds = (existingPurchases || []).map(p => p.course_id);
    const coursesToGrant = courses.filter(course => !existingCourseIds.includes(course.id));
    
    if (coursesToGrant.length === 0) {
      console.log("Demo user already has access to all courses");
      return;
    }
    
    // Grant access to each course the user doesn't already have
    const purchasesToInsert = coursesToGrant.map(course => ({
      user_id: user.id,
      course_id: course.id,
      purchased_at: new Date().toISOString(),
      has_used_referral_code: false,
      // Special marker to identify demo purchases
      demo_access: true
    }));
    
    const { error: insertError } = await supabase
      .from('purchases')
      .insert(purchasesToInsert);
      
    if (insertError) throw insertError;
    
    console.log(`Granted demo access to ${purchasesToInsert.length} courses`);
    
  } catch (error) {
    console.error("Error granting demo user access:", error);
  }
};
