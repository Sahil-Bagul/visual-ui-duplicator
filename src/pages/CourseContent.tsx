
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import CourseContentDisplay from '@/components/courses/CourseContentDisplay';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Module, UserProgress, Lesson } from '@/types/course';

const CourseContent: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [modules, setModules] = useState<Module[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!user || !courseId) return;
      
      try {
        setIsLoading(true);
        
        // Check if user has purchased this course
        const { data: purchaseData, error: purchaseError } = await supabase
          .from('purchases')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .single();
          
        if (purchaseError) {
          if (purchaseError.code === 'PGRST116') {
            // No purchase found
            toast({
              title: "Access Denied",
              description: "You don't have access to this course",
              variant: "destructive"
            });
            navigate('/my-courses');
            return;
          }
          throw purchaseError;
        }
        
        // Get course title
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('title')
          .eq('id', courseId)
          .single();
          
        if (courseError) throw courseError;
        setCourseTitle(courseData.title);
        
        // Get modules for this course
        const { data: modulesData, error: modulesError } = await supabase
          .from('course_modules')
          .select('*')
          .eq('course_id', courseId)
          .order('module_order', { ascending: true });
            
        if (modulesError) throw modulesError;
          
        if (modulesData && modulesData.length > 0) {
          // Transform the data to match our Module interface
          const transformedModules = modulesData.map(module => ({
            id: module.id,
            title: module.title,
            description: module.description,
            content: module.content || '',
            module_order: module.module_order,
            course_id: module.course_id
          }));
          
          setModules(transformedModules);
            
          // Set the first module as active if no active module
          if (transformedModules.length > 0 && !activeModule) {
            setActiveModule(transformedModules[0]);
            
            // Fetch lessons for this module
            fetchLessons(transformedModules[0].id);
          }
        }
        
        // Get user progress
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id);
              
        if (progressError) throw progressError;
            
        if (progressData) {
          setUserProgress(progressData as UserProgress[]);
        }
        
      } catch (error) {
        console.error("Error fetching course data:", error);
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
  }, [user, courseId, toast, navigate]);

  const fetchLessons = async (moduleId: string) => {
    try {
      setLessons([]);
      
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('lesson_order', { ascending: true });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setLessons(data as Lesson[]);
        
        // Set the first lesson as active if there's no active lesson
        if (!activeLessonId) {
          setActiveLessonId(data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
      toast({
        title: "Error",
        description: "Failed to load lessons for this module",
        variant: "destructive"
      });
    }
  };

  const handleModuleSelect = (module: Module) => {
    setActiveModule(module);
    fetchLessons(module.id);
  };
  
  const handleLessonSelect = (lesson: Lesson) => {
    setActiveLessonId(lesson.id);
  };

  const isModuleCompleted = (moduleId: string) => {
    const moduleLessons = lessons.filter(lesson => lesson.module_id === moduleId);
    const completedLessons = userProgress.filter(p => 
      p.module_id === moduleId && 
      p.completed
    );
    
    return moduleLessons.length > 0 && completedLessons.length === moduleLessons.length;
  };
  
  const getLessonCompletionStatus = () => {
    return userProgress
      .filter(p => p.lesson_id && p.completed)
      .map(p => p.lesson_id as string);
  };

  const getModuleProgress = () => {
    if (!modules.length) return { current: 0, total: 0 };
    
    const currentIndex = activeModule 
      ? modules.findIndex(m => m.id === activeModule.id) + 1 
      : 1;
      
    return {
      current: currentIndex,
      total: modules.length
    };
  };

  const handleMarkAsComplete = async () => {
    if (!user || !activeModule || !activeLessonId) return;
    
    setIsMarkingComplete(true);
    
    try {
      // Check if progress record exists for this lesson
      const existingLessonProgress = userProgress.find(p => p.lesson_id === activeLessonId);
      
      if (existingLessonProgress) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_progress')
          .update({ 
            completed: true,
            completed_at: new Date().toISOString()
          })
          .eq('id', existingLessonProgress.id);
            
        if (updateError) throw updateError;
      } else {
        // Create new progress record for lesson
        const { data: lessonProgressData, error: lessonProgressError } = await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            lesson_id: activeLessonId,
            module_id: activeModule.id,
            completed: true,
            completed_at: new Date().toISOString()
          })
          .select();
            
        if (lessonProgressError) throw lessonProgressError;
        
        // Add new progress to local state
        if (lessonProgressData && lessonProgressData.length > 0) {
          setUserProgress(prev => [...prev, lessonProgressData[0] as UserProgress]);
        }
      }
      
      // Also check if this completes the module
      const moduleLessons = lessons.filter(lesson => lesson.module_id === activeModule.id);
      const updatedCompletedLessons = [
        ...userProgress.filter(p => p.lesson_id && p.completed).map(p => p.lesson_id as string),
        activeLessonId
      ];
      
      const allLessonsCompleted = moduleLessons.every(lesson => 
        updatedCompletedLessons.includes(lesson.id)
      );
      
      // If all lessons are completed, mark the module as completed too
      if (allLessonsCompleted) {
        // Check if module progress record exists
        const existingModuleProgress = userProgress.find(
          p => p.module_id === activeModule.id && !p.lesson_id
        );
        
        if (existingModuleProgress) {
          // Update existing module progress
          await supabase
            .from('user_progress')
            .update({ 
              completed: true,
              completed_at: new Date().toISOString()
            })
            .eq('id', existingModuleProgress.id);
        } else {
          // Create new module progress record
          const { data: moduleProgressData } = await supabase
            .from('user_progress')
            .insert({
              user_id: user.id,
              module_id: activeModule.id,
              lesson_id: null,
              completed: true,
              completed_at: new Date().toISOString()
            })
            .select();
          
          // Update local state
          if (moduleProgressData && moduleProgressData.length > 0) {
            setUserProgress(prev => [...prev, moduleProgressData[0] as UserProgress]);
          }
        }
        
        // Show special message for module completion
        toast({
          title: "Module Completed!",
          description: "Congratulations on completing this module!",
          variant: "default"
        });
      } else {
        // Show lesson completion message
        toast({
          title: "Lesson Completed",
          description: "Your progress has been saved",
        });
      }
      
      // Refresh user progress data
      const { data: refreshedProgress, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);
        
      if (refreshedProgress) {
        setUserProgress(refreshedProgress as UserProgress[]);
      }
      
      // Automatically move to next lesson if available
      const currentLessonIndex = lessons.findIndex(lesson => lesson.id === activeLessonId);
      if (currentLessonIndex < lessons.length - 1) {
        setActiveLessonId(lessons[currentLessonIndex + 1].id);
      }
      
    } catch (error) {
      console.error("Error updating progress:", error);
      toast({
        title: "Error",
        description: "Failed to update your progress",
        variant: "destructive"
      });
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const getCompletedLessonIds = () => {
    return userProgress
      .filter(p => p.lesson_id && p.completed)
      .map(p => p.lesson_id as string);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto my-0 px-6 py-8 max-sm:p-4 w-full flex-grow">
          <div className="flex justify-center py-8">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-t-[#00C853] border-gray-200 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500">Loading course content...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto my-0 px-6 py-8 max-sm:p-4 w-full flex-grow">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{courseTitle}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {modules.length > 0 ? `${modules.length} modules in this course` : 'No modules available'}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/my-courses')}
            >
              Back to My Courses
            </Button>
          </div>
        </div>

        <CourseContentDisplay
          modules={modules}
          lessons={lessons}
          userProgress={userProgress}
          activeModuleId={activeModule?.id || null}
          activeLessonId={activeLessonId}
          onSelectModule={handleModuleSelect}
          onSelectLesson={handleLessonSelect}
          onMarkComplete={handleMarkAsComplete}
          isMarkingComplete={isMarkingComplete}
          completedLessonIds={getCompletedLessonIds()}
        />
      </main>
      <Footer />
    </div>
  );
};

export default CourseContent;
