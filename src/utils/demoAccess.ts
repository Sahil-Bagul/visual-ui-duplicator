
import { supabase } from '@/integrations/supabase/client';

export interface GrantCourseResult {
  success: boolean;
  message: string;
  purchases?: any[];
}

interface DatabaseResponse {
  success: boolean;
  message: string;
  user_id?: string;
}

// Function to grant course access to a user
export async function grantCourseAccessToUser(userEmail: string, courseIds: string[]): Promise<GrantCourseResult> {
  try {
    console.log(`Granting access to ${userEmail} for courses:`, courseIds);
    
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
    
    // Handle the response from the JSONB function
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const response = data as unknown as DatabaseResponse;
      
      if (response.success === true) {
        return {
          success: true,
          message: response.message || `Successfully granted access to courses for user ${userEmail}`,
          purchases: []
        };
      } else {
        return {
          success: false,
          message: response.message || `Failed to grant access to user ${userEmail}`
        };
      }
    }
    
    return {
      success: true,
      message: `Successfully granted access to courses for user ${userEmail}`,
      purchases: []
    };
  } catch (error) {
    console.error("Error granting course access:", error);
    return {
      success: false,
      message: `An error occurred while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
