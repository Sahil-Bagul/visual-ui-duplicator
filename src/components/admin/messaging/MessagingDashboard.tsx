
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, MessageCircle, Send } from 'lucide-react';
import TelegramBotGuide from './TelegramBotGuide';
import NotificationComposer from './NotificationComposer';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const MessagingDashboard: React.FC = () => {
  const [sendingTestMessage, setSendingTestMessage] = useState(false);
  
  const sendTelegramTestMessage = async () => {
    setSendingTestMessage(true);
    
    try {
      // Call the serverless function to send a test message
      const response = await supabase.functions.invoke('telegram-test', {
        method: 'POST',
        body: { 
          message: "This is a test notification from Learn & Earn Admin Dashboard." 
        }
      });
      
      if (response.error) {
        console.error('Error sending test message:', response.error);
        toast.error(`Failed to send test message: ${response.error.message}`);
        return;
      }
      
      console.log('Test message response:', response.data);
      toast.success('Test message sent successfully to your Telegram bot');
    } catch (error) {
      console.error('Exception sending test message:', error);
      toast.error('An error occurred while sending the test message');
    } finally {
      setSendingTestMessage(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Messaging Center</CardTitle>
        <CardDescription>
          Manage notifications and messages to users
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="notifications" className="space-y-4">
          <TabsList>
            <TabsTrigger value="notifications">In-App Notifications</TabsTrigger>
            <TabsTrigger value="telegram">Telegram Bot</TabsTrigger>
          </TabsList>
          
          <TabsContent value="notifications">
            <NotificationComposer />
          </TabsContent>
          
          <TabsContent value="telegram">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="text-lg font-medium flex items-center gap-2 text-blue-800">
                  <MessageCircle className="h-5 w-5" />
                  Telegram Bot Status
                </h3>
                <p className="mt-2 text-blue-700">
                  Your Telegram bot is configured and ready to use. You can send test messages and trigger payout notifications.
                </p>
                <div className="mt-4">
                  <Button 
                    onClick={sendTelegramTestMessage}
                    disabled={sendingTestMessage}
                    className="gap-2"
                  >
                    {sendingTestMessage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Send Test Message
                  </Button>
                </div>
              </div>
              
              <TelegramBotGuide />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MessagingDashboard;
