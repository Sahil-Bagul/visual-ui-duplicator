
import { supabase } from '@/integrations/supabase/client';
import { Module, Lesson, CourseWithProgress } from '@/types/course';

// Export the type so it can be used in other files
export type { CourseWithProgress } from '@/types/course';

// Get course with its modules and lessons
export async function getCourseWithContent(courseId: string): Promise<CourseWithProgress | null> {
  try {
    console.log('Fetching course with content for courseId:', courseId);
    
    // First get the course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError) {
      console.error('Error fetching course:', courseError);
      return null;
    }

    // Get modules for this course
    const { data: modules, error: modulesError } = await supabase
      .from('course_modules')
      .select(`
        *,
        lessons (*)
      `)
      .eq('course_id', courseId)
      .order('module_order', { ascending: true });

    if (modulesError) {
      console.error('Error fetching modules:', modulesError);
      return null;
    }

    // Get user progress
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (progressError) {
      console.error('Error fetching progress:', progressError);
    }

    // Calculate progress
    const totalModules = modules?.length || 0;
    const completedModules = progressData?.filter(p => p.completed && p.module_id).length || 0;
    const progress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

    const result: CourseWithProgress = {
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      modules: modules as Module[] || [],
      totalModules,
      completedModules,
      progress
    };

    console.log('Successfully fetched course with content:', result);
    return result;
  } catch (error) {
    console.error('Exception fetching course content:', error);
    return null;
  }
}

// Get user's purchased courses with progress
export async function getUserCourses(): Promise<CourseWithProgress[]> {
  try {
    console.log('Fetching user courses...');
    
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) {
      console.error('No authenticated user found');
      return [];
    }

    // Get purchased courses
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select(`
        *,
        courses (*)
      `)
      .eq('user_id', userId)
      .eq('payment_status', 'completed');

    if (purchasesError) {
      console.error('Error fetching purchases:', purchasesError);
      return [];
    }

    if (!purchases || purchases.length === 0) {
      console.log('No purchased courses found');
      return [];
    }

    // Get detailed course content for each purchased course
    const coursesWithContent = await Promise.all(
      purchases.map(async (purchase) => {
        return await getCourseWithContent(purchase.course_id);
      })
    );

    // Filter out null results
    const validCourses = coursesWithContent.filter(course => course !== null) as CourseWithProgress[];
    
    console.log('Successfully fetched user courses:', validCourses.length);
    return validCourses;
  } catch (error) {
    console.error('Exception fetching user courses:', error);
    return [];
  }
}

// Check if user has access to a course
export async function hasUserAccessToCourse(courseId: string): Promise<boolean> {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return false;

    const { data, error } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('payment_status', 'completed')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking course access:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Exception checking course access:', error);
    return false;
  }
}
