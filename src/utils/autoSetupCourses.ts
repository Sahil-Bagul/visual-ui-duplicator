
import { supabase } from "@/integrations/supabase/client";

type LessonData = {
  title: string;
  content: string;
  lesson_order: number;
};

type ModuleData = {
  title: string;
  description: string;
  module_order: number;
  lessons: LessonData[];
};

type CourseData = {
  title: string;
  price: number;
  referral_reward: number;
  description: string;
  modules: ModuleData[];
};

// Check if a course with the given title already exists
const courseExists = async (title: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from("courses")
    .select("id")
    .eq("title", title)
    .single();
  
  if (error && error.code !== "PGRST116") {
    console.error("Error checking if course exists:", error);
    return false;
  }
  
  return !!data;
};

// Check if any courses exist in the database
const anyCourseExists = async (): Promise<boolean> => {
  const { count, error } = await supabase
    .from("courses")
    .select("*", { count: "exact", head: true });
  
  if (error) {
    console.error("Error checking if any courses exist:", error);
    return false;
  }
  
  return count !== null && count > 0;
};

// Create a course with modules and lessons
const createCourse = async (course: CourseData): Promise<string | null> => {
  try {
    console.log(`Starting to create course: ${course.title}`);
    
    // 1. Create the course
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .insert({
        title: course.title,
        price: course.price,
        referral_reward: course.referral_reward,
        description: course.description
      })
      .select()
      .single();
    
    if (courseError) {
      console.error("Error creating course:", courseError);
      return null;
    }
    
    const courseId = courseData.id;
    console.log(`Created course: ${course.title} with ID: ${courseId}`);
    
    // 2. Create modules for the course
    for (const module of course.modules) {
      console.log(`Creating module: ${module.title}`);
      
      const { data: moduleData, error: moduleError } = await supabase
        .from("course_modules")
        .insert({
          course_id: courseId,
          title: module.title,
          description: module.description,
          module_order: module.module_order,
          content: module.description // Using description as content as well
        })
        .select()
        .single();
      
      if (moduleError) {
        console.error(`Error creating module ${module.title}:`, moduleError);
        continue;
      }
      
      const moduleId = moduleData.id;
      console.log(`Created module: ${module.title} with ID: ${moduleId}`);
      
      // 3. Create lessons for the module
      for (const lesson of module.lessons) {
        console.log(`Creating lesson: ${lesson.title}`);
        
        const { error: lessonError } = await supabase
          .from("lessons")
          .insert({
            module_id: moduleId,
            title: lesson.title,
            content: lesson.content,
            lesson_order: lesson.lesson_order
          });
        
        if (lessonError) {
          console.error(`Error creating lesson ${lesson.title}:`, lessonError);
        } else {
          console.log(`Created lesson: ${lesson.title}`);
        }
      }
    }
    
    return courseId;
  } catch (err) {
    console.error("Error in createCourse:", err);
    return null;
  }
};

// Main function to initialize app data
export const initializeAppData = async (): Promise<void> => {
  console.info("Starting app data initialization");
  
  try {
    // Check if courses already exist
    const coursesExist = await anyCourseExists();
    
    if (coursesExist) {
      console.info("Courses already exist, skipping initialization");
      return;
    }
    
    console.info("No courses found, initializing app data...");
    
    // Create AI Tools course
    const aiToolsCourse: CourseData = {
      title: "AI Tools for Students",
      price: 500,
      referral_reward: 250,
      description: "Learn how to use AI tools to boost your productivity and creativity as a student.",
      modules: [
        {
          title: "Introduction to AI Tools",
          description: "Learn the basics of AI tools and why they are important for students.",
          module_order: 1,
          lessons: [
            {
              title: "What are AI Tools?",
              content: `# What are AI Tools?\n\n📱 **AI tools** are computer programs that use artificial intelligence to help you complete tasks faster and better.\n\n## How AI Tools Work\n\nAI tools work by:\n\n1. **Learning patterns** from huge amounts of data\n2. **Making predictions** or decisions based on what they've learned\n3. **Automating tasks** that would take humans much longer to do\n\n## Examples of AI Tools for Students\n\n- **ChatGPT**: Helps with writing, answering questions, and explaining concepts\n- **Notion AI**: Makes note-taking and organizing information easier\n- **Grammarly**: Checks your writing for mistakes and suggests improvements\n- **Canva AI**: Helps design presentations and graphics quickly\n\n## Why AI Tools Matter\n\nAI tools are like having a personal assistant that can help with your studies 24/7. They can:\n\n- Save you time on repetitive tasks\n- Help you understand difficult concepts\n- Improve the quality of your work\n- Let you focus on the more important parts of learning\n\n💡 **Important**: AI tools are helpers, not replacements for your own thinking! They work best when you use your own knowledge and creativity along with them.`,
              lesson_order: 1
            },
            {
              title: "Why AI is Important for Students",
              content: `# Why AI is Important for Students\n\n🎓 As a student in today's world, understanding and using AI tools gives you a significant advantage.\n\n## The Changing Educational Landscape\n\nThe way we learn is changing rapidly because of technology:\n\n- **Information overload**: There's more content to learn than ever before\n- **Skill requirements**: Jobs now demand both traditional and digital skills\n- **Competitive environment**: Standing out requires more than just good grades\n\n## Benefits of AI for Students\n\n### 1. Personalized Learning\n- AI can adapt to your learning pace and style\n- Get explanations tailored to your level of understanding\n- Practice exactly what you need to improve on\n\n### 2. Time Management\n- Automate routine tasks (summarizing, organizing notes)\n- Focus your time on deeper learning and creative thinking\n- Complete assignments more efficiently\n\n### 3. Access to Resources\n- Get instant answers to questions at any time\n- Access explanations even when teachers aren't available\n- Find learning materials suited to your specific needs\n\n### 4. Future-Proofing Your Career\n- Most future jobs will require AI literacy\n- Early exposure gives you a head start\n- Understanding AI helps you adapt to changing job markets\n\n## Real-Life Student Success Stories\n\n> \"I used ChatGPT to help brainstorm my project ideas and improved my grades from B to A\"\n> \n> \"AI tools helped me manage my time better during exams by organizing my study schedule\"\n> \n> \"I learned how to prompt AI effectively and now I can get much better results for my research papers\"\n\n⚠️ **Remember**: AI tools should support your learning, not replace it. Critical thinking remains essential!`,
              lesson_order: 2
            }
          ]
        },
        {
          title: "AI for Productivity",
          description: "Discover how AI can help you with research, note-taking, and writing.",
          module_order: 2,
          lessons: [
            {
              title: "Using ChatGPT for Research & Learning",
              content: `# Using ChatGPT for Research & Learning\n\n🔍 ChatGPT can transform how you research topics and learn new concepts.\n\n## What is ChatGPT?\n\nChatGPT is an AI assistant created by OpenAI that can:\n- Have conversations on almost any topic\n- Explain complex concepts in simple terms\n- Help you brainstorm and develop ideas\n- Create summaries and outlines\n\n## Effective Research Techniques with ChatGPT\n\n### 1. Ask Clear, Specific Questions\n**Less effective**: \"Tell me about photosynthesis\"\n**More effective**: \"Explain the light-dependent reactions of photosynthesis in simple terms\"\n\n### 2. Use the Socratic Method\nAsk a series of follow-up questions to dig deeper:\n1. Start with a broad question\n2. Ask for clarification on specific points\n3. Request examples or analogies\n4. Challenge the explanation to test understanding\n\n### 3. Request Different Perspectives\n- \"Can you explain this topic from another viewpoint?\"\n- \"What are some criticisms of this theory?\"\n- \"How would different experts approach this problem?\"\n\n## Study Strategies with ChatGPT\n\n### 1. Create Custom Study Guides\n\`\`\`\nCreate a study guide for [topic] covering:\n- Key concepts\n- Important formulas\n- Common misconceptions\n- Practice questions with solutions\n\`\`\`\n\n### 2. Test Your Understanding\n- Ask ChatGPT to quiz you on a topic\n- Request explanations for why your answers are right or wrong\n- Have it create practice problems at different difficulty levels\n\n### 3. Simplify Complex Material\n- Ask for explanations \"as if I'm 10 years old\"\n- Request metaphors or analogies to understand difficult concepts\n- Break down complicated processes step by step\n\n## Important Limitations\n\n⚠️ **Always verify information** from ChatGPT with reliable sources\n⚠️ ChatGPT may occasionally provide incorrect information\n⚠️ It has limited knowledge of events after its training cutoff date\n\n💡 **Pro Tip**: Keep a log of your best prompts for different types of academic tasks!`,
              lesson_order: 1
            },
            {
              title: "Using Notion AI for Note-taking & Planning",
              content: `# Using Notion AI for Note-taking & Planning\n\n📝 Notion AI combines the power of a versatile note-taking app with AI assistance to transform how you organize your studies.\n\n## What is Notion AI?\n\nNotion is a productivity tool that lets you create:\n- Notes and documents\n- Databases and tables\n- To-do lists and task trackers\n- Wikis and knowledge bases\n\nNotion AI adds artificial intelligence capabilities directly into this system.\n\n## Setting Up Your Notion Student System\n\n### 1. Create a Dashboard\nStart with a simple dashboard containing:\n- Current classes/subjects\n- Upcoming assignments\n- Weekly schedule\n- Goals tracker\n\n### 2. Build Subject Databases\nFor each subject, create a database with:\n- Lecture notes\n- Reading notes\n- Assignments\n- Resources\n- Practice problems`,
              lesson_order: 2
            }
          ]
        }
      ]
    };
    
    // Create Stock Market course
    const stockMarketCourse: CourseData = {
      title: "Stock Market Basics",
      price: 1000,
      referral_reward: 500,
      description: "Learn the fundamentals of stock investing with practical examples.",
      modules: [
        {
          title: "Introduction to Stock Markets",
          description: "Learn the basics of stock markets and why they are important.",
          module_order: 1,
          lessons: [
            {
              title: "What is the Stock Market?",
              content: `# What is the Stock Market?\n\n💹 The **stock market** is where buyers and sellers trade shares of publicly listed companies.\n\n## Key Stock Market Concepts\n\n### Shares/Stocks\nWhen you buy shares, you're buying partial ownership in a company. If you own 1% of a company's shares, you own 1% of that company.\n\n### Stock Exchanges\nThese are organized marketplaces where stocks are traded, such as:\n- National Stock Exchange (NSE) in India\n- Bombay Stock Exchange (BSE) in India\n- New York Stock Exchange (NYSE) in the US\n- NASDAQ in the US\n\n### Market Participants\n- **Investors**: Buy shares for long-term growth\n- **Traders**: Buy and sell frequently for short-term profits\n- **Brokers**: Execute trades on behalf of investors\n- **Regulators**: Ensure fair and orderly markets (like SEBI in India)\n\n## How the Stock Market Works\n\n1. **Companies issue shares** through an Initial Public Offering (IPO)\n2. **Investors buy these shares** through brokers\n3. **Share prices change** based on supply and demand\n4. **Companies may pay dividends** from profits to shareholders\n5. **Investors can sell shares** when they need money or want to take profits\n\n## Why the Stock Market Matters\n\n- **Wealth creation**: Historically offers higher returns than savings accounts\n- **Company funding**: Helps companies raise capital for growth\n- **Economic indicator**: Often reflects the health of an economy\n- **Investment vehicle**: Allows regular people to invest in businesses\n\n## Stock Market Myths\n\n❌ **Myth**: The stock market is just like gambling\n✅ **Reality**: Unlike gambling, informed stock investing is based on company performance and economic analysis\n\n❌ **Myth**: You need to be rich to invest\n✅ **Reality**: You can start with small amounts through SIPs (Systematic Investment Plans)\n\n❌ **Myth**: You need to time the market perfectly\n✅ **Reality**: Long-term, consistent investing often outperforms timing attempts`,
              lesson_order: 1
            },
            {
              title: "Key Stock Market Terms",
              content: `# Key Stock Market Terms\n\n📚 Understanding these terms will help you navigate the stock market confidently.\n\n## Basic Stock Market Vocabulary\n\n### Bull vs Bear Markets\n- **Bull Market**: When prices are rising or expected to rise (think of a bull charging upward)\n- **Bear Market**: When prices are falling or expected to fall (think of a bear swiping downward)\n\n### Types of Stocks\n- **Blue-chip Stocks**: Large, established companies with stable earnings (like Reliance, TCS, or HDFC in India)\n- **Growth Stocks**: Companies expected to grow faster than average\n- **Value Stocks**: Companies that appear to be undervalued compared to their fundamentals\n- **Dividend Stocks**: Companies that regularly distribute profits to shareholders\n\n### Trading Terminology\n\n#### Order Types\n- **Market Order**: Buy/sell at the current market price\n- **Limit Order**: Buy/sell only at a specified price or better\n- **Stop-Loss Order**: Automatically sells when a stock falls to a certain price\n\n#### Market Indicators\n- **Index**: A group of stocks representing a market segment (e.g., Nifty 50, Sensex)\n- **Market Capitalization**: Total value of a company's outstanding shares\n- **Volume**: Number of shares traded in a given period\n- **Volatility**: The degree of price fluctuation\n\n## Financial Metrics\n\n### Valuation Metrics\n- **P/E Ratio (Price-to-Earnings)**: Stock price divided by earnings per share\n- **EPS (Earnings Per Share)**: Company's profit divided by outstanding shares\n- **Book Value**: Company's assets minus liabilities\n- **Dividend Yield**: Annual dividends as a percentage of share price\n\n### Company Financial Terms\n- **Revenue**: Total money earned by a company\n- **Net Profit**: Money left after all expenses\n- **Debt-to-Equity Ratio**: Total debt divided by shareholder equity\n- **Return on Equity (ROE)**: Net income divided by shareholder equity\n\n## Market Movements\n\n### Corrections and Crashes\n- **Correction**: A 10%+ decline from recent highs\n- **Crash**: A sudden, severe drop in stock prices (20%+ decline)\n- **Recovery**: Period when the market rises after a decline\n\n### Economic Influences\n- **Interest Rates**: Higher rates typically decrease stock prices\n- **Inflation**: Rising prices that can affect company profits\n- **GDP Growth**: General economic growth that often boosts stocks\n- **Fiscal/Monetary Policy**: Government and central bank actions that impact markets`,
              lesson_order: 2
            }
          ]
        },
        {
          title: "Basic Investment Strategies",
          description: "Learn basic strategies for investing in the stock market.",
          module_order: 2,
          lessons: [
            {
              title: "Long-term vs Short-term Investing",
              content: `# Long-term vs Short-term Investing\n\n⏱️ The time horizon you choose for investing can significantly impact your strategy, risk, and returns.\n\n## Long-term Investing\n\n### Characteristics\n- **Time Horizon**: 5+ years\n- **Focus**: Company fundamentals and growth potential\n- **Strategy**: Buy and hold\n- **Analysis**: Fundamental analysis\n- **Emotion Factor**: Lower day-to-day stress\n\n### Advantages\n- Less affected by short-term market volatility\n- Potential to benefit from compound returns\n- Lower transaction costs (fewer trades)\n- More time for market recoveries\n- Often more tax-efficient\n\n### Disadvantages\n- Capital is locked in for longer periods\n- Requires patience\n- May miss short-term profit opportunities\n\n## Short-term Trading\n\n### Characteristics\n- **Time Horizon**: Days, weeks, or months\n- **Focus**: Price movements and market sentiment\n- **Strategy**: Active buying and selling\n- **Analysis**: Technical analysis and market timing\n- **Emotion Factor**: Higher stress, requires discipline\n\n### Advantages\n- Potential for quick profits\n- More flexible with capital\n- Can capitalize on short-term market inefficiencies\n- May perform well in volatile markets\n\n### Disadvantages\n- Higher transaction costs\n- Requires more time and attention\n- Higher risk of losses\n- Often less tax-efficient\n- Challenging to consistently time the market\n\n## Which Approach Is Better?\n\n### Consider Long-term If You:\n- Are investing for retirement or distant goals\n- Don't have time to actively monitor markets\n- Want to minimize stress and emotional decisions\n- Prefer stable, compounding growth\n\n### Consider Short-term If You:\n- Have extra capital separate from long-term savings\n- Can dedicate time to market analysis\n- Have high risk tolerance and emotional discipline\n- Enjoy the active involvement\n\n## The Hybrid Approach\n\nMany successful investors use a core-satellite approach:\n- **Core Portfolio (80-90%)**: Long-term investments\n- **Satellite Portfolio (10-20%)**: Short-term opportunities\n\n## Important Factors for Both Approaches\n\n### For Long-term Success\n- Regular investing (such as SIP)\n- Diversification across sectors\n- Periodic portfolio review (quarterly/annually)\n- Patience during market downturns\n\n### For Short-term Success\n- Clear entry and exit plans\n- Strict risk management rules\n- Never risk more than you can afford to lose\n- Continuous learning and adaptation\n\n💡 **Pro Tip**: Your personal investment timeline should align with your financial goals. Money needed in 1-3 years shouldn't be in high-risk investments, regardless of your preferred strategy.`,
              lesson_order: 1
            }
          ]
        }
      ]
    };
    
    await Promise.all([
      createCourse(aiToolsCourse),
      createCourse(stockMarketCourse)
    ]);
    
    console.info("App data initialization complete");
  } catch (error) {
    console.error("Error initializing app data:", error);
  }
};
