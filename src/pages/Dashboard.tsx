
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import Footer from '@/components/layout/Footer';
import CourseCard from '@/components/courses/CourseCard';
import WelcomeCard from '@/components/dashboard/WelcomeCard';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number;
  is_active: boolean | null;
  referral_reward: number;
}

interface CourseWithProgress extends Course {
  isPurchased: boolean;
}

interface DashboardStats {
  balance: number;
  totalEarned: number;
  coursesOwned: number;
  totalReferrals: number;
}

const Dashboard: React.FC = () => {
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    balance: 0,
    totalEarned: 0,
    coursesOwned: 0,
    totalReferrals: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Memoize user name to avoid recalculation
  const userName = useMemo(() => {
    return user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  }, [user]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Optimize by making parallel requests instead of sequential ones
        const [walletResult, coursesResult, purchasesResult, referralsResult] = await Promise.allSettled([
          supabase
            .from('wallet')
            .select('balance, total_earned')
            .eq('user_id', user.id)
            .maybeSingle(),
          
          supabase
            .from('courses')
            .select('*')
            .eq('is_active', true),
          
          supabase
            .from('purchases')
            .select('course_id')
            .eq('user_id', user.id)
            .eq('payment_status', 'completed'),
          
          supabase
            .from('referrals')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'completed')
        ]);
        
        // Process wallet data
        const walletData = walletResult.status === 'fulfilled' && !walletResult.value.error 
          ? walletResult.value.data 
          : null;
        
        // Process courses data
        const coursesData = coursesResult.status === 'fulfilled' && !coursesResult.value.error 
          ? coursesResult.value.data 
          : [];
        
        // Process purchases data
        const purchasesData = purchasesResult.status === 'fulfilled' && !purchasesResult.value.error 
          ? purchasesResult.value.data 
          : [];
        
        // Process referrals data
        const referralsCount = referralsResult.status === 'fulfilled' && !referralsResult.value.error 
          ? referralsResult.value.count 
          : 0;
        
        const purchasedCourseIds = purchasesData?.map(p => p.course_id) || [];
        
        // Combine data efficiently
        const coursesWithProgress: CourseWithProgress[] = coursesData?.map(course => ({
          ...course,
          isPurchased: purchasedCourseIds.includes(course.id)
        })) || [];
        
        setCourses(coursesWithProgress);
        setStats({
          balance: walletData?.balance || 0,
          totalEarned: walletData?.total_earned || 0,
          coursesOwned: purchasedCourseIds.length,
          totalReferrals: referralsCount || 0
        });
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user, toast]);

  const handleCourseClick = (courseId: string, isPurchased: boolean) => {
    if (isPurchased) {
      navigate(`/course/${courseId}`);
    } else {
      navigate(`/payment/${courseId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <UnifiedHeader />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-t-[#00C853] border-gray-200 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <UnifiedHeader />
      <main className="max-w-[993px] mx-auto w-full px-6 py-8 max-sm:p-4 flex-grow">
        {/* Welcome Card */}
        <WelcomeCard userName={userName} walletBalance={stats.balance} />

        {/* Available Courses Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Courses</h2>
          
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  title={course.title}
                  description={course.description || 'No description available'}
                  price={course.price}
                  type="Web Course"
                  onClick={() => handleCourseClick(course.id, course.isPurchased)}
                  isPurchased={course.isPurchased}
                  thumbnail={course.thumbnail_url || undefined}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses available</h3>
                <p className="text-gray-600">New courses will appear here when they're added.</p>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
