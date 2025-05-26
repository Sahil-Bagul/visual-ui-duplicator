
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ModularCourseContent from '@/components/courses/ModularCourseContent';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CourseContent: React.FC = () => {
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId || !user) return;
      
      try {
        setIsLoading(true);
        
        // Check if user has access to this course
        const { data: purchase, error: purchaseError } = await supabase
          .from('purchases')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .eq('payment_status', 'completed')
          .single();
          
        if (purchaseError && purchaseError.code !== 'PGRST116') {
          throw purchaseError;
        }
        
        if (!purchase) {
          setHasAccess(false);
          return;
        }
        
        setHasAccess(true);
        
        // Fetch course with modules and lessons
        const { data: course, error: courseError } = await supabase
          .from('courses')
          .select(`
            id,
            title,
            description,
            course_modules (
              id,
              title,
              description,
              module_order,
              lessons (
                id,
                title,
                content,
                lesson_order
              )
            )
          `)
          .eq('id', courseId)
          .single();
          
        if (courseError) throw courseError;
        
        // Transform data to match component expectations
        const transformedCourse = {
          ...course,
          modules: course.course_modules
            .sort((a: any, b: any) => a.module_order - b.module_order)
            .map((module: any) => ({
              ...module,
              lessons: module.lessons.sort((a: any, b: any) => a.lesson_order - b.lesson_order)
            }))
        };
        
        setCourseData(transformedCourse);
        
        // Fetch user progress
        const { data: progress, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id);
          
        if (progressError) {
          console.error('Error fetching progress:', progressError);
        } else {
          setUserProgress(progress || []);
        }
        
      } catch (error) {
        console.error('Error fetching course content:', error);
        toast({
          title: "Error",
          description: "Failed to load course content",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourseData();
  }, [courseId, user, toast]);

  const handleLessonComplete = async (lessonId: string) => {
    if (!user) return;
    
    try {
      // Mark lesson as complete
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      // Update local progress state
      setUserProgress(prev => {
        const existing = prev.find(p => p.lesson_id === lessonId);
        if (existing) {
          return prev.map(p => 
            p.lesson_id === lessonId 
              ? { ...p, completed: true, completed_at: new Date().toISOString() }
              : p
          );
        } else {
          return [...prev, {
            user_id: user.id,
            lesson_id: lessonId,
            completed: true,
            completed_at: new Date().toISOString()
          }];
        }
      });
      
      toast({
        title: "Progress Saved",
        description: "Lesson marked as complete!",
      });
      
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error",
        description: "Failed to save progress",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-t-[#00C853] border-gray-200 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600">Loading course content...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Access Required</h2>
            <p className="text-gray-600 mb-6">
              You need to purchase this course to access its content.
            </p>
            <button
              onClick={() => navigate(`/course/${courseId}`)}
              className="px-6 py-2 bg-[#00C853] text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              View Course Details
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-gray-600">Course not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[1200px] mx-auto w-full px-6 py-8 flex-grow">
        <ModularCourseContent 
          course={courseData}
          userProgress={userProgress}
          onLessonComplete={handleLessonComplete}
        />
      </main>
      <Footer />
    </div>
  );
};

export default CourseContent;
