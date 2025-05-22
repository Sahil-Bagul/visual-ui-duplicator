
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  read: boolean;
  action_url?: string;
  action_text?: string;
}

// Create a new notification
export async function createNotification(
  userId: string, 
  title: string, 
  message: string, 
  type: string = 'info',
  actionUrl?: string,
  actionText?: string
): Promise<{ success: boolean; notification_id?: string; error?: string }> {
  try {
    console.log(`Creating notification for user ${userId}: ${title}`);
    
    // Call the RPC function to create a notification
    const { data, error } = await supabase.rpc('create_user_notification', {
      user_id_param: userId,
      title_param: title,
      message_param: message,
      type_param: type,
      action_url_param: actionUrl || null,
      action_text_param: actionText || null
    });
    
    if (error) {
      console.error('Error creating notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    console.log('Notification created successfully:', data);
    return {
      success: true,
      notification_id: data as string
    };
  } catch (error) {
    console.error('Exception creating notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

// Get user notifications
export async function getUserNotifications(): Promise<Notification[]> {
  try {
    console.log('Fetching user notifications');
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
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

// Mark notification as read
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    console.log(`Marking notification ${notificationId} as read`);
    
    const { data, error } = await supabase.rpc('mark_notification_as_read', {
      notification_id_param: notificationId
    });
    
    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
    
    console.log('Notification marked as read:', data);
    return data as boolean;
  } catch (error) {
    console.error('Exception marking notification as read:', error);
    return false;
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId: string): Promise<number> {
  try {
    console.log(`Marking all notifications as read for user ${userId}`);
    
    const { data, error } = await supabase.rpc('mark_all_notifications_as_read', {
      user_id_param: userId
    });
    
    if (error) {
      console.error('Error marking all notifications as read:', error);
      return 0;
    }
    
    console.log(`Marked ${data} notifications as read`);
    return data as number;
  } catch (error) {
    console.error('Exception marking all notifications as read:', error);
    return 0;
  }
}

// Create a notification for all users
export async function createNotificationForAll(
  title: string,
  message: string,
  type: string = 'info',
  actionUrl?: string,
  actionText?: string
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    console.log(`Creating notification for all users: ${title}`);
    
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id');
    
    if (usersError) {
      console.error('Error fetching users for notifications:', usersError);
      return {
        success: false,
        error: usersError.message
      };
    }
    
    // Create a notification for each user
    let successCount = 0;
    for (const user of users) {
      const { success } = await createNotification(
        user.id, 
        title, 
        message, 
        type,
        actionUrl,
        actionText
      );
      
      if (success) successCount++;
    }
    
    console.log(`Created notifications for ${successCount}/${users.length} users`);
    return {
      success: true,
      count: successCount
    };
  } catch (error) {
    console.error('Exception creating notifications for all users:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}
