
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Helper function to insert a new course with modules and lessons
 */
export const setupAIToolsCourse = async () => {
  try {
    // Step 1: Insert the course
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .insert({
        title: 'AI Tools for Students',
        description: 'A beginner-friendly course to help students learn about the most useful AI tools for productivity, learning, and creativity.',
        price: 500,
        referral_reward: 250 // 50% of the price
      })
      .select('id')
      .single();
      
    if (courseError) throw courseError;
    const courseId = courseData.id;
    
    // Step 2: Insert modules
    const modules = [
      { 
        title: 'Introduction to AI', 
        description: 'Learn the basics of artificial intelligence and why it matters for students.',
        module_order: 1
      },
      { 
        title: 'AI Tools for Studying', 
        description: 'Discover AI-powered tools to enhance your study sessions and note-taking.',
        module_order: 2
      },
      { 
        title: 'AI Tools for Creativity', 
        description: 'Explore AI tools that can boost your creativity and help with content creation.',
        module_order: 3
      },
      { 
        title: 'AI for Communication', 
        description: 'Learn how AI can improve your communication skills and help with professional writing.',
        module_order: 4
      },
      { 
        title: 'Using ChatGPT like a Pro', 
        description: 'Master advanced techniques for getting the most out of ChatGPT for academic purposes.',
        module_order: 5
      }
    ];
    
    for (const module of modules) {
      // Insert the module
      const { data: moduleData, error: moduleError } = await supabase
        .from('course_modules')
        .insert({
          course_id: courseId,
          title: module.title,
          description: module.description,
          content: `Content for ${module.title} module.`,
          module_order: module.module_order
        })
        .select('id')
        .single();
      
      if (moduleError) throw moduleError;
      const moduleId = moduleData.id;
      
      // Step 3: Insert lessons for each module
      let lessons = [];
      
      if (module.module_order === 1) {
        lessons = [
          { title: 'What is Artificial Intelligence?', lesson_order: 1 },
          { title: 'Why AI matters for students', lesson_order: 2 },
          { title: 'Real-world examples', lesson_order: 3 }
        ];
      } else if (module.module_order === 2) {
        lessons = [
          { title: 'AI Note-Taking Tools (e.g., Notion AI, Otter.ai)', lesson_order: 1 },
          { title: 'Summarizers (e.g., ChatGPT, TLDR)', lesson_order: 2 },
          { title: 'Study planners and reminders', lesson_order: 3 }
        ];
      } else if (module.module_order === 3) {
        lessons = [
          { title: 'Image Generators (e.g., DALL·E, Leonardo AI)', lesson_order: 1 },
          { title: 'Presentation Builders (e.g., Tome)', lesson_order: 2 },
          { title: 'Content creation help (e.g., Copy.ai)', lesson_order: 3 }
        ];
      } else if (module.module_order === 4) {
        lessons = [
          { title: 'Email Assistants', lesson_order: 1 },
          { title: 'Resume & Cover Letter Builders', lesson_order: 2 },
          { title: 'Meeting Transcription Tools', lesson_order: 3 }
        ];
      } else if (module.module_order === 5) {
        lessons = [
          { title: 'Prompting Techniques', lesson_order: 1 },
          { title: 'Real examples: Homework, Project help, Career prep', lesson_order: 2 }
        ];
      }
      
      for (const lesson of lessons) {
        // Insert each lesson with placeholder content
        const { error: lessonError } = await supabase
          .from('lessons')
          .insert({
            module_id: moduleId,
            title: lesson.title,
            content: `Placeholder content for ${lesson.title}. You will add the detailed content later.`,
            lesson_order: lesson.lesson_order
          });
        
        if (lessonError) throw lessonError;
      }
    }
    
    return { success: true, courseId };
  } catch (error) {
    console.error('Error setting up course:', error);
    return { success: false, error };
  }
};
