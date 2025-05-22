
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  email: string;
  name: string;
  joined_at: string;
  is_admin: boolean;
  is_suspended: boolean;
  last_login?: string;
  courses_purchased?: number;
  successful_referrals?: number;
  total_earned?: number;
}

/**
 * Get a list of all users with enhanced data
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    console.log('Fetching all users');
    
    // First get basic user information
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('joined_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    // Process and enhance user data
    const enhancedUsers = await Promise.all(data.map(async (user) => {
      try {
        // Get last login info
        const { data: activityData } = await supabase
          .from('user_activity_logs')
          .select('created_at')
          .eq('user_id', user.id)
          .eq('activity_type', 'login')
          .order('created_at', { ascending: false })
          .limit(1);
        
        // Get course purchase count
        const { count: purchaseCount } = await supabase
          .from('purchases')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        // Get referral stats
        const { data: referralData } = await supabase
          .from('referrals')
          .select('successful_referrals, total_earned')
          .eq('user_id', user.id)
          .order('total_earned', { ascending: false })
          .limit(1);
          
        return {
          ...user,
          last_login: activityData?.[0]?.created_at,
          courses_purchased: purchaseCount || 0,
          successful_referrals: referralData?.[0]?.successful_referrals || 0,
          total_earned: referralData?.[0]?.total_earned || 0
        };
      } catch (error) {
        console.error(`Error enhancing user data for ${user.id}:`, error);
        return user;
      }
    }));
    
    console.log(`Retrieved ${enhancedUsers.length} users`);
    return enhancedUsers;
  } catch (error) {
    console.error('Exception in getAllUsers:', error);
    return [];
  }
}

/**
 * Toggle the suspension status of a user
 */
export async function toggleUserSuspension(
  targetUserId: string, 
  suspend: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`${suspend ? 'Suspending' : 'Unsuspending'} user ${targetUserId}`);
    
    // Get the current user (admin)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { 
        success: false, 
        message: 'You must be logged in to perform this action' 
      };
    }
    
    // Call the RPC function to toggle suspension
    const { data, error } = await supabase.rpc('toggle_user_suspension', {
      admin_id: user.id,
      target_user_id: targetUserId,
      suspend: suspend
    });
    
    if (error) {
      console.error('Error toggling user suspension:', error);
      return { 
        success: false, 
        message: error.message 
      };
    }
    
    if (!data || !data.success) {
      return { 
        success: false, 
        message: data?.message || 'Operation failed' 
      };
    }
    
    console.log('Toggle suspension result:', data);
    return { 
      success: true, 
      message: data.message 
    };
  } catch (error) {
    console.error('Exception in toggleUserSuspension:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

/**
 * Grant admin privileges to a user
 */
export async function grantAdminPrivileges(
  userEmail: string
): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`Granting admin privileges to ${userEmail}`);
    
    // Call the RPC function to grant admin privileges
    const { data, error } = await supabase.rpc('grant_admin_privileges', {
      admin_email: userEmail
    });
    
    if (error) {
      console.error('Error granting admin privileges:', error);
      return { 
        success: false, 
        message: error.message 
      };
    }
    
    if (!data || !data.success) {
      return { 
        success: false, 
        message: data?.message || 'Operation failed' 
      };
    }
    
    console.log('Grant admin result:', data);
    return { 
      success: true, 
      message: data.message 
    };
  } catch (error) {
    console.error('Exception in grantAdminPrivileges:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

/**
 * Revoke admin privileges from a user
 */
export async function revokeAdminPrivileges(
  userEmail: string
): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`Revoking admin privileges from ${userEmail}`);
    
    // Call the RPC function to revoke admin privileges
    const { data, error } = await supabase.rpc('revoke_admin_privileges', {
      admin_email: userEmail
    });
    
    if (error) {
      console.error('Error revoking admin privileges:', error);
      return { 
        success: false, 
        message: error.message 
      };
    }
    
    if (!data || !data.success) {
      return { 
        success: false, 
        message: data?.message || 'Operation failed' 
      };
    }
    
    console.log('Revoke admin result:', data);
    return { 
      success: true, 
      message: data.message 
    };
  } catch (error) {
    console.error('Exception in revokeAdminPrivileges:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}
