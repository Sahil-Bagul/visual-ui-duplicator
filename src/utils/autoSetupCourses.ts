
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if courses are already set up
 */
const areCoursesSetUp = async (): Promise<boolean> => {
  const { data, error } = await supabase
    .from('courses')
    .select('id')
    .limit(1);
    
  if (error) {
    console.error('Error checking if courses exist:', error);
    return false;
  }
  
  return data && data.length > 0;
};

/**
 * Auto-generate content for "AI Tools for Students" course
 */
const setupAIToolsCourse = async () => {
  try {
    // Create course
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .insert({
        title: 'AI Tools for Students',
        description: 'A beginner-friendly course to help students learn about the most useful AI tools for productivity, learning, and creativity.',
        price: 500,
        referral_reward: 250
      })
      .select();

    if (courseError) throw courseError;
    if (!courseData || courseData.length === 0) throw new Error("Failed to create course");

    const courseId = courseData[0].id;

    // Module 1
    const { data: module1Data, error: module1Error } = await supabase
      .from('course_modules')
      .insert({
        course_id: courseId,
        title: 'Introduction to AI Tools',
        description: 'Learn the basics of AI tools and how they can help students',
        module_order: 1,
        content: 'This module introduces you to the concept of AI tools and their benefits for students.'
      })
      .select();

    if (module1Error) throw module1Error;
    
    await supabase
      .from('lessons')
      .insert([
        {
          module_id: module1Data[0].id,
          title: 'What are AI Tools?',
          lesson_order: 1,
          content: 'AI tools are software or platforms powered by artificial intelligence that help with tasks like writing, designing, organizing, and more. For students, these tools are time-savers and idea generators.'
        },
        {
          module_id: module1Data[0].id,
          title: 'Benefits of AI Tools for Students',
          lesson_order: 2,
          content: 'From summarizing notes to creating presentations, AI tools help students boost productivity, enhance creativity, and make learning more personalized.'
        },
        {
          module_id: module1Data[0].id,
          title: 'How to Use This Course',
          lesson_order: 3,
          content: 'Each lesson introduces an AI tool with examples. Try each one yourself using the links and ideas we share. No coding or tech experience needed.'
        }
      ]);

    // Module 2
    const { data: module2Data, error: module2Error } = await supabase
      .from('course_modules')
      .insert({
        course_id: courseId,
        title: 'Text-Based AI Tools',
        description: 'Explore AI tools that help with writing and text generation',
        module_order: 2,
        content: 'This module covers text-based AI tools that can help you with writing, studying, and communication.'
      })
      .select();

    if (module2Error) throw module2Error;
    
    await supabase
      .from('lessons')
      .insert([
        {
          module_id: module2Data[0].id,
          title: 'ChatGPT Basics',
          lesson_order: 1,
          content: 'ChatGPT is an AI chatbot that helps explain concepts, write essays, generate ideas, and much more. You interact with it using prompts.'
        },
        {
          module_id: module2Data[0].id,
          title: 'Prompts for Studying',
          lesson_order: 2,
          content: 'Prompts are questions or instructions you give AI. Example: "Summarize the French Revolution in 100 words." We\'ll share effective prompts for academics.'
        },
        {
          module_id: module2Data[0].id,
          title: 'Grammarly',
          lesson_order: 3,
          content: 'Grammarly is an AI writing assistant that corrects grammar, improves clarity, and enhances your writing style in real time.'
        }
      ]);

    // Module 3
    const { data: module3Data, error: module3Error } = await supabase
      .from('course_modules')
      .insert({
        course_id: courseId,
        title: 'Visual & Presentation Tools',
        description: 'Learn about AI tools for visual content and presentations',
        module_order: 3,
        content: 'This module explores AI-powered tools for creating visual content, presentations, and graphics.'
      })
      .select();

    if (module3Error) throw module3Error;
    
    await supabase
      .from('lessons')
      .insert([
        {
          module_id: module3Data[0].id,
          title: 'Canva AI Features',
          lesson_order: 1,
          content: 'Canva\'s AI tools help generate designs, social posts, and academic graphics with ease. Learn how to auto-generate layouts and content.'
        },
        {
          module_id: module3Data[0].id,
          title: 'SlidesAI',
          lesson_order: 2,
          content: 'SlidesAI turns plain text into full PowerPoint/Google slides automatically. Great for projects and class presentations.'
        },
        {
          module_id: module3Data[0].id,
          title: 'Remove.bg',
          lesson_order: 3,
          content: 'A free tool that removes backgrounds from images instantly. Useful for making clean posters, IDs, or design assets.'
        }
      ]);

    // Module 4
    const { data: module4Data, error: module4Error } = await supabase
      .from('course_modules')
      .insert({
        course_id: courseId,
        title: 'Productivity & Planning Tools',
        description: 'Discover AI tools for better productivity and planning',
        module_order: 4,
        content: 'This module covers AI tools that help with productivity, note-taking, and organizing your academic life.'
      })
      .select();

    if (module4Error) throw module4Error;
    
    await supabase
      .from('lessons')
      .insert([
        {
          module_id: module4Data[0].id,
          title: 'Notion AI',
          lesson_order: 1,
          content: 'Notion AI assists with note-taking, to-do lists, and organizing study material. Learn how to build your own smart workspace.'
        },
        {
          module_id: module4Data[0].id,
          title: 'AI Note-Takers',
          lesson_order: 2,
          content: 'Tools like Otter.ai convert voice to notes in real time. Helpful for lectures, interviews, or research documentation.'
        },
        {
          module_id: module4Data[0].id,
          title: 'Final Tips & Resources',
          lesson_order: 3,
          content: 'Explore free AI tools online, join communities, and stay updated. Apply these tools in projects and day-to-day student life.'
        }
      ]);

    return { success: true, courseId };
  } catch (error) {
    console.error('Error setting up AI Tools course:', error);
    return { success: false, error };
  }
};

/**
 * Auto-generate content for "Introduction to Stock Investment" course
 */
const setupStockInvestmentCourse = async () => {
  try {
    // Create course
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .insert({
        title: 'Introduction to Stock Investment',
        description: 'Learn the fundamentals of stock investing with this beginner-friendly course designed for Indian students.',
        price: 1000,
        referral_reward: 500
      })
      .select();

    if (courseError) throw courseError;
    if (!courseData || courseData.length === 0) throw new Error("Failed to create course");

    const courseId = courseData[0].id;

    // Module 1
    const { data: module1Data, error: module1Error } = await supabase
      .from('course_modules')
      .insert({
        course_id: courseId,
        title: 'Stock Market Basics',
        description: 'Understand the fundamentals of stock markets',
        module_order: 1,
        content: 'This module introduces you to the stock market and why people invest in stocks.'
      })
      .select();

    if (module1Error) throw module1Error;
    
    await supabase
      .from('lessons')
      .insert([
        {
          module_id: module1Data[0].id,
          title: 'What is the Stock Market?',
          lesson_order: 1,
          content: 'A marketplace where investors buy and sell shares of companies. These shares represent partial ownership in businesses.'
        },
        {
          module_id: module1Data[0].id,
          title: 'Why Do Companies Go Public?',
          lesson_order: 2,
          content: 'To raise capital. When a company offers shares to the public via an IPO, it receives money to expand and grow.'
        },
        {
          module_id: module1Data[0].id,
          title: 'Why Do People Invest?',
          lesson_order: 3,
          content: 'Investing helps grow wealth over time, beat inflation, and build financial security. It can also generate passive income through dividends.'
        }
      ]);

    // Module 2
    const { data: module2Data, error: module2Error } = await supabase
      .from('course_modules')
      .insert({
        course_id: courseId,
        title: 'Understanding Stocks',
        description: 'Learn about different types of stocks and stock exchanges',
        module_order: 2,
        content: 'This module covers the different types of stocks and stock exchanges in India.'
      })
      .select();

    if (module2Error) throw module2Error;
    
    await supabase
      .from('lessons')
      .insert([
        {
          module_id: module2Data[0].id,
          title: 'Types of Stocks',
          lesson_order: 1,
          content: 'Includes common stocks (voting rights) and preferred stocks (fixed dividends). Also categorized by size: large-cap, mid-cap, small-cap.'
        },
        {
          module_id: module2Data[0].id,
          title: 'Stock Exchanges in India',
          lesson_order: 2,
          content: 'NSE (National Stock Exchange) and BSE (Bombay Stock Exchange) are where Indian stocks are listed and traded.'
        },
        {
          module_id: module2Data[0].id,
          title: 'How to Read a Stock Quote',
          lesson_order: 3,
          content: 'Learn key terms like current price, P/E ratio, 52-week high/low, market cap, and volume to assess a stock.'
        }
      ]);

    // Module 3
    const { data: module3Data, error: module3Error } = await supabase
      .from('course_modules')
      .insert({
        course_id: courseId,
        title: 'How to Start Investing',
        description: 'Step-by-step guide to start investing in stocks',
        module_order: 3,
        content: 'This module provides practical guidance on how to start investing in the stock market.'
      })
      .select();

    if (module3Error) throw module3Error;
    
    await supabase
      .from('lessons')
      .insert([
        {
          module_id: module3Data[0].id,
          title: 'Opening a Demat Account',
          lesson_order: 1,
          content: 'A Demat account stores your shares in digital format. It\'s essential to begin investing and is provided by brokers.'
        },
        {
          module_id: module3Data[0].id,
          title: 'Choosing a Broker',
          lesson_order: 2,
          content: 'Brokers like Zerodha, Upstox, and Groww offer platforms to trade. Compare their fees, UI, and support before choosing.'
        },
        {
          module_id: module3Data[0].id,
          title: 'Placing Your First Order',
          lesson_order: 3,
          content: 'Learn how to search a stock, select quantity, choose market/limit order, and execute your first buy or sell.'
        }
      ]);

    // Module 4
    const { data: module4Data, error: module4Error } = await supabase
      .from('course_modules')
      .insert({
        course_id: courseId,
        title: 'Risk, Strategy & Mindset',
        description: 'Learn about investment risks, strategies and developing the right mindset',
        module_order: 4,
        content: 'This module covers the risks associated with stock investing and strategies for successful investing.'
      })
      .select();

    if (module4Error) throw module4Error;
    
    await supabase
      .from('lessons')
      .insert([
        {
          module_id: module4Data[0].id,
          title: 'Risks in Stock Market',
          lesson_order: 1,
          content: 'Market risks include volatility, company performance, and economic events. Always invest money you can afford to hold long-term.'
        },
        {
          module_id: module4Data[0].id,
          title: 'Long-Term vs. Short-Term Investing',
          lesson_order: 2,
          content: 'Long-term investing builds wealth gradually with less stress. Short-term trading can be profitable but riskier.'
        },
        {
          module_id: module4Data[0].id,
          title: 'Common Mistakes to Avoid',
          lesson_order: 3,
          content: 'Don\'t follow tips blindly. Avoid panic selling, overtrading, and investing without research or a goal.'
        }
      ]);

    return { success: true, courseId };
  } catch (error) {
    console.error('Error setting up Stock Investment course:', error);
    return { success: false, error };
  }
};

/**
 * Auto create some purchase records for demonstration purposes
 */
const createDemoPurchases = async (userId: string) => {
  try {
    // Get all courses
    const { data: courses } = await supabase
      .from('courses')
      .select('id');
    
    if (!courses || courses.length === 0) return;
    
    // Create demo purchase records for all courses for the current user
    const purchases = courses.map(course => ({
      user_id: userId,
      course_id: course.id,
      has_used_referral_code: false
    }));
    
    await supabase
      .from('purchases')
      .upsert(purchases, { onConflict: 'user_id,course_id' });
      
  } catch (error) {
    console.error('Error creating demo purchases:', error);
  }
};

/**
 * Initialize application data
 */
export const initializeAppData = async (userId: string | undefined): Promise<void> => {
  try {
    // Check if courses exist
    const coursesExist = await areCoursesSetUp();
    
    // If courses don't exist, create them
    if (!coursesExist) {
      console.log('Setting up initial courses...');
      await setupAIToolsCourse();
      await setupStockInvestmentCourse();
    }
    
    // Create demo purchases for logged in user if available
    if (userId) {
      await createDemoPurchases(userId);
    }
  } catch (error) {
    console.error('Error initializing app data:', error);
  }
};
