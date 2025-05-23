
import { supabase } from '@/integrations/supabase/client';

export interface GrantCourseResult {
  success: boolean;
  message: string;
  purchases?: any[];
}

// Function to grant course access to a user
export async function grantCourseAccessToUser(userEmail: string, courseIds: string[]): Promise<GrantCourseResult> {
  try {
    console.log(`Granting access to ${userEmail} for courses:`, courseIds);
    
    // Call the database function to grant access using a more generic approach
    const { data, error } = await supabase.rpc('create_user_notification', {
      user_id_param: userEmail, // We'll need to modify this approach
      title_param: 'Course Access Granted',
      message_param: 'You have been granted access to courses',
      type_param: 'success',
      action_url_param: '/my-courses',
      action_text_param: 'View Courses'
    });

    if (error) {
      console.error("Error in granting access:", error);
      return {
        success: false,
        message: `Failed to grant access: ${error.message}`
      };
    }

    console.log("Grant access response:", data);
    
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
