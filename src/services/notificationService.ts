
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'payment' | 'referral';
  read: boolean;
  created_at: string;
  action_url?: string | null;
  action_text?: string | null;
}

export async function getUserNotifications(limit: number = 10): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data as Notification[];
  } catch (error) {
    console.error('Exception fetching notifications:', error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc(
      'mark_notification_as_read',
      { notification_id_param: notificationId }
    );

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return data as boolean;
  } catch (error) {
    console.error('Exception marking notification as read:', error);
    return false;
  }
}

export async function markAllNotificationsAsRead(): Promise<number> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return 0;
    
    const { data, error } = await supabase.rpc(
      'mark_all_notifications_as_read',
      { user_id_param: userData.user.id }
    );

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return 0;
    }

    return data as number;
  } catch (error) {
    console.error('Exception marking all notifications as read:', error);
    return 0;
  }
}

export async function sendNotificationToUser(
  userId: string,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' | 'payment' | 'referral',
  actionUrl?: string,
  actionText?: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc(
      'create_user_notification',
      {
        user_id_param: userId,
        title_param: title,
        message_param: message,
        type_param: type,
        action_url_param: actionUrl,
        action_text_param: actionText
      }
    );

    if (error) {
      console.error('Error sending notification:', error);
      return null;
    }

    return data as string;
  } catch (error) {
    console.error('Exception sending notification:', error);
    return null;
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false);

    if (error) {
      console.error('Error fetching unread notification count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Exception fetching unread notification count:', error);
    return 0;
  }
}

export function showNotificationToast(notification: Notification) {
  toast[notification.type === 'error' ? 'error' : notification.type === 'warning' ? 'warning' : 'info'](
    notification.title,
    {
      description: notification.message,
      action: notification.action_text && notification.action_url ? {
        label: notification.action_text,
        onClick: () => window.location.href = notification.action_url as string,
      } : undefined,
    }
  );
}
