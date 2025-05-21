
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import GrantAccessForm from '@/components/admin/GrantAccessForm';
import GrantCourseAccess from '@/components/admin/GrantCourseAccess';
import InitializationButton from '@/components/admin/InitializationButton';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  
  // Hardcoded admin emails for demonstration purposes
  const adminEmails = ['movieskatta7641@gmail.com'];
  
  // Check if current user is admin
  const isAdmin = user && adminEmails.includes(user.email || '');
  
  if (!user) {
    return <Redirect to="/" />;
  }
  
  if (!isAdmin) {
    return <Redirect to="/dashboard" />;
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
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPanel;
