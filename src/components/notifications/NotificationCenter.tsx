
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Bell, 
  Check, 
  Info, 
  AlertTriangle, 
  AlertCircle,
  CreditCard,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  getUserNotifications, 
  markAllNotificationsAsRead,
  markNotificationAsRead,
  getUnreadNotificationCount,
  Notification
} from "@/services/notificationService";
import { cn } from "@/lib/utils";

// Define the component as a named export
export const NotificationCenter: React.FC<{onClose?: () => void}> = ({ onClose }) => {
  const [open, setOpen] = useState(false);
  
  const { 
    data: notifications = [],
    refetch: refetchNotifications,
    isLoading 
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getUserNotifications(),
  });
  
  const { 
    data: unreadCount = 0,
    refetch: refetchCount
  } = useQuery({
    queryKey: ['notificationsCount'],
    queryFn: getUnreadNotificationCount,
  });
  
  useEffect(() => {
    // Refetch unread count when popover opens/closes
    if (!open) {
      refetchCount();
    }
  }, [open, refetchCount]);
  
  const handleMarkAllAsRead = async () => {
    const markedCount = await markAllNotificationsAsRead();
    if (markedCount > 0) {
      refetchNotifications();
      refetchCount();
    }
  };
  
  const handleMarkAsRead = async (notificationId: string) => {
    const success = await markNotificationAsRead(notificationId);
    if (success) {
      refetchNotifications();
      refetchCount();
    }
  };
  
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'payment':
        return <CreditCard className="h-4 w-4 text-purple-500" />;
      case 'referral':
        return <Users className="h-4 w-4 text-indigo-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {(unreadCount as number) > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1 min-w-[1.1rem] h-[1.1rem] flex items-center justify-center text-[10px]"
              variant="destructive"
            >
              {(unreadCount as number) > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h4 className="text-sm font-medium">Notifications</h4>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleMarkAllAsRead}
            disabled={!unreadCount}
            className="h-auto py-1 px-2 text-xs"
          >
            Mark all as read
          </Button>
        </div>
        
        <ScrollArea className="h-[calc(80vh-100px)] max-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center p-6">
              <div className="w-6 h-6 border-2 border-t-[#00C853] border-gray-200 rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Bell className="h-10 w-10 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No notifications yet</p>
              <p className="text-xs text-gray-400 mt-1">We'll notify you when something important happens</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={cn(
                    "px-4 py-3 border-b last:border-0 hover:bg-gray-50 transition-colors",
                    !notification.read && "bg-blue-50/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium line-clamp-1">{notification.title}</p>
                        <span className="text-[10px] text-gray-500 whitespace-nowrap">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notification.message}</p>
                      
                      <div className="flex items-center justify-between mt-2">
                        {notification.action_text && notification.action_url && (
                          <a 
                            href={notification.action_url} 
                            className="text-xs text-[#00C853] hover:underline"
                          >
                            {notification.action_text}
                          </a>
                        )}
                        
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 ml-auto text-xs"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

// No need for a second export here - we're already exporting the component above
