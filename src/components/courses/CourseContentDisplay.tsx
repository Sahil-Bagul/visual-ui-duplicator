
import React, { useState, useMemo } from 'react';
import { CheckCircle, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Module, Lesson, UserProgress } from '@/types/course';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface CourseContentDisplayProps {
  modules: Module[];
  lessons: Lesson[];
  userProgress: UserProgress[];
  activeModuleId: string | null;
  activeLessonId: string | null;
  onSelectModule: (module: Module) => void;
  onSelectLesson: (lesson: Lesson) => void;
  onMarkComplete: () => void;
  isMarkingComplete: boolean;
  completedLessonIds: string[];
}

interface LessonItemProps {
  lesson: Lesson;
  isCompleted: boolean;
  isActive: boolean;
  onClick: () => void;
}

const LessonItem: React.FC<LessonItemProps> = ({ lesson, isCompleted, isActive, onClick }) => {
  return (
    <div 
      className={`
        p-2.5 mb-1 rounded-md flex items-center gap-2 cursor-pointer transition-colors
        ${isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}
        ${isCompleted ? 'text-green-700' : ''}
      `}
      onClick={onClick}
    >
      {isCompleted ? (
        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
      ) : (
        <div className={`h-4 w-4 rounded-full border ${isActive ? 'border-blue-500 bg-blue-100' : 'border-gray-300'} flex-shrink-0`} />
      )}
      <span className={`text-sm ${isActive ? 'font-medium' : ''}`}>
        {lesson.title}
      </span>
    </div>
  );
};

const CourseContentDisplay: React.FC<CourseContentDisplayProps> = ({
  modules,
  lessons,
  userProgress,
  activeModuleId,
  activeLessonId,
  onSelectModule,
  onSelectLesson,
  onMarkComplete,
  isMarkingComplete,
  completedLessonIds
}) => {
  // Group lessons by module
  const lessonsByModule = useMemo(() => {
    const groupedLessons: Record<string, Lesson[]> = {};
    modules.forEach(module => {
      groupedLessons[module.id] = lessons.filter(lesson => lesson.module_id === module.id);
    });
    return groupedLessons;
  }, [modules, lessons]);

  // Find active lesson
  const activeLesson = useMemo(() => {
    return lessons.find(lesson => lesson.id === activeLessonId);
  }, [lessons, activeLessonId]);

  // Calculate module progress percentages
  const moduleProgress = useMemo(() => {
    const progress: Record<string, number> = {};
    modules.forEach(module => {
      const moduleLessons = lessonsByModule[module.id] || [];
      const completedCount = completedLessonIds.filter(id => 
        moduleLessons.some(lesson => lesson.id === id)
      ).length;
      progress[module.id] = moduleLessons.length > 0 
        ? Math.round((completedCount / moduleLessons.length) * 100) 
        : 0;
    });
    return progress;
  }, [modules, lessonsByModule, completedLessonIds]);

  // Check if current lesson is completed
  const isCurrentLessonCompleted = activeLessonId 
    ? completedLessonIds.includes(activeLessonId)
    : false;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left sidebar - Unified module and lesson navigation */}
      <div className="md:col-span-1 bg-white rounded-lg shadow-sm border border-gray-100 p-4 h-fit">
        <h2 className="font-semibold text-gray-800 mb-4">Course Content</h2>
        
        <Accordion type="multiple" defaultValue={activeModuleId ? [activeModuleId] : []}>
          {modules.map((module) => {
            const moduleLessons = lessonsByModule[module.id] || [];
            const progress = moduleProgress[module.id];
            const isActive = activeModuleId === module.id;
            
            return (
              <AccordionItem 
                key={module.id} 
                value={module.id}
                className={`${isActive ? 'border-l-2 border-l-blue-500 pl-2' : ''} mb-2 border-b-0`}
              >
                <AccordionTrigger className="hover:no-underline py-2 px-0">
                  <div className="flex flex-col items-start w-full">
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-sm ${isActive ? 'font-medium text-blue-700' : 'text-gray-700'}`}>
                        {module.title}
                      </span>
                      {progress === 100 && (
                        <CheckCircle className="h-4 w-4 text-green-600 ml-2" />
                      )}
                    </div>
                    
                    <div className="w-full mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{completedLessonIds.filter(id => 
                          moduleLessons.some(lesson => lesson.id === id)
                        ).length} of {moduleLessons.length} completed</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="pt-2 pb-1 px-0">
                  <div className="space-y-1 pl-1">
                    {moduleLessons.map((lesson) => (
                      <LessonItem
                        key={lesson.id}
                        lesson={lesson}
                        isCompleted={completedLessonIds.includes(lesson.id)}
                        isActive={lesson.id === activeLessonId}
                        onClick={() => {
                          onSelectModule(module);
                          onSelectLesson(lesson);
                        }}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      {/* Main content area */}
      <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        {activeLesson ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {activeLesson.title}
              </h2>
              {isCurrentLessonCompleted && (
                <div className="flex items-center text-green-600 text-sm bg-green-50 px-2 py-1 rounded-full">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span>Completed</span>
                </div>
              )}
            </div>
            
            <div className="prose max-w-none mb-8" dangerouslySetInnerHTML={{ __html: formatContent(activeLesson.content) }} />
            
            <div className="flex justify-between pt-4 border-t border-gray-100">
              <Button 
                variant="outline" 
                onClick={() => {
                  const moduleId = activeLesson.module_id;
                  const moduleLessons = lessonsByModule[moduleId] || [];
                  const currentIndex = moduleLessons.findIndex(l => l.id === activeLesson.id);
                  
                  if (currentIndex > 0) {
                    onSelectLesson(moduleLessons[currentIndex - 1]);
                  } else {
                    // Go to previous module's last lesson if possible
                    const moduleIndex = modules.findIndex(m => m.id === moduleId);
                    if (moduleIndex > 0) {
                      const prevModule = modules[moduleIndex - 1];
                      const prevModuleLessons = lessonsByModule[prevModule.id] || [];
                      if (prevModuleLessons.length > 0) {
                        onSelectModule(prevModule);
                        onSelectLesson(prevModuleLessons[prevModuleLessons.length - 1]);
                      }
                    }
                  }
                }}
                disabled={!getPreviousLesson(activeLesson)}
                className="flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-arrow-left">
                  <path d="M19 12H5"></path>
                  <path d="m12 19-7-7 7-7"></path>
                </svg>
                Previous Lesson
              </Button>
              
              {!isCurrentLessonCompleted ? (
                <Button 
                  onClick={onMarkComplete}
                  disabled={isMarkingComplete}
                  className="bg-[#00C853] hover:bg-green-700 flex items-center gap-1.5"
                >
                  {isMarkingComplete ? "Saving..." : "Mark as Complete"}
                  {!isMarkingComplete && <CheckCircle className="h-4 w-4" />}
                </Button>
              ) : (
                <Button 
                  onClick={() => {
                    const nextLesson = getNextLesson(activeLesson);
                    if (nextLesson) {
                      if (nextLesson.module_id !== activeLesson.module_id) {
                        const nextModule = modules.find(m => m.id === nextLesson.module_id);
                        if (nextModule) {
                          onSelectModule(nextModule);
                        }
                      }
                      onSelectLesson(nextLesson);
                    }
                  }}
                  disabled={!getNextLesson(activeLesson)}
                  className="bg-[#4F46E5] hover:bg-blue-700 flex items-center gap-1.5"
                >
                  Next Lesson 
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-arrow-right">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </Button>
              )}
            </div>
            
            {isModuleCompleted(activeLesson.module_id) && (
              <div className="mt-8 p-4 bg-green-50 border border-green-100 rounded-lg text-center">
                <h3 className="text-green-800 font-medium">🎉 Module Completed!</h3>
                <p className="text-green-700 text-sm mt-1">Congratulations on completing all lessons in this module.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-2">Ready to start learning?</p>
            <p className="text-gray-400 text-sm mb-6">Select a lesson from the sidebar to begin.</p>
            
            {modules.length > 0 && (
              <Button 
                onClick={() => {
                  const firstModule = modules[0];
                  const firstModuleLessons = lessonsByModule[firstModule.id] || [];
                  if (firstModuleLessons.length > 0) {
                    onSelectModule(firstModule);
                    onSelectLesson(firstModuleLessons[0]);
                  }
                }}
                className="bg-[#4F46E5] hover:bg-blue-700"
              >
                Start First Lesson
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Helper function to check if a module is completed
  function isModuleCompleted(moduleId: string) {
    const moduleLessons = lessons.filter(lesson => lesson.module_id === moduleId);
    const completedModuleLessons = moduleLessons.filter(lesson => 
      completedLessonIds.includes(lesson.id)
    );
    
    return moduleLessons.length > 0 && completedModuleLessons.length === moduleLessons.length;
  }

  // Helper function to get next lesson
  function getNextLesson(currentLesson: Lesson): Lesson | null {
    const moduleLessons = lessonsByModule[currentLesson.module_id] || [];
    const currentIndex = moduleLessons.findIndex(l => l.id === currentLesson.id);
    
    if (currentIndex < moduleLessons.length - 1) {
      return moduleLessons[currentIndex + 1];
    } else {
      // Check next module
      const moduleIndex = modules.findIndex(m => m.id === currentLesson.module_id);
      if (moduleIndex < modules.length - 1) {
        const nextModule = modules[moduleIndex + 1];
        const nextModuleLessons = lessonsByModule[nextModule.id] || [];
        if (nextModuleLessons.length > 0) {
          return nextModuleLessons[0];
        }
      }
    }
    
    return null;
  }

  // Helper function to get previous lesson
  function getPreviousLesson(currentLesson: Lesson): Lesson | null {
    const moduleLessons = lessonsByModule[currentLesson.module_id] || [];
    const currentIndex = moduleLessons.findIndex(l => l.id === currentLesson.id);
    
    if (currentIndex > 0) {
      return moduleLessons[currentIndex - 1];
    } else {
      // Check previous module
      const moduleIndex = modules.findIndex(m => m.id === currentLesson.module_id);
      if (moduleIndex > 0) {
        const prevModule = modules[moduleIndex - 1];
        const prevModuleLessons = lessonsByModule[prevModule.id] || [];
        if (prevModuleLessons.length > 0) {
          return prevModuleLessons[prevModuleLessons.length - 1];
        }
      }
    }
    
    return null;
  }
};

// Helper function to format content with Markdown-like formatting
function formatContent(content: string): string {
  if (!content) return '';
  
  // Convert markdown-style headers to HTML
  let formattedContent = content
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold text-gray-800 mt-6 mb-3">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-medium text-gray-700 mt-5 mb-2">$1</h3>')
    .replace(/^#### (.+)$/gm, '<h4 class="text-base font-medium text-gray-700 mt-4 mb-2">$1</h4>')
    
    // Format bold text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\_\_(.+?)\_\_/g, '<strong>$1</strong>')
    
    // Format italic text
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\_(.+?)\_/g, '<em>$1</em>')
    
    // Format lists
    .replace(/^\- (.+)$/gm, '<li class="ml-6 list-disc text-gray-700 mb-1">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-6 list-decimal text-gray-700 mb-1">$1</li>')
    
    // Format paragraphs (ensuring they have proper spacing)
    .replace(/^(?!(#|<h|<li|<\/ul|<ul|<ol|<\/ol))(.+)$/gm, '<p class="mb-4 text-gray-700">$2</p>')
    
    // Wrap adjacent list items in ul/ol tags
    .replace(/(<li class="ml-6 list-disc.+?<\/li>\n)+/g, '<ul class="my-3">$&</ul>')
    .replace(/(<li class="ml-6 list-decimal.+?<\/li>\n)+/g, '<ol class="my-3">$&</ol>')
    
    // Format code blocks
    .replace(/```(.+?)```/gs, '<pre class="bg-gray-50 p-3 rounded-md text-sm my-4 overflow-x-auto">$1</pre>')
    
    // Format inline code
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
    
    // Format blockquotes
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-gray-200 pl-4 italic text-gray-600 my-4">$1</blockquote>')
    
    // Handle tables (basic implementation)
    .replace(/\|(.+)\|/g, '<tr>$1</tr>')
    .replace(/<tr>(.+?)<\/tr>/g, function(match) {
      return match.replace(/\|(.+?)\|/g, '<td class="border px-4 py-2">$1</td>');
    })
    .replace(/(<tr>.+?<\/tr>\n)+/g, '<table class="min-w-full border-collapse my-4">$&</table>')
    
    // Format horizontal rules
    .replace(/^---$/gm, '<hr class="my-6 border-t border-gray-200" />');
  
  return formattedContent;
}

export default CourseContentDisplay;
