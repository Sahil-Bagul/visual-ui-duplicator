
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Play, Lock, BookOpen, Clock } from 'lucide-react';

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

interface Course {
  id: string;
  title: string;
  description: string;
  modules: Module[];
}

interface UserProgress {
  lesson_id: string;
  completed: boolean;
  completed_at: string;
}

interface ModularCourseContentProps {
  course: Course;
  userProgress: UserProgress[];
  onLessonComplete: (lessonId: string) => void;
}

const ModularCourseContent: React.FC<ModularCourseContentProps> = ({
  course,
  userProgress,
  onLessonComplete
}) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  // Calculate progress
  const allLessons = course.modules.flatMap(module => module.lessons);
  const completedLessons = userProgress.filter(p => p.completed).length;
  const progressPercentage = allLessons.length > 0 ? (completedLessons / allLessons.length) * 100 : 0;

  const isLessonCompleted = (lessonId: string) => {
    return userProgress.some(p => p.lesson_id === lessonId && p.completed);
  };

  const handleModuleClick = (moduleId: string) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const handleMarkComplete = () => {
    if (selectedLesson) {
      onLessonComplete(selectedLesson.id);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Course Navigation Sidebar */}
      <div className="lg:col-span-1">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle className="text-lg">{course.title}</CardTitle>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="text-xs text-gray-600">
                {completedLessons} of {allLessons.length} lessons completed
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[60vh] overflow-y-auto">
              {course.modules
                .sort((a, b) => a.module_order - b.module_order)
                .map((module, moduleIndex) => (
                  <div key={module.id} className="border-b border-gray-100 last:border-b-0">
                    <button
                      onClick={() => handleModuleClick(module.id)}
                      className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-gray-600" />
                          <span className="font-medium text-sm">
                            Module {moduleIndex + 1}: {module.title}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {module.lessons.length} lessons
                        </Badge>
                      </div>
                    </button>
                    
                    {expandedModule === module.id && (
                      <div className="bg-gray-50">
                        {module.lessons
                          .sort((a, b) => a.lesson_order - b.lesson_order)
                          .map((lesson, lessonIndex) => {
                            const completed = isLessonCompleted(lesson.id);
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => handleLessonClick(lesson)}
                                className={`w-full p-3 pl-8 text-left hover:bg-gray-100 transition-colors border-l-2 ${
                                  selectedLesson?.id === lesson.id 
                                    ? 'border-[#00C853] bg-green-50' 
                                    : 'border-transparent'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  {completed ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Play className="h-4 w-4 text-gray-400" />
                                  )}
                                  <span className={`text-sm ${completed ? 'text-green-700' : 'text-gray-700'}`}>
                                    {lessonIndex + 1}. {lesson.title}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3">
        {selectedLesson ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{selectedLesson.title}</CardTitle>
                <div className="flex items-center space-x-2">
                  {isLessonCompleted(selectedLesson.id) ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      In Progress
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none mb-6">
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedLesson.content }}
                />
              </div>
              
              {!isLessonCompleted(selectedLesson.id) && (
                <div className="border-t pt-4">
                  <Button 
                    onClick={handleMarkComplete}
                    className="bg-[#00C853] hover:bg-green-700"
                  >
                    Mark as Complete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to {course.title}</h3>
              <p className="text-gray-600 mb-6">{course.description}</p>
              <p className="text-sm text-gray-500">
                Select a lesson from the sidebar to start learning
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ModularCourseContent;
