
import { supabase } from '@/integrations/supabase/client';

// Function to grant course access to a user
export async function grantCourseAccessToUser(userEmail: string, courseIds: string[]) {
  try {
    // First, check if the user exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (userError || !userData) {
      console.error("User error:", userError);
      return {
        success: false,
        message: `User with email ${userEmail} not found. Please ensure they have registered.`
      };
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

    return {
      success: true,
      message: `Successfully granted access to courses for user ${userEmail}`,
      purchases: data
    };
  } catch (error) {
    console.error("Error granting course access:", error);
    return {
      success: false,
      message: `An error occurred while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
