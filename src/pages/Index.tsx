
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Index: React.FC = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Wait for auth to load
        if (isLoading) return;

        if (!user) {
          // Not authenticated, redirect to auth page
          navigate('/auth');
          return;
        }

        // User is authenticated, redirect based on admin status
        if (isAdmin) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error in authentication check:', error);
        navigate('/auth');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuthentication();
  }, [user, isAdmin, isLoading, navigate]);

  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-[#00C853] border-gray-200 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default Index;
