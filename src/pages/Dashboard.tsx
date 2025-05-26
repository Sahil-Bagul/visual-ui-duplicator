
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import CourseCard from '@/components/courses/CourseCard';
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch wallet data
        const { data: walletData, error: walletError } = await supabase
          .from('wallet')
          .select('balance, total_earned')
          .eq('user_id', user.id)
          .single();
          
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
          <p className="text-gray-600">Here's your learning and earning overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-[#00C853] to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Wallet Balance</p>
                  <p className="text-2xl font-bold">₹{stats.balance}</p>
                </div>
                <Wallet className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-[#2962FF] to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Earned</p>
                  <p className="text-2xl font-bold">₹{stats.totalEarned}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Courses Owned</p>
                  <p className="text-2xl font-bold">{stats.coursesOwned}</p>
                </div>
                <BookOpen className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Referrals</p>
                  <p className="text-2xl font-bold">{stats.totalReferrals}</p>
                </div>
                <Users className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button 
            onClick={() => navigate('/wallet')} 
            className="bg-[#00C853] hover:bg-green-700 h-12"
          >
            View Wallet
          </Button>
          <Button 
            onClick={() => navigate('/referrals')} 
            variant="outline" 
            className="h-12"
          >
            Manage Referrals
          </Button>
          <Button 
            onClick={() => navigate('/my-courses')} 
            variant="outline" 
            className="h-12"
          >
            My Courses
          </Button>
        </div>

        {/* Available Courses */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Available Courses</h2>
            {courses.length > 6 && (
              <Button variant="outline" onClick={() => navigate('/courses')}>
                View All
              </Button>
            )}
          </div>
          
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 6).map((course) => (
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
    </div>
  );
};

export default Dashboard;
