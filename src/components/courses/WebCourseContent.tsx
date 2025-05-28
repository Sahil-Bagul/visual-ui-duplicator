
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, BookOpen, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Module {
  id: string;
  title: string;
  description: string;
  content: string;
  module_order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  lesson_order: number;
  module_id: string;
}

interface WebCourseContentProps {
  courseId: string;
  courseTitle: string;
}

const WebCourseContent: React.FC<WebCourseContentProps> = ({ courseId, courseTitle }) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCourseContent = async () => {
      try {
        setIsLoading(true);
        
        // Load modules for this course
        const { data: modulesData, error: modulesError } = await supabase
          .from('course_modules')
          .select('*')
          .eq('course_id', courseId)
          .eq('is_active', true)
          .order('module_order');

        if (modulesError) {
          console.error('Error loading modules:', modulesError);
          // Create default modules if none exist
          setModules(createDefaultModules());
          return;
        }

        if (!modulesData || modulesData.length === 0) {
          // Create default modules if none exist
          setModules(createDefaultModules());
          return;
        }

        // Load lessons for each module
        const modulesWithLessons = await Promise.all(
          modulesData.map(async (module) => {
            const { data: lessonsData, error: lessonsError } = await supabase
              .from('lessons')
              .select('*')
              .eq('module_id', module.id)
              .order('lesson_order');

            return {
              ...module,
              lessons: lessonsError ? [] : lessonsData || []
            };
          })
        );

        setModules(modulesWithLessons);
      } catch (error) {
        console.error('Error loading course content:', error);
        setModules(createDefaultModules());
      } finally {
        setIsLoading(false);
      }
    };

    loadCourseContent();
  }, [courseId]);

  const createDefaultModules = (): Module[] => {
    return [
      {
        id: 'default-1',
        title: 'Getting Started',
        description: 'Introduction to the course',
        content: 'Welcome to this comprehensive course! This module will introduce you to the key concepts and objectives.',
        module_order: 1,
        lessons: [
          {
            id: 'lesson-1',
            title: 'Course Overview',
            content: 'In this lesson, you\'ll learn about the course structure, objectives, and what you can expect to achieve by the end.',
            lesson_order: 1,
            module_id: 'default-1'
          },
          {
            id: 'lesson-2',
            title: 'Prerequisites',
            content: 'Before we dive deep, let\'s review the prerequisites and ensure you have everything needed to succeed.',
            lesson_order: 2,
            module_id: 'default-1'
          }
        ]
      },
      {
        id: 'default-2',
        title: 'Core Concepts',
        description: 'Essential knowledge and fundamentals',
        content: 'This module covers the fundamental concepts that form the foundation of everything you\'ll learn in this course.',
        module_order: 2,
        lessons: [
          {
            id: 'lesson-3',
            title: 'Fundamental Principles',
            content: 'Understanding the core principles is crucial for your success. We\'ll explore each principle with practical examples.',
            lesson_order: 1,
            module_id: 'default-2'
          },
          {
            id: 'lesson-4',
            title: 'Key Terminology',
            content: 'Let\'s familiarize ourselves with the important terms and concepts you\'ll encounter throughout the course.',
            lesson_order: 2,
            module_id: 'default-2'
          }
        ]
      },
      {
        id: 'default-3',
        title: 'Practical Application',
        description: 'Hands-on practice and real-world examples',
        content: 'Now that you understand the theory, it\'s time to apply your knowledge with practical exercises and real-world scenarios.',
        module_order: 3,
        lessons: [
          {
            id: 'lesson-5',
            title: 'Practice Exercise 1',
            content: 'Complete this hands-on exercise to reinforce your understanding of the concepts covered in previous modules.',
            lesson_order: 1,
            module_id: 'default-3'
          },
          {
            id: 'lesson-6',
            title: 'Case Study Analysis',
            content: 'Analyze this real-world case study to see how the concepts apply in practical situations.',
            lesson_order: 2,
            module_id: 'default-3'
          }
        ]
      }
    ];
  };

  const currentModule = modules[currentModuleIndex];
  const currentLesson = currentModule?.lessons[currentLessonIndex];

  const markLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev => new Set([...prev, lessonId]));
  };

  const navigateToNext = () => {
    if (!currentModule) return;

    if (currentLessonIndex < currentModule.lessons.length - 1) {
      setCurrentLessonIndex(prev => prev + 1);
    } else if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(prev => prev + 1);
      setCurrentLessonIndex(0);
    }
  };

  const navigateToPrevious = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(prev => prev - 1);
    } else if (currentModuleIndex > 0) {
      setCurrentModuleIndex(prev => prev - 1);
      setCurrentLessonIndex(modules[currentModuleIndex - 1]?.lessons.length - 1 || 0);
    }
  };

  const isFirstLesson = currentModuleIndex === 0 && currentLessonIndex === 0;
  const isLastLesson = currentModuleIndex === modules.length - 1 && 
                      currentLessonIndex === (currentModule?.lessons.length - 1 || 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-[#00C853] border-gray-200 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading course content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{courseTitle}</h1>
        <div className="flex items-center text-sm text-gray-600">
          <BookOpen className="h-4 w-4 mr-1" />
          <span>Module {currentModuleIndex + 1} of {modules.length}</span>
          <span className="mx-2">•</span>
          <span>Lesson {currentLessonIndex + 1} of {currentModule?.lessons.length || 0}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Course Outline Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Course Outline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {modules.map((module, moduleIdx) => (
                <div key={module.id}>
                  <h4 className={`font-medium text-sm mb-2 ${
                    moduleIdx === currentModuleIndex ? 'text-[#00C853]' : 'text-gray-700'
                  }`}>
                    {module.title}
                  </h4>
                  <div className="space-y-1 ml-2">
                    {module.lessons.map((lesson, lessonIdx) => (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          setCurrentModuleIndex(moduleIdx);
                          setCurrentLessonIndex(lessonIdx);
                        }}
                        className={`flex items-center text-xs p-2 rounded w-full text-left transition-colors ${
                          moduleIdx === currentModuleIndex && lessonIdx === currentLessonIndex
                            ? 'bg-[#00C853] text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {completedLessons.has(lesson.id) ? (
                          <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                        ) : (
                          <Circle className="h-3 w-3 mr-2" />
                        )}
                        {lesson.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{currentLesson?.title}</CardTitle>
              <p className="text-gray-600">{currentModule?.title}</p>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 leading-relaxed">
                  {currentLesson?.content}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  onClick={navigateToPrevious}
                  disabled={isFirstLesson}
                  variant="outline"
                  className="flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <Button
                  onClick={() => currentLesson && markLessonComplete(currentLesson.id)}
                  disabled={completedLessons.has(currentLesson?.id || '')}
                  className="bg-[#00C853] hover:bg-[#00B248]"
                >
                  {completedLessons.has(currentLesson?.id || '') ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completed
                    </>
                  ) : (
                    'Mark Complete'
                  )}
                </Button>

                <Button
                  onClick={navigateToNext}
                  disabled={isLastLesson}
                  className="flex items-center bg-[#00C853] hover:bg-[#00B248]"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WebCourseContent;
