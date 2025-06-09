
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, FileText, MessageSquare, CreditCard, BarChart3, Settings, TestTube } from 'lucide-react';

// Import admin components
import UserManagement from '@/components/admin/users/UserManagement';
import ContentManagement from '@/components/admin/ContentManagement';
import AnalyticsDashboard from '@/components/admin/analytics/AnalyticsDashboard';
import SupportDashboard from '@/components/admin/support/SupportDashboard';
import PaymentsDashboard from '@/components/admin/payments/PaymentsDashboard';
import MessagingDashboard from '@/components/admin/messaging/MessagingDashboard';
import AdminManagement from '@/components/admin/AdminManagement';
import TestingUtilities from '@/components/admin/TestingUtilities';

const AdminPanel: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <UnifiedHeader />
        <main className="flex-grow flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardHeader className="text-center">
              <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-xl text-red-600">Access Denied</CardTitle>
              <CardDescription>
                You don't have admin privileges to access this page.
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <UnifiedHeader />
      <main className="max-w-[1200px] mx-auto w-full px-6 py-8 flex-grow">
        <div className="flex items-center mb-6">
          <Shield className="h-8 w-8 text-purple-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2 h-auto p-1">
            <TabsTrigger value="analytics" className="flex items-center gap-2 p-3">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 p-3">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2 p-3">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2 p-3">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Support</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2 p-3">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
            <TabsTrigger value="messaging" className="flex items-center gap-2 p-3">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Messaging</span>
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-2 p-3">
              <TestTube className="h-4 w-4" />
              <span className="hidden sm:inline">Testing</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 p-3">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="content">
            <ContentManagement />
          </TabsContent>

          <TabsContent value="support">
            <SupportDashboard />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsDashboard />
          </TabsContent>

          <TabsContent value="messaging">
            <MessagingDashboard />
          </TabsContent>

          <TabsContent value="testing">
            <TestingUtilities />
          </TabsContent>

          <TabsContent value="settings">
            <AdminManagement />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPanel;
