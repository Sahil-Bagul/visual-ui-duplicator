
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { createNotification } from '@/services/notificationService';

const NotificationComposer: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [actionText, setActionText] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await createNotification({
        title,
        message,
        type,
        actionText: actionText || undefined,
        actionUrl: actionUrl || undefined,
        userEmail: userEmail || undefined
      });
      
      if (result.success) {
        toast.success(`Notification sent successfully${userEmail ? ' to ' + userEmail : ' to all users'}`);
        
        // Reset the form
        setTitle('');
        setMessage('');
        setType('info');
        setActionText('');
        setActionUrl('');
        setUserEmail('');
      } else {
        toast.error(result.error || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Send Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient (optional)
            </label>
            <Input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Email address (leave empty to send to all users)"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to send to all users
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notification Type
            </label>
            <Select
              value={type}
              onValueChange={(value: 'info' | 'success' | 'warning' | 'error') => setType(value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select notification type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Information</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
              disabled={isSubmitting}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Notification message"
              rows={4}
              disabled={isSubmitting}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action Text (optional)
              </label>
              <Input
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                placeholder="e.g., View Details"
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action URL (optional)
              </label>
              <Input
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder="e.g., /dashboard"
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full gap-2 bg-[#00C853] hover:bg-green-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Notification
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NotificationComposer;
