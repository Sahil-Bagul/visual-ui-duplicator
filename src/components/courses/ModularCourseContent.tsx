
import React, { useState } from 'react';
import { CheckCircle, BookOpen, PlayCircle, Lock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface Lesson {
  id: string;
  title: string;
  content: string;
  lesson_order: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  module_order: number;
  lessons: Lesson[];
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  modules: Module[];
}

interface ModularCourseContentProps {
  course: CourseData;
  userProgress?: any[];
  onLessonComplete?: (lessonId: string) => void;
}

const ModularCourseContent: React.FC<ModularCourseContentProps> = ({ 
  course, 
  userProgress = [],
  onLessonComplete 
}) => {
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // Calculate progress
  const totalLessons = course.modules.reduce((total, module) => total + module.lessons.length, 0);
  const completedLessons = userProgress.filter(p => p.completed).length;
  const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  // Find active lesson
  const activeLesson = course.modules
    .flatMap(module => module.lessons)
    .find(lesson => lesson.id === activeLessonId);

  const isLessonCompleted = (lessonId: string) => {
    return userProgress.some(p => p.lesson_id === lessonId && p.completed);
  };

  const getModuleProgress = (moduleId: string) => {
    const module = course.modules.find(m => m.id === moduleId);
    if (!module) return 0;
    
    const moduleLessons = module.lessons.length;
    const completedInModule = module.lessons.filter(lesson => 
      isLessonCompleted(lesson.id)
    ).length;
    
    return moduleLessons > 0 ? (completedInModule / moduleLessons) * 100 : 0;
  };

  const handleLessonSelect = (moduleId: string, lessonId: string) => {
    setActiveModuleId(moduleId);
    setActiveLessonId(lessonId);
  };

  const handleMarkComplete = () => {
    if (activeLessonId && onLessonComplete) {
      onLessonComplete(activeLessonId);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Course navigation sidebar */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="text-lg">{course.title}</CardTitle>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{completedLessons} of {totalLessons} completed</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          </CardHeader>
          
          <CardContent className="p-4">
            <Accordion type="multiple" defaultValue={course.modules.map(m => m.id)}>
              {course.modules.map((module) => {
                const moduleProgress = getModuleProgress(module.id);
                const isModuleActive = activeModuleId === module.id;
                
                return (
                  <AccordionItem key={module.id} value={module.id} className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex flex-col items-start w-full">
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-sm font-medium ${isModuleActive ? 'text-blue-700' : 'text-gray-800'}`}>
                            {module.title}
                          </span>
                          {moduleProgress === 100 && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <div className="w-full mt-2">
                          <Progress value={moduleProgress} className="h-1.5" />
                        </div>
                      </div>
                    </AccordionTrigger>
                    
                    <AccordionContent className="pt-2">
                      <div className="space-y-1">
                        {module.lessons.map((lesson) => {
                          const isCompleted = isLessonCompleted(lesson.id);
                          const isActive = activeLessonId === lesson.id;
                          
                          return (
                            <div
                              key={lesson.id}
                              className={`
                                p-2 rounded-md flex items-center gap-2 cursor-pointer transition-colors
                                ${isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}
                              `}
                              onClick={() => handleLessonSelect(module.id, lesson.id)}
                            >
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                              ) : (
                                <div className={`h-4 w-4 rounded-full border flex-shrink-0 ${
                                  isActive ? 'border-blue-500 bg-blue-100' : 'border-gray-300'
                                }`} />
                              )}
                              <span className={`text-sm ${isActive ? 'font-medium' : ''}`}>
                                {lesson.title}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* Main content area */}
      <div className="lg:col-span-3">
        <Card>
          <CardContent className="p-6">
            {activeLesson ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {activeLesson.title}
                    </h1>
                    <Badge variant="outline" className="text-xs">
                      Lesson {activeLesson.lesson_order}
                    </Badge>
                  </div>
                  {isLessonCompleted(activeLesson.id) && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
                
                <div 
                  className="prose max-w-none mb-8"
                  dangerouslySetInnerHTML={{ __html: formatContent(activeLesson.content) }}
                />
                
                <div className="flex justify-between pt-6 border-t border-gray-100">
                  <Button variant="outline">
                    Previous Lesson
                  </Button>
                  
                  {!isLessonCompleted(activeLesson.id) ? (
                    <Button 
                      onClick={handleMarkComplete}
                      className="bg-[#00C853] hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Complete
                    </Button>
                  ) : (
                    <Button className="bg-[#4F46E5] hover:bg-blue-700">
                      Next Lesson
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <BookOpen className="h-20 w-20 text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-600 mb-2">Welcome to {course.title}</h2>
                <p className="text-gray-500 text-center mb-6 max-w-md">
                  Select a lesson from the sidebar to begin your learning journey. 
                  Track your progress as you complete each module.
                </p>
                
                {course.modules.length > 0 && course.modules[0].lessons.length > 0 && (
                  <Button 
                    onClick={() => handleLessonSelect(course.modules[0].id, course.modules[0].lessons[0].id)}
                    className="bg-[#4F46E5] hover:bg-blue-700"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Start First Lesson
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper function to format content
function formatContent(content: string): string {
  if (!content) return '';
  
  return content
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold text-gray-800 mt-6 mb-3">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-medium text-gray-700 mt-5 mb-2">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^\- (.+)$/gm, '<li class="ml-6 list-disc text-gray-700 mb-1">$1</li>')
    .replace(/^(?!(#|<h|<li))(.+)$/gm, '<p class="mb-4 text-gray-700">$2</p>')
    .replace(/(<li class="ml-6 list-disc.+?<\/li>\n)+/g, '<ul class="my-3">$&</ul>');
}

export default ModularCourseContent;
