
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
    
    // Now we're sure data is not null
    
    // Check if data is a string (some RPCs might return a text message)
    if (typeof data === 'string') {
      const isSuccess = data.includes('✅') || data.toLowerCase().includes('success');
      return {
        success: isSuccess,
        message: data
      };
    }
    
    // Check if data is an object with a success property
    if (typeof data === 'object') {
      if ('success' in data) {
        const successValue = data.success;
        
        if (successValue === true) {
          // Check if purchases property exists and is an array
          const purchases = 'purchases' in data && Array.isArray(data.purchases) ? data.purchases : [];
          
          return {
            success: true,
            message: `Successfully granted access to courses for user ${userEmail}`,
            purchases: purchases
          };
        } else {
          // Check if message property exists
          const message = 'message' in data && typeof data.message === 'string' 
            ? data.message 
            : `Failed to grant access to user ${userEmail}`;
            
          return {
            success: false,
            message: message
          };
        }
      }
      
      // Handle case where data is an array (possibly containing purchase records)
      if (Array.isArray(data)) {
        return {
          success: true,
          message: `Successfully granted access to courses for user ${userEmail}`,
          purchases: data
        };
      }
    }

    // If we reached here, assume success if there was no error and data is not null
    return {
      success: true,
      message: `Successfully granted access to courses for user ${userEmail}`
    };
  } catch (error) {
    console.error("Error granting course access:", error);
    return {
      success: false,
      message: `An error occurred while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
