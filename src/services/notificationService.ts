
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'payment' | 'referral';
  action_url?: string;
  action_text?: string;
  read: boolean;
  created_at: string;
}

export interface CreateNotificationParams {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'payment' | 'referral';
  actionUrl?: string;
  actionText?: string;
  userEmail?: string; // If specified, send to specific user; otherwise, send to all
}

export async function getUserNotifications(limit: number = 10): Promise<Notification[]> {
  try {
    console.log(`Fetching notifications with limit: ${limit}`);
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      console.warn('No authenticated user found when fetching notifications');
      return [];
    }
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    
    console.log(`Retrieved ${data?.length || 0} notifications`);
    return data as Notification[];
  } catch (error) {
    console.error('Exception fetching notifications:', error);
    return [];
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    console.log('Fetching unread notification count');
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      console.warn('No authenticated user found when fetching unread count');
      return 0;
    }
    
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userData.user.id)
      .eq('read', false);
    
    if (error) {
      console.error('Error fetching unread notification count:', error);
      return 0;
    }
    
    console.log(`Unread notification count: ${count || 0}`);
    return count || 0;
  } catch (error) {
    console.error('Exception fetching unread notification count:', error);
    return 0;
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    console.log(`Marking notification as read: ${notificationId}`);
    const { data, error } = await supabase.rpc('mark_notification_as_read', {
      notification_id_param: notificationId
    });
    
    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
    
    console.log('Notification marked as read:', data);
    return true;
  } catch (error) {
    console.error('Exception marking notification as read:', error);
    return false;
  }
}

export async function markAllNotificationsAsRead(): Promise<number> {
  try {
    console.log('Marking all notifications as read');
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      console.warn('No authenticated user found when marking all as read');
      return 0;
    }
    
    const { data, error } = await supabase.rpc('mark_all_notifications_as_read', {
      user_id_param: userData.user.id
    });
    
    if (error) {
      console.error('Error marking all notifications as read:', error);
      return 0;
    }
    
    console.log(`Marked ${data || 0} notifications as read`);
    return data as number;
  } catch (error) {
    console.error('Exception marking all notifications as read:', error);
    return 0;
  }
}

export async function createNotification(params: CreateNotificationParams): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Creating notification:', params);
    const { title, message, type, actionUrl, actionText, userEmail } = params;
    
    // If userEmail is provided, fetch the user ID
    if (userEmail) {
      // First get the user ID for the specified email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .single();
      
      if (userError || !userData) {
        console.error('Error finding user by email:', userError);
        return { 
          success: false, 
          error: `User with email ${userEmail} not found` 
        };
      }
      
      // Create notification for the specific user
      const { data, error } = await supabase.rpc('create_user_notification', {
        user_id_param: userData.id,
        title_param: title,
        message_param: message,
        type_param: type,
        action_url_param: actionUrl || null,
        action_text_param: actionText || null
      });
      
      if (error) {
        console.error('Error creating notification for specific user:', error);
        return { 
          success: false, 
          error: `Failed to create notification: ${error.message}` 
        };
      }
      
      console.log('Notification created for specific user:', data);
      return { success: true };
    } else {
      // Send to all users - get all user IDs
      const { data: allUsers, error: usersError } = await supabase
        .from('users')
        .select('id');
      
      if (usersError || !allUsers) {
        console.error('Error fetching all users:', usersError);
        return { 
          success: false, 
          error: 'Failed to fetch users for sending notifications' 
        };
      }
      
      // Create a notification for each user
      // Note: In a production system, this would be better handled by a backend batch process
      const promises = allUsers.map(user => 
        supabase.rpc('create_user_notification', {
          user_id_param: user.id,
          title_param: title,
          message_param: message,
          type_param: type,
          action_url_param: actionUrl || null,
          action_text_param: actionText || null
        })
      );
      
      // Wait for all notifications to be created
      await Promise.all(promises);
      console.log(`Created notifications for ${allUsers.length} users`);
      
      return { success: true };
    }
  } catch (error) {
    console.error('Exception creating notification:', error);
    return { 
      success: false, 
      error: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}
