
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
    
    // Handle the case where data is null
    if (data === null) {
      return {
        success: false,
        message: `Failed to grant access: No data returned from the server`
      };
    }
    
    // Now that we've checked for null, data is guaranteed to be non-null
    // TypeScript might still show errors, so we'll use a non-null assertion or type guards
    
    // Check if data is an object with a success property
    if (typeof data === 'object' && 'success' in data) {
      const successValue = data.success;
      
      if (successValue === true) {
        // Check if purchases property exists and is an array
        const hasPurchases = 'purchases' in data;
        const purchases = hasPurchases && Array.isArray(data.purchases) ? data.purchases : [];
        
        return {
          success: true,
          message: `Successfully granted access to courses for user ${userEmail}`,
          purchases: purchases
        };
      } else {
        // Check if message property exists and is a string
        const hasMessage = 'message' in data;
        const message = hasMessage && typeof data.message === 'string' 
          ? data.message 
          : `Failed to grant access to user ${userEmail}`;
          
        return {
          success: false,
          message: message
        };
      }
    }

    // If we reached here, assume success if there was no error and data is not null
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
