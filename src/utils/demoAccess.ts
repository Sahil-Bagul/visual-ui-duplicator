
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// This file is kept for backward compatibility
// Demo user access is now managed manually through database entries

/**
 * Checks if the current user is the demo user with special access
 * This function is kept for backward compatibility but will always return false
 * @returns {Promise<boolean>} Always returns false as demo access is now managed manually
 */
export const isDemoUser = async (): Promise<boolean> => {
  return false;
};

/**
 * This function is now deprecated as demo access is managed manually
 * @returns {Promise<void>}
 */
export const grantDemoUserAccess = async (): Promise<void> => {
  console.log("Demo access is now managed manually through database entries");
  return;
};

/**
 * Grants course access to a specific user
 * This handles the purchase record creation without triggering duplicate referral issues
 * 
 * @param userEmail - The email of the user to grant access to
 * @param courseIds - Array of course IDs to grant access to
 * @returns {Promise<{success: boolean, message: string, purchases: any[]}>}
 */
export const grantCourseAccessToUser = async (
  userEmail: string,
  courseIds: string[]
): Promise<{success: boolean, message: string, purchases: any[]}> => {
  try {
    // 1. Get user ID from email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();
      
    if (userError || !userData) {
      console.error("Error finding user:", userError);
      return { 
        success: false, 
        message: `User with email ${userEmail} not found`, 
        purchases: [] 
      };
    }
    
    const userId = userData.id;
    const purchases = [];
    
    // 2. Check for existing purchases to avoid duplicates
    const { data: existingPurchases } = await supabase
      .from('purchases')
      .select('course_id')
      .eq('user_id', userId)
      .in('course_id', courseIds);
      
    const existingCourseIds = existingPurchases?.map(p => p.course_id) || [];
    const newCourseIds = courseIds.filter(id => !existingCourseIds.includes(id));
    
    if (newCourseIds.length === 0) {
      return { 
        success: true, 
        message: `User ${userEmail} already has access to all specified courses`, 
        purchases: existingPurchases || [] 
      };
    }
    
    // 3. Add new purchases one by one to handle potential referral conflicts
    for (const courseId of newCourseIds) {
      // Check if a referral already exists for this user+course combination
      const { data: existingReferrals } = await supabase
        .from('referrals')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseId);
        
      // If a referral exists, we need to be careful not to create a duplicate
      const alreadyHasReferral = existingReferrals && existingReferrals.length > 0;
      
      // First insert the purchase
      const purchaseId = uuidv4();
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          id: purchaseId, // Use pre-generated UUID to avoid conflicts
          user_id: userId,
          course_id: courseId,
          has_used_referral_code: false,
          used_referral_code: null,
          purchased_at: new Date().toISOString()
        })
        .select();
        
      if (purchaseError) {
        console.error(`Error creating purchase for course ${courseId}:`, purchaseError);
        continue;
      }
      
      purchases.push(purchase[0]);
      
      // If no existing referral, manually create one with a unique code
      if (!alreadyHasReferral) {
        const referralCode = `${userId.substring(0, 5)}-${courseId.substring(0, 5)}-${Math.floor(Math.random() * 10000)}`;
        
        const { error: referralError } = await supabase
          .from('referrals')
          .insert({
            user_id: userId,
            course_id: courseId,
            referral_code: referralCode,
            successful_referrals: 0,
            total_earned: 0
          });
        
        if (referralError) {
          console.error(`Error creating referral for course ${courseId}:`, referralError);
        }
      }
    }
    
    return { 
      success: true, 
      message: `Successfully granted access to ${purchases.length} courses for user ${userEmail}`, 
      purchases 
    };
  } catch (error) {
    console.error("Error granting course access:", error);
    return { 
      success: false, 
      message: `Error granting course access: ${error instanceof Error ? error.message : 'Unknown error'}`, 
      purchases: [] 
    };
  }
};
