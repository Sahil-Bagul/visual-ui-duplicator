
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import GrantAccessForm from '@/components/admin/GrantAccessForm';
import GrantCourseAccess from '@/components/admin/GrantCourseAccess';
import InitializationButton from '@/components/admin/InitializationButton';
import AdminManagement from '@/components/admin/AdminManagement';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
      <Header />
      <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4 flex-grow">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h1>
        
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
      </main>
      <Footer />
    </div>
  );
};

export default AdminPanel;
