
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
} from 'lucide-react';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  
  // Fetch admin status from the database
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase.rpc('is_user_admin', {
        user_id: user.id
      });
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      return data || false;
    },
    enabled: !!user
  });
  
  if (!user) {
    return <Navigate to="/" />;
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-[#00C853] border-gray-200 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
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
        
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="mb-6 grid grid-cols-3 md:grid-cols-7 gap-2">
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
            <TabsTrigger value="users" className="flex items-center gap-2" disabled>
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2" disabled>
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Support</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2" disabled>
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
            <TabsTrigger value="messaging" className="flex items-center gap-2" disabled>
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
          
          {/* Placeholder for future tabs */}
          {['users', 'support', 'payments', 'messaging'].map(tab => (
            <TabsContent key={tab} value={tab} className="py-12 flex items-center justify-center">
              <div className="text-center">
                <div className="bg-gray-100 p-4 rounded-full inline-block mb-4">
                  <Settings className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-medium mb-2">Coming Soon</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  This feature is planned for a future update. Check back later or contact the developer for more information.
                </p>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPanel;
