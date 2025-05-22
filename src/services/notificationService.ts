
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'payment' | 'referral'; 
  read: boolean;
  created_at: string;
  action_url?: string | null;
  action_text?: string | null;
}

// Get all notifications for the current user
export const getUserNotifications = async (): Promise<Notification[]> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      console.error("Authentication error:", authError);
      return [];
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', authData.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }

    return data as Notification[];
  } catch (error) {
    console.error("Exception fetching notifications:", error);
    return [];
  }
};

// Get count of unread notifications
export const getUnreadNotificationCount = async (): Promise<number> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      console.error("Authentication error:", authError);
      return 0;
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authData.user.id)
      .eq('read', false);

    if (error) {
      console.error("Error fetching notification count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Exception fetching notification count:", error);
    return 0;
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc(
      'mark_notification_as_read', 
      { notification_id_param: notificationId }
    );

    if (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error("Exception marking notification as read:", error);
    return false;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<number> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      console.error("Authentication error:", authError);
      return 0;
    }

    const { data, error } = await supabase.rpc(
      'mark_all_notifications_as_read',
      { user_id_param: authData.user.id }
    );

    if (error) {
      console.error("Error marking all notifications as read:", error);
      return 0;
    }

    return data as number;
  } catch (error) {
    console.error("Exception marking all notifications as read:", error);
    return 0;
  }
};

// Create a new notification
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: Notification['type'] = 'info',
  actionUrl?: string,
  actionText?: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.rpc(
      'create_user_notification',
      {
        user_id_param: userId,
        title_param: title,
        message_param: message,
        type_param: type,
        action_url_param: actionUrl || null,
        action_text_param: actionText || null
      }
    );

    if (error) {
      console.error("Error creating notification:", error);
      return null;
    }

    return data as string;
  } catch (error) {
    console.error("Exception creating notification:", error);
    return null;
  }
};
