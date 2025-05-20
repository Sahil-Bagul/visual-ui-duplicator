
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '@/components/auth/AuthForm';
import { useAuth } from '@/context/AuthContext';
import { initializeAppData } from '@/utils/autoSetupCourses';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();

  // Initialize course data on first load
  useEffect(() => {
    const setupCourses = async () => {
      // Initialize courses without requiring user login
      await initializeAppData(undefined);
    };
    
    setupCourses();
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="max-w-[993px] w-full h-screen flex justify-center items-center mx-auto max-md:max-w-[991px] max-sm:max-w-screen-sm">
        <div className="flex flex-col items-center gap-8 w-full max-w-md">
          <div className="text-center pt-6">
            <h1 className="text-[26px] text-gray-900 mb-2">Learn &amp; Earn</h1>
            <p className="text-xs text-gray-600">Learn new skills and earn through referrals</p>
          </div>
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default Auth;
