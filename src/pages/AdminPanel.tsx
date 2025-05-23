
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import HeaderWithNotifications from '@/components/layout/HeaderWithNotifications';
import Footer from '@/components/layout/Footer';
import GrantAccessForm from '@/components/admin/GrantAccessForm';
import GrantCourseAccess from '@/components/admin/GrantCourseAccess';
import InitializationButton from '@/components/admin/InitializationButton';
import ContentManagement from '@/components/admin/ContentManagement';
import AdminManagement from '@/components/admin/AdminManagement';
import AnalyticsDashboard from '@/components/admin/analytics/AnalyticsDashboard';
import SupportDashboard from '@/components/admin/support/SupportDashboard';
import PaymentsDashboard from '@/components/admin/payments/PaymentsDashboard';
import UserManagement from '@/components/admin/users/UserManagement';
import MessagingDashboard from '@/components/admin/messaging/MessagingDashboard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity,
  Settings,
  Users,
  FileText,
  MessageSquare,
  CreditCard,
  MessageCircle,
  ShieldAlert,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const AdminPanel: React.FC = () => {
  const { user, isAdmin: contextIsAdmin, isLoading: authLoading } = useAuth();
  
  // Double-check admin status from database using the new safe function
  const { data: isAdmin, isLoading, error } = useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      try {
        console.log('Double-checking admin status for user:', user.id);
        
        // Use the new safe admin check function
        const { data, error } = await supabase.rpc('is_current_user_admin');
        
        if (error) {
          console.error('Error checking admin status:', error);
          throw error;
        }
        
        console.log('Admin status result from database:', data);
        return data || false;
      } catch (error) {
        console.error('Exception checking admin status:', error);
        throw error;
      }
    },
    enabled: !!user && !authLoading,
    staleTime: 60000, // Cache for 1 minute
    retry: 2,
  });
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-[#00C853] border-gray-200 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Checking admin permissions...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <HeaderWithNotifications />
        <main className="max-w-[993px] mx-auto w-full px-6 py-8 flex-grow">
          <Alert variant="destructive">
            <ShieldAlert className="h-5 w-5" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>
              Failed to verify admin permissions. Please try refreshing the page or contact support.
              <br />
              <small className="text-xs opacity-75">Error: {error.message}</small>
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Use the database result, fallback to context if needed
  const finalIsAdmin = isAdmin ?? contextIsAdmin;
  
  if (!finalIsAdmin) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <HeaderWithNotifications />
        <main className="max-w-[993px] mx-auto w-full px-6 py-8 flex-grow">
          <Alert variant="destructive">
            <ShieldAlert className="h-5 w-5" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You do not have admin permissions to access this page.
              Please contact an administrator if you believe this is a mistake.
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <HeaderWithNotifications />
      <main className="max-w-[993px] mx-auto w-full px-6 py-8 max-sm:p-4 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="text-sm text-gray-500">
            Logged in as <span className="font-medium">{user.email}</span>
          </div>
        </div>
        
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="mb-6 grid grid-cols-4 md:grid-cols-7 gap-2">
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Tools</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Support</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
            <TabsTrigger value="messaging" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Messaging</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tools" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Quick Access Tools</h2>
                <div className="space-y-6">
                  <GrantAccessForm />
                  <GrantCourseAccess />
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">System Maintenance</h2>
                <div className="space-y-6">
                  <InitializationButton />
                  <AdminManagement currentAdminId={user.id} />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>
          
          <TabsContent value="content">
            <ContentManagement />
          </TabsContent>
          
          <TabsContent value="users">
            <UserManagement />
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
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPanel;
