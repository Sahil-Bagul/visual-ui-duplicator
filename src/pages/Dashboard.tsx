
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
import { Module, CourseWithProgress, GetCourseModulesResponse } from '@/types/course';

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all courses
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*');
          
        if (coursesError) throw coursesError;
        setAllCourses(coursesData || []);
        
        // Fetch user's purchased courses
        if (user) {
          const { data: purchasesData, error: purchasesError } = await supabase
            .from('purchases')
            .select('course_id')
            .eq('user_id', user.id);
            
          if (purchasesError) throw purchasesError;
          const courseIds = (purchasesData || []).map(purchase => purchase.course_id);
          setPurchasedCourses(courseIds);
          
          // For each purchased course, get progress data
          if (courseIds.length > 0) {
            const coursesWithProgress = await Promise.all(
              coursesData
                .filter(course => courseIds.includes(course.id))
                .map(async (course) => {
                  // Get modules for this course using RPC
                  const { data: modulesData, error: modulesError } = await supabase
                    .rpc<GetCourseModulesResponse, { course_id_param: string }>('get_course_modules', { course_id_param: course.id });
                    
                  let modules: Module[] = [];
                  
                  if (modulesError) {
                    console.error("Error fetching modules via RPC:", modulesError);
                    
                    // Fallback to direct query
                    const { data: directModulesData, error: directModulesError } = await supabase
                      .from('course_modules')
                      .select('*')
                      .eq('course_id', course.id)
                      .order('module_order', { ascending: true });
                      
                    if (directModulesError) throw directModulesError;
                    modules = directModulesData as Module[];
                  } else {
                    modules = modulesData;
                  }
                  
                  // Get user progress for this course's modules
                  const { data: progressData, error: progressError } = await supabase
                    .from('user_progress')
                    .select('*')
                    .eq('user_id', user.id)
                    .in('module_id', modules.map(module => module.id));
                    
                  if (progressError) throw progressError;
                  
                  // Calculate progress
                  const totalModules = modules.length;
                  const completedModules = progressData.filter(p => p.completed).length;
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
            throw walletError;
          }
          
          if (walletData) {
            setWalletBalance(walletData.balance);
          }
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
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
        
        {/* User's enrolled courses with progress */}
        {enrolledCourses.length > 0 && (
          <section className="mt-8">
            <h2 className="text-[17px] font-semibold text-gray-800 mb-4">Your Learning Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrolledCourses.map(course => (
                <CourseProgressCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        )}
        
        {/* Available courses */}
        <section className="mt-8">
          <h2 className="text-[17px] font-semibold text-gray-800 mb-4">Available Courses</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>Loading courses...</p>
            </div>
          ) : (
            <div className="flex gap-6 max-md:flex-col">
              {allCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  title={course.title}
                  description={course.description}
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
