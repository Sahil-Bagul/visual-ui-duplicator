
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const Index: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        if (!user) {
          // Not authenticated, redirect to auth page
          navigate('/auth');
          return;
        }

        // Check if user is admin using the correct function name
        const { data: isAdminData, error: adminError } = await supabase
          .rpc('is_admin_user');

        if (adminError) {
          console.error('Error checking admin status:', adminError);
          // Continue as regular user if admin check fails
          navigate('/dashboard');
          return;
        }

        // Redirect based on user type
        if (isAdminData) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error in authentication check:', error);
        navigate('/auth');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return null;
};

export default Index;
