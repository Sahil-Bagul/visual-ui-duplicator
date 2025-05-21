
import { supabase } from "@/integrations/supabase/client";

export interface ContentManagementLog {
  id: string;
  admin_id: string;
  operation_type: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
  resource_type: 'course' | 'module' | 'lesson';
  resource_id: string;
  details?: any;
  created_at: string;
}

export async function logContentManagement(
  operation: 'create' | 'update' | 'delete' | 'publish' | 'unpublish',
  resourceType: 'course' | 'module' | 'lesson',
  resourceId: string,
  details: any = {}
): Promise<string | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('No authenticated user found for content management logging');
      return null;
    }
    
    console.log(`Logging content management: ${operation} ${resourceType} ${resourceId}`);
    
    const { data, error } = await supabase.rpc(
      'log_content_management',
      {
        admin_id_param: userData.user.id,
        operation_type_param: operation,
        resource_type_param: resourceType,
        resource_id_param: resourceId,
        details_param: details
      }
    );

    if (error) {
      console.error('Error logging content management operation:', error);
      return null;
    }

    return data as string;
  } catch (error) {
    console.error('Exception logging content management operation:', error);
    return null;
  }
}

export async function getContentManagementLogs(limit: number = 50): Promise<ContentManagementLog[]> {
  try {
    console.log(`Fetching content management logs, limit: ${limit}`);
    
    const { data, error } = await supabase
      .from('content_management_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching content management logs:', error);
      return [];
    }

    console.log(`Retrieved ${data?.length || 0} content management logs`);
    return data as ContentManagementLog[];
  } catch (error) {
    console.error('Exception fetching content management logs:', error);
    return [];
  }
}
