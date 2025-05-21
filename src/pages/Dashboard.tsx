
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WelcomeCard from '@/components/dashboard/WelcomeCard';
import CourseCard from '@/components/courses/CourseCard';
import CourseProgressCard from '@/components/dashboard/CourseProgressCard';
import CourseLoadingSkeleton from '@/components/courses/CourseLoadingSkeleton';
import InitializationButton from '@/components/admin/InitializationButton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CourseWithProgress } from '@/types/course';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';

const Dashboard: React.FC = () => {
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch all courses with React Query for better caching
  const { data: allCourses, isLoading: coursesLoading, error: coursesError } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*');
        
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Fetch user's purchased courses
  const { data: purchasedCourseIds, isLoading: purchasesLoading, error: purchasesError } = useQuery({
    queryKey: ['purchases', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('purchases')
        .select('course_id')
        .eq('user_id', user.id);
        
      if (error && error.code !== 'PGRST116') throw error;
      return (data || []).map(purchase => purchase.course_id);
    },
    enabled: !!user,
    staleTime: 3 * 60 * 1000, // Consider data fresh for 3 minutes
  });

  // Fetch wallet balance
  const { data: wallet } = useQuery({
    queryKey: ['wallet', user?.id],
    queryFn: async () => {
      if (!user) return { balance: 0 };
      
      const { data, error } = await supabase
        .from('wallet')
        .select('balance')
        .eq('user_id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching wallet data:", error);
        return { balance: 0 };
      }
      
      return data || { balance: 0 };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
  });

  // Update wallet balance when wallet data changes
  useEffect(() => {
    if (wallet) {
      setWalletBalance(wallet.balance || 0);
    }
  }, [wallet]);

  // Fetch enrolled courses with progress
  const { data: enrolledCourses, isLoading: progressLoading } = useQuery({
    queryKey: ['enrolledCourses', user?.id, purchasedCourseIds],
    queryFn: async () => {
      if (!user || !purchasedCourseIds || purchasedCourseIds.length === 0 || !allCourses) {
        return [];
      }
      
      // Filter purchased courses
      const userCourses = allCourses.filter(course => 
        purchasedCourseIds.includes(course.id)
      );
      
      // For each purchased course, get progress data
      const coursesWithProgress = await Promise.all(
        userCourses.map(async (course) => {
          try {
            // Get modules for this course - optimized query with RLS
            const { data: modulesData, error: modulesError } = await supabase
              .from('course_modules')
              .select('*')
              .eq('course_id', course.id)
              .order('module_order', { ascending: true });
              
            if (modulesError) {
              console.error(`Error fetching modules for course ${course.id}:`, modulesError);
              return {
                ...course,
                modules: [],
                totalModules: 0,
                completedModules: 0,
                progress: 0
              };
            }
            
            const modules = modulesData || [];
            
            if (modules.length === 0) {
              return {
                ...course,
                modules: [],
                totalModules: 0,
                completedModules: 0,
                progress: 0
              };
            }
            
            // Get user progress for this course's modules
            const { data: progressData, error: progressError } = await supabase
              .from('user_progress')
              .select('*')
              .eq('user_id', user.id)
              .in('module_id', modules.map(module => module.id));
              
            if (progressError && progressError.code !== 'PGRST116') {
              console.error(`Error fetching progress for course ${course.id}:`, progressError);
            }
            
            // Calculate progress
            const totalModules = modules.length;
            const completedModules = progressData?.filter(p => p.completed).length || 0;
            const progress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
            
            return {
              ...course,
              modules,
              totalModules,
              completedModules,
              progress
            };
          } catch (err) {
            console.error(`Error processing course ${course.id}:`, err);
            return {
              ...course,
              modules: [],
              totalModules: 0,
              completedModules: 0,
              progress: 0
            };
          }
        })
      );
          
      return coursesWithProgress;
    },
    enabled: !!user && !!purchasedCourseIds && purchasedCourseIds.length > 0 && !!allCourses,
    staleTime: 3 * 60 * 1000, // Consider data fresh for 3 minutes
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
            userName={user?.user_metadata?.name || 'User'} 
            walletBalance={walletBalance} 
          />
          <InitializationButton />
        </div>
        
        {/* Error display */}
        {error && (
          <Alert variant="destructive" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "Failed to load data. Please refresh the page."}
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
