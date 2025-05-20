
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Course {
  id: string;
  title: string;
}

interface Module {
  id: string;
  title: string;
  module_order: number;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  lesson_order: number;
}

const LessonContentManager = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [selectedLesson, setSelectedLesson] = useState<string>('');
  const [lessonContent, setLessonContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch modules when a course is selected
  useEffect(() => {
    if (selectedCourse) {
      fetchModules(selectedCourse);
      setSelectedModule('');
      setSelectedLesson('');
      setLessonContent('');
    }
  }, [selectedCourse]);

  // Fetch lessons when a module is selected
  useEffect(() => {
    if (selectedModule) {
      fetchLessons(selectedModule);
      setSelectedLesson('');
      setLessonContent('');
    }
  }, [selectedModule]);

  // Fetch lesson content when a lesson is selected
  useEffect(() => {
    if (selectedLesson) {
      fetchLessonContent(selectedLesson);
    }
  }, [selectedLesson]);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .order('title');

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModules = async (courseId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('course_modules')
        .select('id, title, module_order')
        .eq('course_id', courseId)
        .order('module_order');

      if (error) throw error;
      setModules(data || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast({
        title: "Error",
        description: "Failed to fetch modules",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLessons = async (moduleId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title, content, lesson_order')
        .eq('module_id', moduleId)
        .order('lesson_order');

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast({
        title: "Error",
        description: "Failed to fetch lessons",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLessonContent = async (lessonId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('content')
        .eq('id', lessonId)
        .single();

      if (error) throw error;
      setLessonContent(data?.content || '');
    } catch (error) {
      console.error('Error fetching lesson content:', error);
      toast({
        title: "Error",
        description: "Failed to fetch lesson content",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveContent = async () => {
    if (!selectedLesson || !lessonContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a lesson and provide content",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ content: lessonContent })
        .eq('id', selectedLesson);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lesson content updated successfully",
      });
    } catch (error) {
      console.error('Error updating lesson content:', error);
      toast({
        title: "Error",
        description: "Failed to update lesson content",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Update Lesson Content</CardTitle>
        <CardDescription>
          Select a course, module, and lesson to update its content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select Course
            </label>
            <Select
              value={selectedCourse}
              onValueChange={setSelectedCourse}
              disabled={isLoading || courses.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Courses</SelectLabel>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="module-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select Module
            </label>
            <Select
              value={selectedModule}
              onValueChange={setSelectedModule}
              disabled={isLoading || !selectedCourse || modules.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a module" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Modules</SelectLabel>
                  {modules.map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.module_order}. {module.title}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="lesson-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select Lesson
            </label>
            <Select
              value={selectedLesson}
              onValueChange={setSelectedLesson}
              disabled={isLoading || !selectedModule || lessons.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a lesson" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Lessons</SelectLabel>
                  {lessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      {lesson.lesson_order}. {lesson.title}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="lesson-content" className="block text-sm font-medium text-gray-700 mb-1">
              Lesson Content
            </label>
            <Textarea
              id="lesson-content"
              value={lessonContent}
              onChange={(e) => setLessonContent(e.target.value)}
              disabled={isLoading || !selectedLesson}
              placeholder="Enter lesson content here..."
              className="min-h-[300px]"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSaveContent} 
          disabled={isSaving || !selectedLesson || !lessonContent.trim()}
          className="bg-[#00C853] hover:bg-green-700 ml-auto"
        >
          {isSaving ? "Saving..." : "Save Content"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LessonContentManager;
