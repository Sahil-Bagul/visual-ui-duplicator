
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WelcomeCard from '@/components/dashboard/WelcomeCard';
import CourseCard from '@/components/courses/CourseCard';
import CourseProgressCard from '@/components/dashboard/CourseProgressCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CourseWithProgress } from '@/types/course';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
}

const Dashboard: React.FC = () => {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [purchasedCourses, setPurchasedCourses] = useState<string[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<CourseWithProgress[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch all courses
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*');
          
        if (coursesError) throw coursesError;
        setAllCourses(coursesData || []);
        
        // Fetch user's purchased courses
        const { data: purchasesData, error: purchasesError } = await supabase
          .from('purchases')
          .select('course_id')
          .eq('user_id', user.id);
          
        if (purchasesError && purchasesError.code !== 'PGRST116') {
          throw purchasesError;
        }
        
        const courseIds = (purchasesData || []).map(purchase => purchase.course_id);
        setPurchasedCourses(courseIds);
        
        // For each purchased course, get progress data
        if (courseIds.length > 0 && coursesData) {
          const coursesWithProgress = await Promise.all(
            coursesData
              .filter(course => courseIds.includes(course.id))
              .map(async (course) => {
                // Get modules for this course
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
              })
          );
            
          setEnrolledCourses(coursesWithProgress);
        }
        
        // Fetch wallet balance
        const { data: walletData, error: walletError } = await supabase
          .from('wallet')
          .select('balance')
          .eq('user_id', user.id)
          .single();
          
        if (walletError && walletError.code !== 'PGRST116') {
          console.error("Error fetching wallet data:", walletError);
        }
        
        if (walletData) {
          setWalletBalance(walletData.balance);
        }
        
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load data. Please refresh the page or try again later.");
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, toast]);

  const handleCourseClick = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4">
        <WelcomeCard 
          userName={user?.user_metadata?.name || 'User'} 
          walletBalance={walletBalance} 
        />
        
        {/* Error display */}
        {error && (
          <Alert variant="destructive" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* User's enrolled courses with progress */}
        {isLoading ? (
          <section className="mt-8">
            <h2 className="text-[17px] font-semibold text-gray-800 mb-4">Your Learning Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-40 w-full rounded-lg" />
            </div>
          </section>
        ) : enrolledCourses.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-[17px] font-semibold text-gray-800 mb-4">Your Learning Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrolledCourses.map(course => (
                <CourseProgressCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        ) : purchasedCourses.length > 0 ? (
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
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          ) : allCourses.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-gray-600">No courses found. Please check back later.</p>
            </div>
          ) : (
            <div className="flex gap-6 max-md:flex-col">
              {allCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  title={course.title}
                  description={course.description || "No description available"}
                  price={course.price}
                  type="Web Course"
                  onClick={() => handleCourseClick(course.id)}
                  isPurchased={purchasedCourses.includes(course.id)}
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
