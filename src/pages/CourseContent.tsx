import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Module, UserProgress } from '@/types/course';
import { Check, ChevronLeft, ChevronRight, BookOpen, CheckCircle } from 'lucide-react';

const CourseContent: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [modules, setModules] = useState<Module[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [activeModule, setActiveModule] = useState<Module | null>(null);
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
        
        // Get modules for this course using direct query
        const { data: modulesData, error: modulesError } = await supabase
          .from('course_modules')
          .select('*')
          .eq('course_id', courseId)
          .order('module_order', { ascending: true });
            
        if (modulesError) throw modulesError;
          
        if (modulesData && modulesData.length > 0) {
          setModules(modulesData as Module[]);
            
          // Set the first module as active if no active module
          if (modulesData.length > 0 && !activeModule) {
            setActiveModule(modulesData[0] as Module);
          }
        }
        
        // Get user progress
        if (modules.length > 0) {
          const { data: progressData, error: progressError } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .in('module_id', modules.map(m => m.id));
              
          if (progressError) throw progressError;
            
          if (progressData) {
            setUserProgress(progressData as UserProgress[]);
          }
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
  }, [user, courseId, toast, navigate, activeModule]);

  const isModuleCompleted = (moduleId: string) => {
    return userProgress.some(p => p.module_id === moduleId && p.completed);
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

  const navigateToModule = (direction: 'next' | 'prev') => {
    if (!activeModule || !modules.length) return;
    
    const currentIndex = modules.findIndex(m => m.id === activeModule.id);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = Math.min(currentIndex + 1, modules.length - 1);
    } else {
      newIndex = Math.max(currentIndex - 1, 0);
    }
    
    setActiveModule(modules[newIndex]);
  };

  const handleMarkAsComplete = async () => {
    if (!user || !activeModule) return;
    
    setIsMarkingComplete(true);
    
    try {
      // Check if progress record exists
      const existingProgress = userProgress.find(p => p.module_id === activeModule.id);
      
      if (existingProgress) {
        // Update existing record directly
        const { error: directError } = await supabase
          .from('user_progress')
          .update({ 
            completed: true,
            completed_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id);
            
        if (directError) throw directError;
      } else {
        // Create new progress record directly
        const { data: directData, error: directError } = await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            module_id: activeModule.id,
            completed: true,
            completed_at: new Date().toISOString()
          })
          .select();
            
        if (directError) throw directError;
          
        // Add new progress to local state
        if (directData && directData.length > 0) {
          setUserProgress(prev => [...prev, directData[0] as UserProgress]);
        }
      }
      
      toast({
        title: "Module Completed",
        description: "Your progress has been saved",
      });
      
      // Refresh user progress data
      const { data: refreshedProgress, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('module_id', modules.map(m => m.id));
        
      if (refreshedProgress) {
        setUserProgress(refreshedProgress as UserProgress[]);
      }
      
      // If this is the last module, show special message
      const isLastModule = activeModule.module_order === modules.length;
      if (isLastModule) {
        toast({
          title: "Congratulations!",
          description: "You've completed the entire course!",
        });
      } else {
        // Navigate to next module
        navigateToModule('next');
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

  const { current, total } = getModuleProgress();

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4 w-full flex-grow">
          <div className="flex justify-center py-8">
            <p className="text-gray-500">Loading course content...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4 w-full flex-grow">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{courseTitle}</h1>
              <p className="text-sm text-gray-600 mt-1">
                Module {current} of {total}
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left sidebar - Module list */}
          <div className="md:col-span-1 bg-white rounded-lg shadow-sm border border-gray-100 p-4 h-fit">
            <h2 className="font-semibold text-gray-800 mb-3">Course Modules</h2>
            <Accordion type="single" defaultValue={activeModule?.id} collapsible className="w-full">
              {modules.map((module) => {
                const completed = isModuleCompleted(module.id);
                const isActive = activeModule?.id === module.id;
                
                return (
                  <AccordionItem 
                    key={module.id} 
                    value={module.id}
                    className={`${completed ? 'bg-green-50 border-green-100' : ''} ${isActive ? 'border-l-4 border-l-blue-500 pl-2' : ''} rounded-md mb-1`}
                  >
                    <AccordionTrigger className="py-2 px-1 hover:no-underline">
                      <div className="flex items-center gap-2 text-left">
                        {completed ? (
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <div className={`h-4 w-4 rounded-full border ${isActive ? 'border-blue-500 bg-blue-100' : 'border-gray-300'} flex-shrink-0`} />
                        )}
                        <span className={`text-sm ${completed ? 'text-green-700' : 'text-gray-700'} ${isActive ? 'font-medium' : ''}`}>
                          {module.title}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-gray-600 pl-6">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start px-0 hover:bg-transparent hover:underline"
                        onClick={() => setActiveModule(module)}
                      >
                        View Module
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>

          {/* Main content area */}
          <div className="md:col-span-3 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            {activeModule ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {activeModule.title}
                  </h2>
                  {isModuleCompleted(activeModule.id) && (
                    <div className="flex items-center text-green-600 text-sm bg-green-50 px-2 py-1 rounded-full">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span>Completed</span>
                    </div>
                  )}
                </div>
                
                <Separator className="my-4" />
                
                <div className="prose max-w-none mb-8">
                  {activeModule.content.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4 text-gray-700">
                      {paragraph}
                    </p>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <Button 
                    variant="outline" 
                    onClick={() => navigateToModule('prev')}
                    disabled={modules.findIndex(m => m.id === activeModule.id) === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  {!isModuleCompleted(activeModule.id) ? (
                    <Button 
                      onClick={handleMarkAsComplete}
                      disabled={isMarkingComplete}
                      className="bg-[#00C853] hover:bg-green-700"
                    >
                      {isMarkingComplete ? (
                        <>Loading...</>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Mark as Complete
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => navigateToModule('next')}
                      disabled={modules.findIndex(m => m.id === activeModule.id) === modules.length - 1}
                      className="bg-[#4F46E5] hover:bg-blue-700"
                    >
                      Next Module
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-gray-500">Select a module to start learning</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CourseContent;
