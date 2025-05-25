
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import CourseCard from '@/components/courses/CourseCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  pdf_url: string | null;
  price: number;
  is_active: boolean | null;
  referral_reward: number;
  created_at: string;
  updated_at: string;
}

interface CourseWithProgress extends Course {
  modules: any[];
  totalModules: number;
  completedModules: number;
  progress: number;
  isPurchased: boolean;
}

const Dashboard: React.FC = () => {
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Get wallet balance - using 'balance' column
        const { data: walletData, error: walletError } = await supabase
          .from('wallet')
          .select('balance')
          .eq('user_id', user.id)
          .single();
          
        if (walletError) {
          console.error("Error fetching wallet:", walletError);
        } else if (walletData) {
          setBalance(walletData.balance || 0);
        }
        
        // Get courses with progress
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .eq('is_active', true);
          
        if (coursesError) throw coursesError;
        
        if (coursesData) {
          // Get user's purchases
          const { data: purchasesData, error: purchasesError } = await supabase
            .from('purchases')
            .select('course_id')
            .eq('user_id', user.id)
            .eq('payment_status', 'completed');
            
          if (purchasesError) throw purchasesError;
          
          const purchasedCourseIds = purchasesData?.map(p => p.course_id) || [];
          
          // Transform courses to match CourseWithProgress interface
          const coursesWithProgress: CourseWithProgress[] = coursesData.map(course => ({
            ...course,
            modules: [], // Add empty modules array to satisfy interface
            totalModules: 0,
            completedModules: 0,
            progress: 0,
            isPurchased: purchasedCourseIds.includes(course.id)
          }));
          
          setCourses(coursesWithProgress);
        }
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  const handleCourseClick = (courseId: string, isPurchased: boolean) => {
    if (isPurchased) {
      navigate(`/course/${courseId}`);
    } else {
      navigate(`/payment/${courseId}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-medium text-gray-700 mb-1">Wallet Balance</h2>
              <div className="text-3xl font-bold">₹ {balance}</div>
            </div>
            <Button onClick={() => navigate('/wallet')}>View Wallet</Button>
          </div>
        </div>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Available Courses</h2>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p className="text-gray-500">Loading courses...</p>
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  title={course.title}
                  description={course.description || ''}
                  price={course.price}
                  type="PDF"
                  onClick={() => handleCourseClick(course.id, course.isPurchased)}
                  isPurchased={course.isPurchased}
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500">No courses available at the moment.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
