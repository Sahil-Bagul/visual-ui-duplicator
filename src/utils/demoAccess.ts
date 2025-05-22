
import { supabase } from '@/integrations/supabase/client';

export interface GrantCourseResult {
  success: boolean;
  message: string;
  purchases?: any[];  // Array to store purchase records
}

// Function to grant course access to a user
export async function grantCourseAccessToUser(userEmail: string, courseIds: string[]): Promise<GrantCourseResult> {
  try {
    console.log(`Granting access to ${userEmail} for courses:`, courseIds);
    
    // First, check if the user exists in auth.users by email
    const { data: authUser, error: authError } = await supabase.auth
      .admin
      .getUserByEmail(userEmail);
    
    if (authError) {
      console.error("Error finding user in auth system:", authError);
      
      // Try finding user in public.users table as a fallback
      const { data: publicUser, error: publicError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', userEmail)
        .single();
        
      if (publicError || !publicUser) {
        console.error("User not found in public.users either:", publicError);
        return {
          success: false,
          message: `User with email ${userEmail} not found. Please make sure they are registered.`
        };
      }
    }
    
    // Call the database function to grant access
    const { data, error } = await supabase.rpc('grant_one_time_access_to_user', {
      user_email: userEmail
    });

    if (error) {
      console.error("Error in grant_one_time_access_to_user RPC:", error);
      return {
        success: false,
        message: `Failed to grant access: ${error.message}`
      };
    }

    console.log("RPC response data:", data);

    return {
      success: true,
      message: `Successfully granted access to courses for user ${userEmail}`,
      purchases: Array.isArray(data) ? data : []
    };
  } catch (error) {
    console.error("Error granting course access:", error);
    return {
      success: false,
      message: `An error occurred while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
