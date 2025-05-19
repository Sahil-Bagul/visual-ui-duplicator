
import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  name: string;
  email: string;
}

interface Purchase {
  course: {
    title: string;
  };
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [purchasedCourses, setPurchasedCourses] = useState<Purchase[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Get user profile
        setProfile({
          name: user.user_metadata?.name || 'User',
          email: user.email || ''
        });
        
        // Get purchased courses
        const { data: purchasesData, error: purchasesError } = await supabase
          .from('purchases')
          .select('course:courses(title)')
          .eq('user_id', user.id);
          
        if (purchasesError) throw purchasesError;
        setPurchasedCourses(purchasesData || []);
        
        // Get wallet balance
        const { data: walletData, error: walletError } = await supabase
          .from('wallet')
          .select('balance')
          .eq('user_id', user.id)
          .single();
          
        if (walletError && walletError.code !== 'PGRST116') {
          throw walletError;
        }
        
        if (walletData) {
          setWalletBalance(walletData.balance);
        }
        
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, toast]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4 w-full">
          <div className="flex justify-center py-8">Loading profile...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile</h1>

        <div className="bg-white rounded-lg shadow-sm border border-blue-100 p-8">
          <div className="flex items-center mb-8 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 text-2xl font-semibold mr-4">
              {profile?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile?.name}</h2>
              <p className="text-gray-500">Student</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-gray-800">{profile?.email}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Courses Purchased</h3>
              {purchasedCourses.length > 0 ? (
                <ul className="list-disc pl-5">
                  {purchasedCourses.map((purchase, index) => (
                    <li key={index} className="text-gray-700">{purchase.course.title}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No courses purchased yet</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Wallet Balance</h3>
              <p className="text-blue-600 font-semibold">₹ {walletBalance}</p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center text-gray-700"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Logout
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Profile;
