
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, AlertCircle } from 'lucide-react';
import { CourseWithProgress, Module } from '@/types/course';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

const MyCourses: React.FC = () => {
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataFetched, setDataFetched] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchMyCourses = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Fetching courses for user:", user.id);
        
        // Get user's purchased courses
        const { data: purchasesData, error: purchasesError } = await supabase
          .from('purchases')
          .select('course:courses(*)')
          .eq('user_id', user.id);
          
        if (purchasesError) {
          console.error("Error fetching purchases:", purchasesError);
          throw purchasesError;
        }
        
        // Extract course data from the join
        const purchasedCourses = purchasesData?.map(item => item.course) || [];
        console.log("Purchased courses:", purchasedCourses.length);
        
        if (purchasedCourses.length === 0) {
          // No courses found - not an error condition
          setIsLoading(false);
          setCourses([]);
          setDataFetched(true);
          return;
        }
        
        // For each course, fetch modules and user progress
        const coursesWithProgress = await Promise.all(
          purchasedCourses.map(async (course) => {
            // Get modules for this course
            const { data: modulesData, error: modulesError } = await supabase
              .from('course_modules')
              .select('*')
              .eq('course_id', course.id)
              .order('module_order', { ascending: true });
              
            if (modulesError) {
              console.error(`Error fetching modules for course ${course.id}:`, modulesError);
              throw modulesError;
            }
            
            const modules = modulesData as Module[] || [];
            console.log(`Course ${course.id} modules:`, modules.length);
            
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
              throw progressError;
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
        
        setCourses(coursesWithProgress);
        setDataFetched(true);
        
      } catch (error: any) {
        console.error("Error fetching courses:", error);
        setError("Failed to load your courses. Please refresh the page or try again later.");
        toast({
          title: "Error",
          description: "Failed to load your courses",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMyCourses();
  }, [user, toast]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4 w-full flex-grow">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Courses</h1>

        {/* Error display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        ) : courses.length > 0 ? (
          <div className="space-y-6">
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">{course.title}</h2>
                    <p className="text-gray-600 text-sm mb-4">{course.description || "No description available"}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-blue-600 text-xs font-semibold">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Web Course</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Progress: {course.completedModules}/{course.totalModules} modules
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {course.progress}%
                    </span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={() => navigate(`/course-content/${course.id}`)}
                    className="bg-[#4F46E5] hover:bg-blue-700"
                  >
                    {course.progress > 0 ? "Continue Learning" : "Start Learning"}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/referrals')}
                  >
                    Share & Earn
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : dataFetched ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center">
            <div className="w-16 h-16 mb-4 text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v6m0 0v14m0-14h6m-6 0H6" />
                <rect x="2" y="6" width="20" height="16" rx="2" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">No courses yet</h2>
            <p className="text-gray-500 text-center mb-6">Get started by purchasing your first course.</p>
            <Button asChild className="bg-[#4F46E5] hover:bg-blue-700">
              <Link to="/dashboard">Browse Courses</Link>
            </Button>
          </div>
        ) : (
          <div className="flex justify-center py-8">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-t-[#00C853] border-gray-200 rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-500">Loading your courses...</p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyCourses;
