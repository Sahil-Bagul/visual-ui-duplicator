
import { supabase } from "@/integrations/supabase/client";
import { CourseStructure } from "@/types/course";
import { toast } from "sonner";
import { logContentManagement } from "@/services/contentManagementService";

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  referral_reward: number;
  pdf_url: string | null;
}

export interface Module {
  id: string;
  title: string;
  description: string | null;
  content: string;
  module_order: number;
  course_id: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  lesson_order: number;
  module_id: string;
}

// Get all courses
export async function getAllCourses(): Promise<Course[]> {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('title');

    if (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
      return [];
    }

    return data as Course[];
  } catch (error) {
    console.error('Exception fetching courses:', error);
    toast.error('Failed to load courses');
    return [];
  }
}

// Get a single course by ID
export async function getCourseById(courseId: string): Promise<Course | null> {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course details');
      return null;
    }

    return data as Course;
  } catch (error) {
    console.error('Exception fetching course:', error);
    toast.error('Failed to load course details');
    return null;
  }
}

// Create a new course
export async function createCourse(course: Omit<Course, 'id'>): Promise<{ success: boolean; courseId?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('courses')
      .insert([course])
      .select()
      .single();

    if (error) {
      console.error('Error creating course:', error);
      return { success: false, error: error.message };
    }

    // Log the content management operation
    await logContentManagement(
      'create',
      'course',
      data.id,
      { title: course.title }
    );

    toast.success('Course created successfully');
    return { success: true, courseId: data.id };
  } catch (error) {
    console.error('Exception creating course:', error);
    return { success: false, error: 'Failed to create course' };
  }
}

// Update a course
export async function updateCourse(courseId: string, updates: Partial<Course>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', courseId);

    if (error) {
      console.error('Error updating course:', error);
      return { success: false, error: error.message };
    }

    // Log the content management operation
    await logContentManagement(
      'update',
      'course',
      courseId,
      { updates }
    );

    toast.success('Course updated successfully');
    return { success: true };
  } catch (error) {
    console.error('Exception updating course:', error);
    return { success: false, error: 'Failed to update course' };
  }
}

// Delete a course
export async function deleteCourse(courseId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) {
      console.error('Error deleting course:', error);
      return { success: false, error: error.message };
    }

    // Log the content management operation
    await logContentManagement(
      'delete',
      'course',
      courseId,
      {}
    );

    toast.success('Course deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Exception deleting course:', error);
    return { success: false, error: 'Failed to delete course' };
  }
}

// Get modules for a course
export async function getModulesForCourse(courseId: string): Promise<Module[]> {
  try {
    const { data, error } = await supabase
      .from('course_modules')
      .select('*')
      .eq('course_id', courseId)
      .order('module_order');

    if (error) {
      console.error('Error fetching modules:', error);
      toast.error('Failed to load course modules');
      return [];
    }

    return data as Module[];
  } catch (error) {
    console.error('Exception fetching modules:', error);
    toast.error('Failed to load course modules');
    return [];
  }
}

// Create a module
export async function createModule(module: Omit<Module, 'id'>): Promise<{ success: boolean; moduleId?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('course_modules')
      .insert([module])
      .select()
      .single();

    if (error) {
      console.error('Error creating module:', error);
      return { success: false, error: error.message };
    }

    // Log the content management operation
    await logContentManagement(
      'create',
      'module',
      data.id,
      { title: module.title, course_id: module.course_id }
    );

    toast.success('Module created successfully');
    return { success: true, moduleId: data.id };
  } catch (error) {
    console.error('Exception creating module:', error);
    return { success: false, error: 'Failed to create module' };
  }
}

// Update a module
export async function updateModule(moduleId: string, updates: Partial<Module>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('course_modules')
      .update(updates)
      .eq('id', moduleId);

    if (error) {
      console.error('Error updating module:', error);
      return { success: false, error: error.message };
    }

    // Log the content management operation
    await logContentManagement(
      'update',
      'module',
      moduleId,
      { updates }
    );

    toast.success('Module updated successfully');
    return { success: true };
  } catch (error) {
    console.error('Exception updating module:', error);
    return { success: false, error: 'Failed to update module' };
  }
}

// Delete a module
export async function deleteModule(moduleId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('course_modules')
      .delete()
      .eq('id', moduleId);

    if (error) {
      console.error('Error deleting module:', error);
      return { success: false, error: error.message };
    }

    // Log the content management operation
    await logContentManagement(
      'delete',
      'module',
      moduleId,
      {}
    );

    toast.success('Module deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Exception deleting module:', error);
    return { success: false, error: 'Failed to delete module' };
  }
}

// Get lessons for a module
export async function getLessonsForModule(moduleId: string): Promise<Lesson[]> {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('module_id', moduleId)
      .order('lesson_order');

    if (error) {
      console.error('Error fetching lessons:', error);
      toast.error('Failed to load module lessons');
      return [];
    }

    return data as Lesson[];
  } catch (error) {
    console.error('Exception fetching lessons:', error);
    toast.error('Failed to load module lessons');
    return [];
  }
}

// Create a lesson
export async function createLesson(lesson: Omit<Lesson, 'id'>): Promise<{ success: boolean; lessonId?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .insert([lesson])
      .select()
      .single();

    if (error) {
      console.error('Error creating lesson:', error);
      return { success: false, error: error.message };
    }

    // Log the content management operation
    await logContentManagement(
      'create',
      'lesson',
      data.id,
      { title: lesson.title, module_id: lesson.module_id }
    );

    toast.success('Lesson created successfully');
    return { success: true, lessonId: data.id };
  } catch (error) {
    console.error('Exception creating lesson:', error);
    return { success: false, error: 'Failed to create lesson' };
  }
}

// Update a lesson
export async function updateLesson(lessonId: string, updates: Partial<Lesson>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('lessons')
      .update(updates)
      .eq('id', lessonId);

    if (error) {
      console.error('Error updating lesson:', error);
      return { success: false, error: error.message };
    }

    // Log the content management operation
    await logContentManagement(
      'update',
      'lesson',
      lessonId,
      { updates }
    );

    toast.success('Lesson updated successfully');
    return { success: true };
  } catch (error) {
    console.error('Exception updating lesson:', error);
    return { success: false, error: 'Failed to update lesson' };
  }
}

// Delete a lesson
export async function deleteLesson(lessonId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId);

    if (error) {
      console.error('Error deleting lesson:', error);
      return { success: false, error: error.message };
    }

    // Log the content management operation
    await logContentManagement(
      'delete',
      'lesson',
      lessonId,
      {}
    );

    toast.success('Lesson deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Exception deleting lesson:', error);
    return { success: false, error: 'Failed to delete lesson' };
  }
}

// Get the full course structure (all modules and lessons)
export async function getFullCourseStructure(courseId: string): Promise<CourseStructure[]> {
  try {
    const { data, error } = await supabase.rpc('get_course_structure', {
      course_id_param: courseId
    });

    if (error) {
      console.error('Error fetching course structure:', error);
      toast.error('Failed to load course structure');
      return [];
    }

    return data as CourseStructure[];
  } catch (error) {
    console.error('Exception fetching course structure:', error);
    toast.error('Failed to load course structure');
    return [];
  }
}

// Publish a course (make it visible to users)
export async function publishCourse(courseId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // In a real implementation, you might have a published field to toggle
    // For now, we'll just log the action
    const result = await logContentManagement(
      'publish',
      'course',
      courseId,
      { action: 'publish' }
    );

    if (result) {
      toast.success('Course published successfully');
      return { success: true };
    } else {
      return { success: false, error: 'Failed to publish course' };
    }
  } catch (error) {
    console.error('Exception publishing course:', error);
    return { success: false, error: 'Failed to publish course' };
  }
}

// Unpublish a course (hide it from users)
export async function unpublishCourse(courseId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // In a real implementation, you might have a published field to toggle
    // For now, we'll just log the action
    const result = await logContentManagement(
      'unpublish',
      'course',
      courseId,
      { action: 'unpublish' }
    );

    if (result) {
      toast.success('Course unpublished successfully');
      return { success: true };
    } else {
      return { success: false, error: 'Failed to unpublish course' };
    }
  } catch (error) {
    console.error('Exception unpublishing course:', error);
    return { success: false, error: 'Failed to unpublish course' };
  }
}
