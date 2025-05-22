
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import NotificationComposer from './NotificationComposer';
import TelegramBot from './TelegramBot';

const MessagingDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Messaging Dashboard</h2>
        <p className="text-gray-500">Manage notifications and messaging to users</p>
      </div>
      
      <Tabs defaultValue="notifications">
        <TabsList className="mb-4">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="telegram">Telegram Bot</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notifications">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <NotificationComposer />
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Guide</CardTitle>
                  <CardDescription>Tips for effective notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">When to send notifications</h3>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Important system announcements</li>
                      <li>New course launches</li>
                      <li>Special offers or promotions</li>
                      <li>Updates to course content</li>
                      <li>Reminders for users with incomplete lessons</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Best practices</h3>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Keep titles short and clear</li>
                      <li>Use appropriate notification types</li>
                      <li>Include specific details in the message</li>
                      <li>Add action buttons when relevant</li>
                      <li>Don't overuse notifications</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="telegram">
          <TelegramBot />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MessagingDashboard;
