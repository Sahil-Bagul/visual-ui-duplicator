
import { supabase } from "@/integrations/supabase/client";

// Course modules for AI Tools course
const getAIToolsCourseModules = () => {
  return [
    {
      title: "Introduction to AI Tools",
      description: "Learn about the most useful AI tools for students",
      content: "Modern students have access to powerful AI tools that can help with studying, research, and productivity. This course introduces you to the most useful AI tools that can make your academic life easier.\n\nIn this module, we'll explore what AI tools are, how they can benefit students, and the ethical considerations of using AI for academic purposes.",
      module_order: 1,
      lessons: [
        {
          title: "What are AI Tools?",
          content: "AI tools are software applications that use artificial intelligence to automate tasks or provide intelligent assistance. These tools can help with writing, researching, studying, and many other academic tasks.\n\nMany AI tools are powered by large language models (LLMs) like GPT-4, which can understand and generate human-like text based on the prompts you provide.",
          lesson_order: 1
        },
        {
          title: "Benefits for Students",
          content: "AI tools can help students in numerous ways:\n\n1. Generating essay outlines and ideas\n2. Summarizing complex readings and research papers\n3. Creating study guides and flashcards\n4. Providing explanations for difficult concepts\n5. Assisting with coding and math problems\n6. Helping with time management and organization\n\nThese tools can save you time and enhance your learning experience when used appropriately.",
          lesson_order: 2
        }
      ]
    },
    {
      title: "AI Writing Assistants",
      description: "How to use AI writing tools effectively",
      content: "AI writing assistants can help you brainstorm ideas, overcome writer's block, and improve your writing. In this module, we'll explore popular AI writing tools and how to use them effectively for academic writing.\n\nWe'll also discuss the importance of using these tools as assistants rather than replacements for your own writing and thinking.",
      module_order: 2,
      lessons: [
        {
          title: "Popular AI Writing Tools",
          content: "Some of the most useful AI writing tools for students include:\n\n1. ChatGPT - Versatile AI assistant for brainstorming, outlining, and feedback\n2. Grammarly - Grammar checker with AI-powered suggestions\n3. QuillBot - Paraphrasing tool that can help rephrase text\n4. Wordtune - Writing enhancer that offers alternative ways to express ideas\n\nEach tool has different strengths and can help with different aspects of the writing process.",
          lesson_order: 1
        },
        {
          title: "Effective Prompting Techniques",
          content: "To get the best results from AI writing tools, you need to provide clear, specific prompts. Here are some techniques:\n\n1. Be specific about what you need\n2. Provide context about your assignment\n3. Specify your audience and purpose\n4. Ask for specific formats or structures\n5. Request multiple options or variations\n\nExample prompt: 'I need to write a 500-word argumentative essay about climate change for a first-year university course. Can you help me create an outline with 3 main arguments and suggest credible sources I could use?'",
          lesson_order: 2
        }
      ]
    },
    {
      title: "Research and Study Aids",
      description: "AI tools to enhance your research and study sessions",
      content: "AI can transform how you research topics and study for exams. This module covers AI-powered research tools and study aids that can make your learning more efficient and effective.\n\nYou'll learn how to use AI to find relevant information quickly, summarize research materials, and create personalized study materials.",
      module_order: 3,
      lessons: [
        {
          title: "AI for Academic Research",
          content: "AI tools can help streamline your research process:\n\n1. Elicit - A research assistant that helps you find information and ask follow-up questions\n2. Consensus - Searches and summarizes scientific papers\n3. Scholarcy - Extracts key information from research papers\n4. Perplexity AI - Provides research-backed answers with citations\n\nThese tools can help you quickly find relevant information and understand complex research papers.",
          lesson_order: 1
        },
        {
          title: "Study Enhancement with AI",
          content: "AI tools can enhance your study sessions in several ways:\n\n1. Anki with AI - Generate flashcards automatically from your notes\n2. Quizlet's Q-Chat - Create custom study materials and get explanations\n3. Notion AI - Summarize notes and generate study guides\n4. ExamCram - Create practice questions based on your materials\n\nThese tools can help you create personalized study materials and test your knowledge effectively.",
          lesson_order: 2
        }
      ]
    },
    {
      title: "Ethical Use of AI in Education",
      description: "Guidelines for using AI tools responsibly",
      content: "As you incorporate AI tools into your academic work, it's essential to use them ethically and responsibly. This module covers guidelines for the appropriate use of AI tools in educational settings.\n\nWe'll discuss academic integrity, proper attribution, and how to ensure AI enhances rather than replaces your learning.",
      module_order: 4,
      lessons: [
        {
          title: "Academic Integrity with AI",
          content: "Using AI tools while maintaining academic integrity:\n\n1. Always disclose your use of AI tools when required\n2. Use AI as a collaborator, not a substitute for your own work\n3. Verify and fact-check AI-generated information\n4. Understand your institution's policies on AI use\n\nAI should enhance your learning, not bypass it. Most universities are developing policies on AI use, so stay informed about what's allowed.",
          lesson_order: 1
        },
        {
          title: "Best Practices for AI Integration",
          content: "Tips for integrating AI tools into your academic workflow:\n\n1. Use AI for brainstorming and ideation\n2. Have AI explain concepts you don't understand\n3. Use AI to check your work and provide feedback\n4. Create study materials with AI assistance\n5. Be transparent about how you're using AI\n\nThe goal is to use AI to become a better student, not to avoid learning. Focus on using AI tools that help you understand and engage with the material more deeply.",
          lesson_order: 2
        }
      ]
    }
  ];
};

// Course modules for Stock Market course
const getStockMarketCourseModules = () => {
  return [
    {
      title: "Stock Market Basics",
      description: "Foundation concepts for stock market investing",
      content: "Before diving into stock investing, it's crucial to understand the fundamental concepts. This module covers the basics of the stock market, how it works, and why companies offer stocks.\n\nWe'll explore key terminology, the major stock exchanges in India, and the different types of market participants.",
      module_order: 1,
      lessons: [
        {
          title: "What is the Stock Market?",
          content: "The stock market is a collection of exchanges where publicly listed companies' shares are bought and sold. In India, the major stock exchanges are the Bombay Stock Exchange (BSE) and the National Stock Exchange (NSE).\n\nWhen you buy a company's stock, you're purchasing a small ownership stake in that business. As the company grows and becomes more valuable, the value of your stock typically increases, allowing you to sell it for a profit.",
          lesson_order: 1
        },
        {
          title: "Key Market Participants",
          content: "Several key players make the stock market function:\n\n1. Investors - Individuals and institutions who buy stocks to hold for long-term growth\n2. Traders - People who frequently buy and sell stocks for short-term profits\n3. Brokers - Intermediaries who execute buy and sell orders\n4. Regulators - Organizations like SEBI that oversee market activities\n5. Listed Companies - Businesses that offer shares to the public\n\nUnderstanding the roles of these participants helps you navigate the market more effectively.",
          lesson_order: 2
        }
      ]
    },
    {
      title: "Getting Started with Investing",
      description: "Practical steps to begin your investment journey",
      content: "This module covers the practical aspects of starting your investment journey. You'll learn how to set up a trading account, choose a broker, and make your first stock purchase.\n\nWe'll also discuss the importance of setting clear investment goals and creating a basic investment strategy.",
      module_order: 2,
      lessons: [
        {
          title: "Setting Up Your Trading Account",
          content: "To start investing in stocks in India, you'll need:\n\n1. A Demat Account - For holding shares in electronic form\n2. A Trading Account - For executing buy and sell orders\n3. A Bank Account - Linked to your trading account for fund transfers\n\nMost brokers offer all three as a 3-in-1 account package. Popular brokers in India include Zerodha, Upstox, Angel Broking, and ICICI Direct. When choosing a broker, consider factors like brokerage fees, user interface, customer service, and research tools.",
          lesson_order: 1
        },
        {
          title: "Making Your First Investment",
          content: "Before making your first stock purchase:\n\n1. Complete your KYC (Know Your Customer) verification\n2. Transfer funds to your trading account\n3. Research stocks you're interested in\n4. Decide how many shares to buy\n5. Place your order through your broker's platform\n\nStart with a small investment in companies you understand well. Consider beginning with blue-chip companies (well-established, financially sound companies) as they tend to be more stable for beginner investors.",
          lesson_order: 2
        }
      ]
    },
    {
      title: "Stock Analysis Fundamentals",
      description: "Learn how to evaluate stocks before investing",
      content: "One of the most important skills for successful investing is the ability to analyze stocks. This module introduces fundamental and technical analysis approaches to evaluating potential investments.\n\nYou'll learn key financial metrics and indicators that can help you make more informed investment decisions.",
      module_order: 3,
      lessons: [
        {
          title: "Fundamental Analysis Basics",
          content: "Fundamental analysis involves evaluating a company's financial health and business prospects. Key metrics to consider include:\n\n1. Price-to-Earnings (P/E) Ratio - Compares a company's share price to its earnings per share\n2. Debt-to-Equity Ratio - Shows how much debt a company uses to finance operations\n3. Return on Equity (ROE) - Measures profitability relative to shareholders' equity\n4. Earnings Per Share (EPS) - The portion of profit allocated to each share\n\nYou can find these metrics in a company's annual reports, financial websites, or through your broker's research tools.",
          lesson_order: 1
        },
        {
          title: "Introduction to Technical Analysis",
          content: "While fundamental analysis looks at a company's value, technical analysis focuses on price movements and trading patterns. Basic technical concepts include:\n\n1. Support and Resistance Levels - Price points where stocks tend to stop falling or rising\n2. Moving Averages - Show the average price over a specific time period\n3. Trading Volume - The number of shares traded, indicating interest in a stock\n4. Chart Patterns - Recognizable formations that may suggest future price movements\n\nMost trading platforms provide tools for technical analysis. However, as a beginner, focus on understanding the business fundamentals first before diving deep into technical analysis.",
          lesson_order: 2
        }
      ]
    },
    {
      title: "Building a Long-Term Portfolio",
      description: "Strategies for creating a sustainable investment portfolio",
      content: "Building a well-diversified, long-term portfolio is key to successful investing. This module covers portfolio construction principles, diversification strategies, and long-term investing approaches.\n\nYou'll learn how to create a portfolio aligned with your financial goals and risk tolerance.",
      module_order: 4,
      lessons: [
        {
          title: "Diversification Strategies",
          content: "Diversification helps reduce risk by spreading your investments across different assets. Consider diversifying across:\n\n1. Different Industries - Tech, healthcare, finance, consumer goods, etc.\n2. Company Sizes - Large-cap, mid-cap, and small-cap stocks\n3. Investment Types - Stocks, bonds, mutual funds, ETFs\n4. Geographies - Domestic and international markets\n\nA well-diversified portfolio might include 10-15 stocks across various sectors, supplemented with mutual funds or ETFs for broader market exposure.",
          lesson_order: 1
        },
        {
          title: "Long-Term Investment Strategies",
          content: "Successful long-term investing requires patience and discipline. Key strategies include:\n\n1. Rupee Cost Averaging - Investing fixed amounts at regular intervals\n2. Dividend Reinvestment - Using dividends to buy more shares\n3. Buy and Hold - Purchasing quality stocks and holding them for years\n4. Systematic Investment Plans (SIPs) - Regular investments in mutual funds\n\nFocus on quality companies with strong fundamentals, good management, and sustainable competitive advantages. Remember that wealth building through the stock market is typically a long-term journey, not a get-rich-quick scheme.",
          lesson_order: 2
        }
      ]
    }
  ];
};

// Function to find a course by title
const findCourseByTitle = async (title: string) => {
  console.log(`Looking for course with title: "${title}"`);
  
  const { data: courses, error } = await supabase
    .from('courses')
    .select('*')
    .eq('title', title);
    
  if (error) {
    console.error("Error finding course by title:", error);
    return null;
  }
  
  if (!courses || courses.length === 0) {
    console.log(`Course with title "${title}" not found`);
    return null;
  }
  
  console.log(`Course found:`, courses[0]);
  return courses[0];
};

// Check if a course already has modules
const courseHasModules = async (courseId: string) => {
  console.log(`Checking if course with ID ${courseId} has modules`);
  
  const { data: modules, error } = await supabase
    .from('course_modules')
    .select('id')
    .eq('course_id', courseId)
    .limit(1);
    
  if (error) {
    console.error("Error checking course modules:", error);
    return false;
  }
  
  const hasModules = modules && modules.length > 0;
  console.log(`Course ${courseId} has modules: ${hasModules}`);
  return hasModules;
};

// Create modules and lessons for a course
const createCourseContent = async (courseId: string, modules: any[]) => {
  console.log(`Creating content for course ${courseId} with ${modules.length} modules`);
  
  for (const moduleData of modules) {
    // Create the module
    const { data: moduleRecord, error: moduleError } = await supabase
      .from('course_modules')
      .insert({
        course_id: courseId,
        title: moduleData.title,
        description: moduleData.description,
        content: moduleData.content,
        module_order: moduleData.module_order
      })
      .select();
      
    if (moduleError || !moduleRecord) {
      console.error("Error creating module:", moduleError);
      continue; // Skip to next module if there was an error
    }
    
    const moduleId = moduleRecord[0].id;
    console.log(`Created module with ID ${moduleId}`);
    
    // Create lessons for this module
    if (moduleData.lessons && moduleData.lessons.length > 0) {
      for (const lessonData of moduleData.lessons) {
        const { error: lessonError } = await supabase
          .from('lessons')
          .insert({
            module_id: moduleId,
            title: lessonData.title,
            content: lessonData.content,
            lesson_order: lessonData.lesson_order
          });
          
        if (lessonError) {
          console.error("Error creating lesson:", lessonError);
        } else {
          console.log(`Created lesson: ${lessonData.title}`);
        }
      }
    }
  }
  
  console.log(`Finished creating content for course ${courseId}`);
};

// Setup course content if needed
export const initializeAppData = async () => {
  try {
    console.log("Starting app data initialization...");
    
    // First, check if each course exists and create content if needed
    
    // 1. AI Tools Course
    const aiToolsCourseTitles = ["AI Tools Mastery", "AI Tools for Students"];
    let aiToolsCourse = null;
    
    // Try both potential titles
    for (const title of aiToolsCourseTitles) {
      const course = await findCourseByTitle(title);
      if (course) {
        aiToolsCourse = course;
        console.log(`Found AI Tools course with title: ${title}`);
        break;
      }
    }
    
    if (aiToolsCourse) {
      const hasModules = await courseHasModules(aiToolsCourse.id);
      if (!hasModules) {
        console.log("AI Tools course exists but has no modules. Creating content...");
        await createCourseContent(aiToolsCourse.id, getAIToolsCourseModules());
      } else {
        console.log("AI Tools course already has modules. Skipping content creation.");
      }
    } else {
      console.log("AI Tools course not found in database.");
    }
    
    // 2. Stock Market Course
    const stockMarketCourseTitles = ["Stock Market Fundamentals", "Stock Market Basics"];
    let stockMarketCourse = null;
    
    // Try both potential titles
    for (const title of stockMarketCourseTitles) {
      const course = await findCourseByTitle(title);
      if (course) {
        stockMarketCourse = course;
        console.log(`Found Stock Market course with title: ${title}`);
        break;
      }
    }
    
    if (stockMarketCourse) {
      const hasModules = await courseHasModules(stockMarketCourse.id);
      if (!hasModules) {
        console.log("Stock Market course exists but has no modules. Creating content...");
        await createCourseContent(stockMarketCourse.id, getStockMarketCourseModules());
      } else {
        console.log("Stock Market course already has modules. Skipping content creation.");
      }
    } else {
      console.log("Stock Market course not found in database.");
    }
    
    // Log a summary
    console.log("App data initialization complete.");
    
  } catch (error) {
    console.error("Error during app data initialization:", error);
  }
};
