
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WelcomeCard from '@/components/dashboard/WelcomeCard';
import CourseCard from '@/components/courses/CourseCard';
import CourseProgressCard from '@/components/dashboard/CourseProgressCard';
import CourseLoadingSkeleton from '@/components/courses/CourseLoadingSkeleton';
import GrantCourseAccess from '@/components/admin/GrantCourseAccess';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CourseWithProgress } from '@/types/course';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';

const Dashboard: React.FC = () => {
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch all courses with React Query for better caching
  const { data: allCourses, isLoading: coursesLoading, error: coursesError } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      try {
        console.log('🔄 Fetching all courses...');
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('is_active', true);
          
        if (error) {
          console.error('Error fetching courses:', error);
          throw error;
        }
        
        console.log('✅ Successfully fetched courses:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('Exception fetching courses:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch user's purchased courses
  const { data: purchasedCourseIds, isLoading: purchasesLoading, error: purchasesError } = useQuery({
    queryKey: ['purchases', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        console.log('🔄 Fetching user purchases...');
        const { data, error } = await supabase
          .from('purchases')
          .select('course_id')
          .eq('user_id', user.id);
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching purchases:', error);
          throw error;
        }
        
        const courseIds = (data || []).map(purchase => purchase.course_id);
        console.log('✅ Successfully fetched purchases:', courseIds.length);
        return courseIds;
      } catch (error) {
        console.error('Exception fetching purchases:', error);
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 3 * 60 * 1000, // Consider data fresh for 3 minutes
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch wallet balance
  const { data: wallet } = useQuery({
    queryKey: ['wallet', user?.id],
    queryFn: async () => {
      if (!user) return { available_balance: 0 };
      
      try {
        console.log('🔄 Fetching wallet balance...');
        const { data, error } = await supabase
          .from('wallet')
          .select('available_balance')
          .eq('user_id', user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching wallet data:", error);
          return { available_balance: 0 };
        }
        
        console.log('✅ Successfully fetched wallet:', data);
        return data || { available_balance: 0 };
      } catch (error) {
        console.error('Exception fetching wallet:', error);
        return { available_balance: 0 };
      }
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    retry: 2,
  });

  // Update wallet balance when wallet data changes
  useEffect(() => {
    if (wallet) {
      setWalletBalance(wallet.available_balance || 0);
    }
  }, [wallet]);

  // Fetch enrolled courses with progress (simplified for now)
  const { data: enrolledCourses, isLoading: progressLoading } = useQuery({
    queryKey: ['enrolledCourses', user?.id, purchasedCourseIds],
    queryFn: async () => {
      if (!user || !purchasedCourseIds || purchasedCourseIds.length === 0 || !allCourses) {
        return [];
      }
      
      try {
        console.log('🔄 Fetching enrolled courses...');
        
        // Filter purchased courses
        const userCourses = allCourses.filter(course => 
          purchasedCourseIds.includes(course.id)
        );
        
        // For now, return courses with basic progress info
        // This can be enhanced later with actual module progress
        const coursesWithProgress = userCourses.map(course => ({
          ...course,
          totalModules: 0,
          completedModules: 0,
          progress: 0
        }));
        
        console.log('✅ Successfully fetched enrolled courses:', coursesWithProgress.length);
        return coursesWithProgress;
      } catch (error) {
        console.error('Exception fetching enrolled courses:', error);
        return [];
      }
    },
    enabled: !!user && !!purchasedCourseIds && purchasedCourseIds.length > 0 && !!allCourses,
    staleTime: 3 * 60 * 1000, // Consider data fresh for 3 minutes
    retry: 2,
  });

  const handleCourseClick = useCallback((courseId: string) => {
    navigate(`/course/${courseId}`);
  }, [navigate]);

  const isLoading = coursesLoading || purchasesLoading || progressLoading;
  const error = coursesError || purchasesError;
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4 flex-1">
        <div className="flex justify-between items-center mb-4">
          <WelcomeCard 
            userName={user?.user_metadata?.name || user?.email || 'User'} 
            walletBalance={walletBalance} 
          />
          <div className="flex space-x-2">
            {isAdmin && <GrantCourseAccess />}
          </div>
        </div>
        
        {/* Error display */}
        {error && (
          <Alert variant="destructive" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Data</AlertTitle>
            <AlertDescription>
              Failed to load data. Please refresh the page.
              <br />
              <small className="text-xs opacity-75">
                Check console for detailed error information.
              </small>
            </AlertDescription>
          </Alert>
        )}
        
        {/* User's enrolled courses with progress */}
        {isLoading ? (
          <section className="mt-8">
            <h2 className="text-[17px] font-semibold text-gray-800 mb-4">Your Learning Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CourseLoadingSkeleton type="progress" count={2} />
            </div>
          </section>
        ) : enrolledCourses && enrolledCourses.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-[17px] font-semibold text-gray-800 mb-4">Your Learning Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrolledCourses.map(course => (
                <CourseProgressCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        ) : purchasedCourseIds && purchasedCourseIds.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-[17px] font-semibold text-gray-800 mb-4">Your Learning Progress</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-gray-600">You have purchased courses but they don't have any modules yet. Please check back later.</p>
            </div>
          </section>
        ) : null}
        
        {/* Available courses */}
        <section className="mt-8">
          <h2 className="text-[17px] font-semibold text-gray-800 mb-4">Available Courses</h2>
          
          {isLoading ? (
            <div className="flex gap-6 max-md:flex-col">
              <CourseLoadingSkeleton count={2} />
            </div>
          ) : allCourses && allCourses.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-gray-600">No courses found. Please check back later.</p>
            </div>
          ) : (
            <div className="flex gap-6 max-md:flex-col">
              {allCourses && allCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  title={course.title}
                  description={course.description || "No description available"}
                  price={course.price}
                  type="Web Course"
                  onClick={() => handleCourseClick(course.id)}
                  isPurchased={purchasedCourseIds?.includes(course.id) || false}
                />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
