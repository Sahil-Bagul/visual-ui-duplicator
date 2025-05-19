
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import ReferralCard from '@/components/referrals/ReferralCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  referral_reward: number;
}

interface Referral {
  course_id: string;
  referral_code: string;
  successful_referrals: number;
  total_earned: number;
}

interface CourseReferral {
  course: Course;
  referral: Referral | null;
}

const Referrals: React.FC = () => {
  const [courseReferrals, setCourseReferrals] = useState<CourseReferral[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchReferralData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Get all courses
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('id, title, referral_reward');
          
        if (coursesError) throw coursesError;
        
        // Get user's purchases
        const { data: purchasesData, error: purchasesError } = await supabase
          .from('purchases')
          .select('course_id')
          .eq('user_id', user.id);
          
        if (purchasesError) throw purchasesError;
        
        const purchasedCourseIds = purchasesData?.map(p => p.course_id) || [];
        
        // Get user's referrals
        const { data: referralsData, error: referralsError } = await supabase
          .from('referrals')
          .select('*')
          .eq('user_id', user.id);
          
        if (referralsError) throw referralsError;
        
        const referralsMap: Record<string, Referral> = {};
        let totalEarned = 0;
        
        if (referralsData) {
          referralsData.forEach(referral => {
            referralsMap[referral.course_id] = referral;
            totalEarned += referral.total_earned;
          });
        }
        
        setTotalEarnings(totalEarned);
        
        // Combine courses with referral data
        const combinedData: CourseReferral[] = coursesData?.map(course => ({
          course,
          referral: referralsMap[course.id] || null
        })) || [];
        
        setCourseReferrals(combinedData);
        
      } catch (error) {
        console.error("Error fetching referral data:", error);
        toast({
          title: "Error",
          description: "Failed to load referral data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReferralData();
  }, [user, toast]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Referral Dashboard</h1>

        <div className="bg-[#2962FF] rounded-lg shadow-md text-white p-8 mb-8">
          <div className="flex justify-between items-center max-sm:flex-col max-sm:items-start max-sm:gap-4">
            <div>
              <h2 className="text-xl font-bold mb-2">Your Referral Earnings</h2>
              <p className="text-blue-100">Share courses and earn rewards</p>
            </div>
            <div className="bg-[rgba(255,255,255,0.1)] p-4 rounded-lg">
              <div className="text-sm mb-1">Total Earned</div>
              <div className="text-2xl font-bold">₹ {totalEarnings}</div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <p className="text-gray-500">Loading referral data...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {courseReferrals.map(({ course, referral }) => (
              <ReferralCard 
                key={course.id}
                title={course.title}
                isLocked={!referral}
                commissionAmount={course.referral_reward}
                referralCode={referral?.referral_code}
                successfulReferrals={referral?.successful_referrals || 0}
                totalEarned={referral?.total_earned || 0}
                onGetAccess={() => navigate(`/course/${course.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Referrals;
