
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import CourseCard from '@/components/courses/CourseCard';
import WelcomeCard from '@/components/dashboard/WelcomeCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, TrendingUp, BookOpen, Users } from 'lucide-react';

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
  const [userName, setUserName] = useState('User');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Set user name
        setUserName(user.user_metadata?.name || user.email?.split('@')[0] || 'User');
        
        // Fetch wallet data
        const { data: walletData, error: walletError } = await supabase
          .from('wallet')
          .select('balance, total_earned')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (walletError && walletError.code !== 'PGRST116') {
          console.error("Error fetching wallet:", walletError);
        }
        
        // Fetch courses
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .eq('is_active', true);
          
        if (coursesError) {
          console.error("Error fetching courses:", coursesError);
          toast({
            title: "Error",
            description: "Failed to load courses",
            variant: "destructive"
          });
        }
        
        // Fetch user's purchases
        const { data: purchasesData, error: purchasesError } = await supabase
          .from('purchases')
          .select('course_id')
          .eq('user_id', user.id)
          .eq('payment_status', 'completed');
          
        if (purchasesError) {
          console.error("Error fetching purchases:", purchasesError);
        }
        
        // Fetch referrals count
        const { count: referralsCount, error: referralsError } = await supabase
          .from('referrals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'completed');
          
        if (referralsError) {
          console.error("Error fetching referrals:", referralsError);
        }
        
        const purchasedCourseIds = purchasesData?.map(p => p.course_id) || [];
        
        // Combine data
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
      navigate(`/course/${courseId}/content`);
    } else {
      navigate(`/course/${courseId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-t-[#00C853] border-gray-200 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[1200px] mx-auto w-full px-6 py-8">
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
                  type="PDF Course"
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
    </div>
  );
};

export default Dashboard;
