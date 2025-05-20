
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Helper function to clear all lesson content
 */
export const clearAllLessonContent = async () => {
  try {
    // Update all lessons to have empty content
    const { error } = await supabase
      .from('lessons')
      .update({ content: "" })
      .not('content', 'eq', '');
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error clearing lesson content:', error);
    return { success: false, error };
  }
};

/**
 * Helper function to set up AI Tools course with modules and lessons
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
        title: 'Essential AI Tools', 
        description: 'Discover practical AI tools that you can start using today.',
        module_order: 2
      },
      { 
        title: 'Using AI for Studies', 
        description: 'Learn how to leverage AI to enhance your academic performance.',
        module_order: 3
      },
      { 
        title: 'Responsible AI Use', 
        description: 'Understanding the ethical considerations and best practices for AI use.',
        module_order: 4
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
          content: '',
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
          { title: 'Why Should Students Care About AI?', lesson_order: 2 },
          { title: 'Real-Life Examples of AI in Daily Use', lesson_order: 3 }
        ];
      } else if (module.module_order === 2) {
        lessons = [
          { title: 'ChatGPT – Smart Conversations', lesson_order: 1 },
          { title: 'Grammarly – Better Writing with AI', lesson_order: 2 },
          { title: 'Canva – AI for Design', lesson_order: 3 },
          { title: 'Notion AI – Smarter Notes and Docs', lesson_order: 4 }
        ];
      } else if (module.module_order === 3) {
        lessons = [
          { title: 'AI for Research & Summaries', lesson_order: 1 },
          { title: 'AI for Note-Taking and Productivity', lesson_order: 2 },
          { title: 'Using AI to Generate Ideas and Projects', lesson_order: 3 }
        ];
      } else if (module.module_order === 4) {
        lessons = [
          { title: 'Ethics of Using AI in Education', lesson_order: 1 },
          { title: 'How to Avoid Misusing AI Tools', lesson_order: 2 },
          { title: 'Being Future-Ready with AI Skills', lesson_order: 3 }
        ];
      }
      
      for (const lesson of lessons) {
        // Insert each lesson with empty content
        const { error: lessonError } = await supabase
          .from('lessons')
          .insert({
            module_id: moduleId,
            title: lesson.title,
            content: '',
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

/**
 * Helper function to set up Stock Investment course with modules and lessons
 */
export const setupStockInvestmentCourse = async () => {
  try {
    // Step 1: Insert the course
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .insert({
        title: 'Introduction to Stock Investment',
        description: 'Learn the fundamentals of stock market investing with this beginner-friendly course designed specifically for college students.',
        price: 1000,
        referral_reward: 500 // 50% of the price
      })
      .select('id')
      .single();
      
    if (courseError) throw courseError;
    const courseId = courseData.id;
    
    // Step 2: Insert modules
    const modules = [
      { 
        title: 'Getting Started with Investing', 
        description: 'Understand the basics of investing and why it matters for your financial future.',
        module_order: 1
      },
      { 
        title: 'Understanding the Stock Market', 
        description: 'Learn how the stock market works and the key concepts every investor should know.',
        module_order: 2
      },
      { 
        title: 'Investing for Beginners', 
        description: 'Practical guidance on how to approach investing as a beginner.',
        module_order: 3
      },
      { 
        title: 'Making Your First Investment', 
        description: 'Step-by-step guidance to make your first stock purchase and manage your portfolio.',
        module_order: 4
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
          content: '',
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
          { title: 'Why Should You Invest?', lesson_order: 1 },
          { title: 'Compounding and Time Value of Money', lesson_order: 2 },
          { title: 'Risk vs Reward in Stocks', lesson_order: 3 }
        ];
      } else if (module.module_order === 2) {
        lessons = [
          { title: 'What is the Stock Market?', lesson_order: 1 },
          { title: 'How Do Stocks Work?', lesson_order: 2 },
          { title: 'Exchanges, Brokers, and Demat Accounts', lesson_order: 3 }
        ];
      } else if (module.module_order === 3) {
        lessons = [
          { title: 'How to Pick Good Stocks', lesson_order: 1 },
          { title: 'Long-term vs Short-term Investing', lesson_order: 2 },
          { title: 'Mistakes to Avoid as a New Investor', lesson_order: 3 }
        ];
      } else if (module.module_order === 4) {
        lessons = [
          { title: 'Step-by-Step: Buying Your First Stock', lesson_order: 1 },
          { title: 'Tracking Your Portfolio', lesson_order: 2 },
          { title: 'Building Healthy Investing Habits', lesson_order: 3 }
        ];
      }
      
      for (const lesson of lessons) {
        // Insert each lesson with empty content
        const { error: lessonError } = await supabase
          .from('lessons')
          .insert({
            module_id: moduleId,
            title: lesson.title,
            content: '',
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

/**
 * Helper function to set up both courses with modules and lessons
 */
export const setupAllCourses = async () => {
  try {
    // Clear any existing lesson content first
    const clearResult = await clearAllLessonContent();
    if (!clearResult.success) throw clearResult.error;
    
    // Setup AI Tools course
    const aiToolsResult = await setupAIToolsCourse();
    if (!aiToolsResult.success) throw aiToolsResult.error;
    
    // Setup Stock Investment course
    const stockInvestmentResult = await setupStockInvestmentCourse();
    if (!stockInvestmentResult.success) throw stockInvestmentResult.error;
    
    return { 
      success: true, 
      aiToolsCourseId: aiToolsResult.courseId, 
      stockInvestmentCourseId: stockInvestmentResult.courseId
    };
  } catch (error) {
    console.error('Error setting up courses:', error);
    return { success: false, error };
  }
};
