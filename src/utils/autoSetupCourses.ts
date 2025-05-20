
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
  console.log("Starting app data initialization");
  try {
    // Check if courses already exist
    const coursesExist = await anyCourseExists();
    
    if (coursesExist) {
      console.log("Courses already exist, skipping initialization");
      return;
    }
    
    console.log("No courses found, initializing app data...");
    
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
              content: `# What are AI Tools?

📱 **AI tools** are computer programs that use artificial intelligence to help you complete tasks faster and better.

## How AI Tools Work

AI tools work by:

1. **Learning patterns** from huge amounts of data
2. **Making predictions** or decisions based on what they've learned
3. **Automating tasks** that would take humans much longer to do

## Examples of AI Tools for Students

- **ChatGPT**: Helps with writing, answering questions, and explaining concepts
- **Notion AI**: Makes note-taking and organizing information easier
- **Grammarly**: Checks your writing for mistakes and suggests improvements
- **Canva AI**: Helps design presentations and graphics quickly

## Why AI Tools Matter

AI tools are like having a personal assistant that can help with your studies 24/7. They can:

- Save you time on repetitive tasks
- Help you understand difficult concepts
- Improve the quality of your work
- Let you focus on the more important parts of learning

💡 **Important**: AI tools are helpers, not replacements for your own thinking! They work best when you use your own knowledge and creativity along with them.`,
              lesson_order: 1
            },
            {
              title: "Why AI is Important for Students",
              content: `# Why AI is Important for Students

🎓 As a student in today's world, understanding and using AI tools gives you a significant advantage.

## The Changing Educational Landscape

The way we learn is changing rapidly because of technology:

- **Information overload**: There's more content to learn than ever before
- **Skill requirements**: Jobs now demand both traditional and digital skills
- **Competitive environment**: Standing out requires more than just good grades

## Benefits of AI for Students

### 1. Personalized Learning
- AI can adapt to your learning pace and style
- Get explanations tailored to your level of understanding
- Practice exactly what you need to improve on

### 2. Time Management
- Automate routine tasks (summarizing, organizing notes)
- Focus your time on deeper learning and creative thinking
- Complete assignments more efficiently

### 3. Access to Resources
- Get instant answers to questions at any time
- Access explanations even when teachers aren't available
- Find learning materials suited to your specific needs

### 4. Future-Proofing Your Career
- Most future jobs will require AI literacy
- Early exposure gives you a head start
- Understanding AI helps you adapt to changing job markets

## Real-Life Student Success Stories

> "I used ChatGPT to help brainstorm my project ideas and improved my grades from B to A"
> 
> "AI tools helped me manage my time better during exams by organizing my study schedule"
> 
> "I learned how to prompt AI effectively and now I can get much better results for my research papers"

⚠️ **Remember**: AI tools should support your learning, not replace it. Critical thinking remains essential!`,
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
              content: `# Using ChatGPT for Research & Learning

🔍 ChatGPT can transform how you research topics and learn new concepts.

## What is ChatGPT?

ChatGPT is an AI assistant created by OpenAI that can:
- Have conversations on almost any topic
- Explain complex concepts in simple terms
- Help you brainstorm and develop ideas
- Create summaries and outlines

## Effective Research Techniques with ChatGPT

### 1. Ask Clear, Specific Questions
**Less effective**: "Tell me about photosynthesis"
**More effective**: "Explain the light-dependent reactions of photosynthesis in simple terms"

### 2. Use the Socratic Method
Ask a series of follow-up questions to dig deeper:
1. Start with a broad question
2. Ask for clarification on specific points
3. Request examples or analogies
4. Challenge the explanation to test understanding

### 3. Request Different Perspectives
- "Can you explain this topic from another viewpoint?"
- "What are some criticisms of this theory?"
- "How would different experts approach this problem?"

## Study Strategies with ChatGPT

### 1. Create Custom Study Guides
\`\`\`
Create a study guide for [topic] covering:
- Key concepts
- Important formulas
- Common misconceptions
- Practice questions with solutions
\`\`\`

### 2. Test Your Understanding
- Ask ChatGPT to quiz you on a topic
- Request explanations for why your answers are right or wrong
- Have it create practice problems at different difficulty levels

### 3. Simplify Complex Material
- Ask for explanations "as if I'm 10 years old"
- Request metaphors or analogies to understand difficult concepts
- Break down complicated processes step by step

## Important Limitations

⚠️ **Always verify information** from ChatGPT with reliable sources
⚠️ ChatGPT may occasionally provide incorrect information
⚠️ It has limited knowledge of events after its training cutoff date

💡 **Pro Tip**: Keep a log of your best prompts for different types of academic tasks!`,
              lesson_order: 1
            },
            {
              title: "Using Notion AI for Note-taking & Planning",
              content: `# Using Notion AI for Note-taking & Planning

📝 Notion AI combines the power of a versatile note-taking app with AI assistance to transform how you organize your studies.

## What is Notion AI?

Notion is a productivity tool that lets you create:
- Notes and documents
- Databases and tables
- To-do lists and task trackers
- Wikis and knowledge bases

Notion AI adds artificial intelligence capabilities directly into this system.

## Setting Up Your Notion Student System

### 1. Create a Dashboard
Start with a simple dashboard containing:
- Current classes/subjects
- Upcoming assignments
- Weekly schedule
- Goals tracker

### 2. Build Subject Databases
For each subject, create a database with:
- Lecture notes
- Reading notes
- Assignments
- Resources
- Practice problems

## Using Notion AI for Better Notes

### 1. Summarizing Content
After taking detailed notes in class:
- Highlight the section
- Use "/AI Summarize" command
- Review and edit the summary
- Create bullet-point key takeaways

### 2. Expanding on Ideas
When you have a basic concept but need more detail:
- Write down the core idea
- Use "/AI Help me finish writing this"
- Specify the tone and depth you want

### 3. Creating Study Materials
- Transform lecture notes into flashcards
- Generate practice questions
- Create concept maps by asking AI to identify connections

## Planning and Task Management

### 1. Smart To-Do Lists
Use Notion AI to:
- Break down large assignments into manageable steps
- Suggest realistic timeframes for tasks
- Prioritize your work based on deadlines and importance

### 2. Time Blocking Templates
- Create time block templates for different types of days
- Ask AI to suggest optimal study schedules
- Generate daily routines that balance work and breaks

### 3. Progress Tracking
- Build habit trackers for consistent study
- Create reflection templates for weekly review
- Use AI to analyze your productivity patterns

## Tips for Notion AI Success

💡 **Consistency is key**: Update your system regularly
💡 **Start simple**: Begin with basic templates and expand
💡 **Personalize**: Adapt examples to your specific needs
💡 **Regularly review**: Refine your system as you learn what works

⚠️ **Remember**: The best system is one you'll actually use!`,
              lesson_order: 2
            },
            {
              title: "Grammarly & Quillbot for Writing Help",
              content: `# Grammarly & Quillbot for Writing Help

✏️ These AI writing assistants can significantly improve your academic writing quality and efficiency.

## Grammarly: Your Writing Coach

### What Grammarly Does
Grammarly is an AI-powered writing assistant that helps with:
- Grammar and spelling corrections
- Punctuation and sentence structure
- Tone adjustments
- Clarity and conciseness
- Plagiarism detection (Premium)

### How to Use Grammarly Effectively

#### 1. Set Up Your Goals
Before checking a document, configure:
- Audience (professors, peers, general)
- Formality level
- Domain (academic, general)
- Intent (inform, describe, convince)

#### 2. Beyond Basic Corrections
Look for:
- **Clarity suggestions**: Making your writing more understandable
- **Engagement tips**: Avoiding repetitive or dull language
- **Delivery adjustments**: Ensuring appropriate tone
- **Full-sentence rewrites**: Alternative ways to express ideas

#### 3. Grammarly for Different Assignment Types
- **Essays**: Focus on clarity, coherence, and academic tone
- **Research papers**: Check for formal language and precise vocabulary
- **Emails to professors**: Ensure professional but friendly tone
- **Creative writing**: Balance correctness with stylistic choices

## Quillbot: Paraphrasing and Rewriting

### What Quillbot Does
Quillbot specializes in:
- Paraphrasing text while preserving meaning
- Offering multiple rewriting styles
- Summarizing long content
- Simplifying complex text
- Expanding brief notes into full sentences

### Using Quillbot Wisely

#### 1. Paraphrasing Modes
Choose the right mode for your needs:
- **Standard**: Balanced changes while preserving meaning
- **Fluency**: Focuses on natural-sounding language
- **Formal**: Academic and professional language
- **Simple**: Makes complex content easier to understand
- **Creative**: More extensive rewrites (use cautiously)

#### 2. Smart Research Techniques
- Paste complex explanations to get simplified versions
- Rewrite to ensure you truly understand the content
- Compare original text with paraphrased version to check meaning preservation

#### 3. Avoiding Plagiarism
- Use Quillbot to understand concepts in your own words
- Always cite sources when paraphrasing ideas from others
- Don't rely solely on AI—add your own analysis and thoughts

## Best Practices for Both Tools

### Do:
✅ Review all AI suggestions before accepting
✅ Learn from corrections to improve your writing
✅ Use them as learning tools, not just quick fixes
✅ Maintain your unique voice and ideas

### Don't:
❌ Accept all suggestions without thinking
❌ Use them to write entire assignments for you
❌ Forget to proofread the final result yourself

💡 **Pro Tip**: Use Grammarly first for corrections, then Quillbot for paraphrasing if needed, then Grammarly again to check the final result.`,
              lesson_order: 3
            }
          ]
        },
        {
          title: "AI for Creativity",
          description: "Learn how to use AI tools for design, images, video, and music creation.",
          module_order: 3,
          lessons: [
            {
              title: "Using Canva AI for Design",
              content: `# Using Canva AI for Design

🎨 Canva AI transforms how students create visual content—making professional-quality design accessible to everyone.

## What is Canva AI?

Canva is a graphic design platform that now includes powerful AI features:
- Text-to-image generation
- Magic Design (instant layouts)
- Magic Write (text generation)
- Magic Edit (image manipulation)
- Background remover
- Style applicator

## Getting Started with Canva AI

### 1. Setting Up Your Account
- Sign up for a free account (student email may give you premium features)
- Explore the dashboard and templates
- Enable the "Magic" features in your account settings

### 2. Understanding the Canvas
- Templates vs. blank designs
- Element library
- Text and font options
- Upload section for your own images

## Essential Canva AI Features for Students

### 1. Magic Design
Perfect for creating quick, professional presentations:
1. Enter your topic
2. Select the type of design (presentation, poster, social media)
3. Choose a style that matches your project
4. Customize colors and imagery to your preference

### 2. Magic Write
Helps generate text content for your designs:
- Product descriptions
- Headlines and titles
- Brief explanations
- Bulleted lists

### 3. Text to Image
Create custom images for your projects:
- Describe what you want ("A 3D render of quantum computing principles")
- Specify style ("in a minimalist style with blue and purple colors")
- Generate multiple options
- Fine-tune with additional prompts

## Project Examples with Canva AI

### Academic Presentations
1. Choose a presentation template
2. Use Magic Write to generate outline points
3. Use Text to Image for conceptual illustrations
4. Apply consistent styling with Brand Kit

### Study Materials
1. Create flashcard templates
2. Generate concept diagrams with Text to Image
3. Use Magic Design for visual summaries
4. Export as PDFs for printing or sharing

### Project Posters
1. Start with a poster template
2. Generate a striking main image with Text to Image
3. Use Magic Write for concise descriptions
4. Export in high resolution for printing

## Tips for Better Canva AI Results

### For Text Generation:
- Be specific about tone and purpose
- Edit generated text to add your personal insights
- Use as starting points, not final content

### For Image Creation:
- Use detailed descriptions including style, colors, and mood
- Try variations of the same prompt
- Combine AI-generated elements with stock photos for unique results

### For Presentations:
- Maintain consistent visual language
- Focus on one key point per slide
- Use AI to create visual metaphors for complex concepts

💡 **Pro Tip**: Save your best AI-generated designs as templates for future projects!`,
              lesson_order: 1
            },
            {
              title: "Using Leonardo AI for Images",
              content: `# Using Leonardo AI for Images

🖼️ Leonardo AI is a powerful tool that lets students create professional-quality images from text descriptions—no artistic skills required.

## What is Leonardo AI?

Leonardo AI is a text-to-image generation platform that:
- Creates detailed images from written descriptions
- Offers various artistic styles and models
- Allows image modifications and variations
- Provides resolution upscaling
- Enables inpainting for targeted edits

## Getting Started with Leonardo AI

### 1. Creating an Account
- Sign up for a free account (gives limited generations)
- Explore the gallery for inspiration
- Understand token limitations (free vs. paid)

### 2. Navigate the Interface
- Generation tab for creating new images
- Community tab for inspiration
- Workshop for editing images
- Canvas for more complex compositions

## Creating Effective Prompts

### 1. Basic Prompt Structure
A good prompt includes:
- **Subject**: What you want to see
- **Medium**: Painting, photo, 3D render, etc.
- **Style**: Artistic influence or genre
- **Mood**: Lighting and emotional tone
- **Details**: Colors, composition, specific elements

### 2. Example Prompts for Academic Use

#### For Biology:
"A detailed 3D render of a human cell, showing organelles in bright colors, educational style, cutaway view revealing internal structures, scientific accuracy, white background, suitable for textbook illustration"

#### For History:
"A digital painting of Ancient Roman marketplace, bustling with people in togas, detailed architecture, warm sunset lighting, historically accurate details, cinematic composition"

#### For Physics:
"A conceptual illustration of quantum entanglement, particles connected with glowing blue energy, dark background with subtle stars, science fiction style, digital art"

## Projects for Students

### 1. Visual Study Notes
- Generate images that represent complex concepts
- Create memorable visual analogies
- Combine with text for better retention

### 2. Project Illustrations
- Generate unique images for research papers
- Create custom diagrams for presentations
- Visualize abstract concepts for better understanding

### 3. Custom Visuals for Presentations
- Consistent style across all slides
- Attention-grabbing title images
- Visual metaphors that enhance your points

## Advanced Techniques

### 1. Image-to-Image Generation
- Start with a simple sketch
- Have Leonardo AI transform it into a detailed image
- Maintain specific layout while enhancing quality

### 2. Working with Negative Prompts
- Specify what you DON'T want in the image
- Example: "No text, no watermarks, no blurry elements"
- Helps avoid common AI generation issues

### 3. Fine-tuning Results
- Use the variation feature to explore similar options
- Try different models for different art styles
- Experiment with prompt weights to emphasize elements

## Best Practices

✅ Always cite AI as a tool if using images in academic work
✅ Check institutional policies on AI-generated content
✅ Combine AI-generated images with your own analysis
✅ Use for concepts that are difficult to photograph or draw manually

💡 **Pro Tip**: Keep a document of your most successful prompts for future reference!`,
              lesson_order: 2
            }
          ]
        },
        {
          title: "AI Ethics & Best Practices",
          description: "Understand the ethical considerations and best practices for using AI tools as a student.",
          module_order: 4,
          lessons: [
            {
              title: "Academic Integrity with AI",
              content: `# Academic Integrity with AI

🧠 Using AI tools in academics requires understanding ethical boundaries and maintaining your educational integrity.

## Understanding Academic Integrity

Academic integrity means:
- Honesty in your academic work
- Proper credit for others' ideas
- Completing your own learning journey
- Following institutional policies

## AI and Academic Policies

### Current Landscape
- Some institutions prohibit AI use entirely
- Others allow it with disclosure
- Many are developing policies as technology evolves
- Most distinguish between using AI as a tool versus submitting AI work as your own

### Common Policy Categories
1. **Prohibited**: No AI use allowed
2. **Restricted**: AI allowed only for specific purposes
3. **Disclosure Required**: AI use must be documented
4. **Integrated**: AI explicitly incorporated into learning

## Ethical Guidelines for Students

### Do:
✅ **Check your institution's policies** before using AI
✅ **Disclose AI assistance** when submitting work
✅ **Use AI as a learning tool**, not a replacement for learning
✅ **Verify AI-generated information** with reliable sources
✅ **Contribute your own critical thinking** to AI-assisted work

### Don't:
❌ **Submit AI-generated work as entirely your own**
❌ **Use AI to complete tests or exams** unless explicitly allowed
❌ **Rely on AI for factual information** without verification
❌ **Share AI tools for cheating purposes**
❌ **Use AI to bypass learning essential skills**

## Properly Citing AI Assistance

### Example Citation Formats

#### MLA Style:
"This paper was written with research assistance from [AI Tool Name], an artificial intelligence tool. All AI-generated content has been reviewed, verified, and edited by the author."

#### APA Style:
"The author acknowledges the use of [AI Tool Name] (Version X) [URL] for [specific purpose: drafting, research assistance, editing, etc.]. All AI-generated content has been critically evaluated and revised by the human author."

### Where to Include Citations
- Acknowledgments section
- Methodology section
- Footnotes for specific AI-assisted passages
- As directed by your instructor

## Case Studies: Ethical vs. Unethical Use

### Scenario 1: Writing Assistance
**Ethical**: Using ChatGPT to brainstorm essay topics, outline structure, and get feedback on drafts you've written.
**Unethical**: Having ChatGPT write your entire essay and submitting it without substantial revision or disclosure.

### Scenario 2: Problem-Solving
**Ethical**: Using AI to check your work after you've attempted problems, or to explain concepts you don't understand.
**Unethical**: Feeding exam questions to AI and copying answers without understanding.

### Scenario 3: Research
**Ethical**: Using AI to summarize articles you've read, suggest additional sources, or help understand complex papers.
**Unethical**: Relying solely on AI summaries without reading original sources, or using AI to fabricate citations.

## Balancing AI Use with Learning Goals

Remember the purpose of education:
- To develop your critical thinking abilities
- To build skills you'll need in your career
- To learn how to evaluate and synthesize information
- To become an independent thinker and problem-solver

AI is most valuable when it enhances these goals rather than replacing the mental work that leads to real learning.

💡 **Pro Tip**: When using AI, ask yourself: "Am I using this tool to enhance my learning, or to avoid learning?"`,
              lesson_order: 1
            },
            {
              title: "AI Prompt Engineering Basics",
              content: `# AI Prompt Engineering Basics

🔧 Effective prompt engineering is the key to getting the best results from AI tools. This skill will dramatically improve your AI interactions.

## What is Prompt Engineering?

Prompt engineering is the skill of crafting inputs to AI systems to get the most useful, accurate, and relevant outputs. It's like learning how to ask questions in a way that helps the AI understand exactly what you need.

## The Anatomy of an Effective Prompt

### 1. Clear Instructions
Begin with a clear directive that specifies exactly what you want the AI to do:
- "Explain..."
- "Analyze..."
- "Compare and contrast..."
- "Create a step-by-step guide for..."

### 2. Context and Background
Provide relevant information the AI might need:
- Your current knowledge level on the topic
- The purpose of your request
- Any specific requirements or constraints
- Previous information from your conversation

### 3. Format Specification
Tell the AI how you want the information structured:
- "Present this as a bulleted list"
- "Format your response as a table with three columns"
- "Write this in the style of a dialogue between experts"
- "Include section headings for each main point"

### 4. Examples (When Helpful)
Provide examples of what a good response looks like:
- "For example, when I ask about historical events, include dates, key figures, and long-term impacts"

## Prompt Types for Different Tasks

### 1. Learning Prompts
For understanding concepts:
"Explain [concept] at a level appropriate for a first-year undergraduate. Include analogies, examples, and address common misconceptions."

### 2. Writing Assistance Prompts
For help with papers:
"Help me outline an essay on [topic]. The thesis is [your thesis]. The audience is [target audience]. Include potential main arguments and what evidence would support each."

### 3. Problem-Solving Prompts
For working through problems:
"Walk me through how to solve this [subject] problem step-by-step: [problem]. Explain your reasoning at each stage and highlight potential pitfalls."

### 4. Critical Analysis Prompts
For developing analytical skills:
"Analyze [text/concept/argument] from multiple perspectives. Identify strengths, weaknesses, and underlying assumptions. Suggest questions for further investigation."

## Advanced Techniques

### 1. Chain-of-Thought Prompting
Ask the AI to show its reasoning process:
"Think through this problem step by step before providing the final answer."

### 2. Role Assignment
Give the AI a specific role to frame its response:
"Act as an expert in [field] explaining [topic] to a beginner."

### 3. Constraint Setting
Set boundaries for more focused responses:
"Explain this using only terminology that would be familiar to high school students."

### 4. Iterative Refinement
Start broad, then gradually refine:
1. First prompt: "Give me an overview of photosynthesis."
2. Follow-up: "Now focus specifically on the light-dependent reactions."
3. Further refinement: "Explain how ATP is generated during these reactions."

## Common Prompt Issues and Solutions

### Problem: Vague or Ambiguous Prompts
❌ "Tell me about stars."
✅ "Explain the life cycle of massive stars (>8 solar masses), focusing on their final stages and how they differ from lower-mass stars."

### Problem: Overwhelming the AI
❌ "Explain quantum physics, relativity, and string theory and how they relate to each other in detail."
✅ "Give a high-level overview of how quantum physics and general relativity conflict with each other, focusing on 2-3 key incompatibilities."

### Problem: Under-specified Output Format
❌ "Help me study for my biology exam."
✅ "Create 10 potential short-answer questions about cellular respiration that might appear on an undergraduate biology exam. Provide concise answers for each."

## Prompt Templates for Students

### Research Question Development
"I'm interested in researching [broad topic]. Help me narrow this down to 3-5 specific research questions that would be appropriate for a [paper length] [assignment type]. For each question, suggest what type of sources might provide useful information."

### Concept Comparison
"Compare and contrast [concept A] and [concept B] in terms of: 1) key principles, 2) historical development, 3) practical applications, and 4) current limitations. Present this as a split-column comparison where appropriate."

### Study Guide Creation
"Create a comprehensive study guide for [topic]. Include: key terminology with definitions, main theories/principles, important examples, and potential exam questions. Organize this with clear headings and subheadings."

💡 **Pro Tip**: Keep a document of your most effective prompts for different academic tasks. Refine them as you learn what works best!`,
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
      description: "Learn the fundamentals of stock market investing with practical advice for beginners.",
      modules: [
        {
          title: "Introduction to Stock Markets",
          description: "Understand what stock markets are and how they function.",
          module_order: 1,
          lessons: [
            {
              title: "What are Stocks and Stock Markets?",
              content: `# What are Stocks and Stock Markets?

💹 Understanding the basic concepts of stocks and stock markets is your first step toward successful investing.

## What is a Stock?

A **stock** (also called a **share**) represents partial ownership in a company. When you buy a stock, you're buying a small piece of that company.

### Key Characteristics of Stocks:
- **Ownership**: Each share represents a tiny fraction of ownership
- **Limited Liability**: Your risk is limited to your investment amount
- **Voting Rights**: Often gives you voting rights in company decisions
- **Dividends**: May pay a portion of profits to shareholders
- **Transferable**: Can be bought and sold on stock exchanges

## What is a Stock Market?

A **stock market** (or **stock exchange**) is a regulated marketplace where stocks are bought and sold.

### Functions of Stock Markets:
1. **Capital Raising**: Helps companies raise money for growth
2. **Investment Opportunities**: Gives individuals a way to invest
3. **Price Discovery**: Determines fair market prices through trading
4. **Liquidity**: Makes it easy to buy or sell investments quickly

## Major Stock Markets Around the World

### United States
- **NYSE (New York Stock Exchange)**: Oldest and largest US exchange
- **NASDAQ**: Known for technology companies

### India
- **BSE (Bombay Stock Exchange)**: Asia's oldest stock exchange
- **NSE (National Stock Exchange)**: India's leading stock exchange

### Other Important Exchanges
- London Stock Exchange (UK)
- Tokyo Stock Exchange (Japan)
- Shanghai Stock Exchange (China)

## How Stock Markets Work

### The Basics
1. **Companies List Their Stocks**: Through an IPO (Initial Public Offering)
2. **Brokers Facilitate Trading**: Act as intermediaries
3. **Exchanges Match Buyers and Sellers**: Using order matching systems
4. **Prices Fluctuate**: Based on supply and demand

### Trading Hours
Most exchanges operate during specific hours on weekdays:
- US Markets: 9:30am - 4:00pm Eastern Time
- Indian Markets: 9:15am - 3:30pm Indian Standard Time

## Key Players in Stock Markets

### Primary Participants
- **Companies**: Issue stocks to raise capital
- **Investors**: Buy stocks hoping for returns
- **Brokers/Dealers**: Facilitate trades
- **Regulators**: Ensure fair practices (SEC in US, SEBI in India)
- **Market Makers**: Provide liquidity

## Why Stock Markets Matter

### For the Economy
- Enable business growth and expansion
- Create jobs through business funding
- Indicate economic health

### For Individuals
- Build long-term wealth
- Generate passive income through dividends
- Provide opportunities to participate in economic growth

## Common Stock Market Terms

- **Bull Market**: Market is rising, optimistic
- **Bear Market**: Market is falling, pessimistic
- **Blue-Chip Stocks**: Large, established, financially sound companies
- **Index**: Measures performance of a group of stocks (e.g., S&P 500, Sensex)
- **Market Capitalization**: Total value of a company's shares

💡 **Key Insight**: Stock markets are not just for the wealthy. Today's online platforms make investing accessible to almost everyone, often with minimal starting capital.`,
              lesson_order: 1
            },
            {
              title: "Why Invest in Stocks?",
              content: `# Why Invest in Stocks?

🎯 Understanding the benefits and risks of stock investing will help you make informed decisions about including stocks in your investment strategy.

## The Power of Stock Market Returns

### Historical Performance
- **Long-term average returns**: ~10% annually (before inflation)
- **Outperforms most asset classes**: Better than bonds, savings accounts, and often real estate
- **Compounds over time**: Small investments can grow substantially

### Visual Example: Growth of ₹10,000 Over Time

| Time Period | Fixed Deposit (5%) | Stock Market (10%) |
|-------------|-------------------|-------------------|
| 5 years     | ₹12,763          | ₹16,105          |
| 10 years    | ₹16,289          | ₹25,937          |
| 20 years    | ₹26,533          | ₹67,275          |
| 30 years    | ₹43,219          | ₹174,494         |

## Key Benefits of Stock Investing

### 1. Wealth Building
- **Capital appreciation**: Stock prices increase over time
- **Dividend income**: Regular payments from profitable companies
- **Ownership in real businesses**: Participate in company growth

### 2. Inflation Protection
- Historically, stocks have outpaced inflation
- Preserves purchasing power of your money
- Fixed income investments often lose value to inflation

### 3. Liquidity
- Buy or sell quickly during market hours
- No lock-in periods (unlike real estate or some fixed deposits)
- Easy to convert to cash when needed

### 4. Accessibility
- Start with small amounts (even ₹500 in some cases)
- Invest through mobile apps from anywhere
- Wide range of options for different goals

### 5. Flexibility
- Choose your investment style (growth, value, dividend)
- Adjust your strategy as needs change
- Mix with other investments for diversification

## Understanding Stock Market Risks

### 1. Market Volatility
- Prices fluctuate daily, sometimes dramatically
- Short-term losses are common and normal
- Requires emotional discipline

### 2. Company-Specific Risk
- Individual companies can fail
- Management problems, competition, disruption
- Can be reduced through diversification

### 3. Timing Risk
- Difficult to predict short-term market movements
- Poor timing can reduce returns significantly
- Solution: long-term investment approach

### 4. Psychological Challenges
- Fear and greed drive irrational decisions
- Media headlines can provoke emotional reactions
- Solution: stick to a plan, avoid impulsive moves

## Who Should Invest in Stocks?

### Good candidates for stock investing:
- Have a long-term outlook (5+ years)
- Can tolerate some short-term volatility
- Have emergency funds already established
- Are seeking growth rather than immediate income
- Are willing to learn basic investment principles

### Not ideal for:
- Money needed within 1-3 years
- Emergency funds
- Those who cannot tolerate any risk to principal
- Those who will panic sell during market declines

## How Stocks Fit in Your Financial Plan

### The Investment Pyramid
1. **Base**: Emergency fund, insurance
2. **Middle**: Core investments (including stocks)
3. **Top**: Speculative investments (if any)

### Typical Allocation by Age
- **20-30s**: 80-90% stocks (long time horizon)
- **40-50s**: 60-70% stocks (balancing growth and stability)
- **60+**: 40-50% stocks (more focus on capital preservation)

## Alternatives to Direct Stock Investment

- **Mutual Funds**: Professionally managed portfolios
- **ETFs**: Exchange-traded funds tracking indices
- **Index Funds**: Low-cost funds tracking market indices
- **SIPs**: Systematic Investment Plans for disciplined investing

💡 **Key Insight**: The greatest advantage of stock investing is time. The earlier you start—even with small amounts—the more you benefit from compounding returns.`,
              lesson_order: 2
            }
          ]
        },
        {
          title: "Getting Started with Stock Investing",
          description: "Learn the practical steps to begin your investment journey.",
          module_order: 2,
          lessons: [
            {
              title: "Setting Up Your Trading Account",
              content: `# Setting Up Your Trading Account

🏦 Getting properly set up with the right brokerage account is the crucial first step in your investing journey.

## Types of Brokerage Accounts in India

### Full-Service Brokers
- **Features**: Research, advice, personalized service
- **Cost**: Higher brokerage fees (typically percentage-based)
- **Examples**: ICICI Direct, HDFC Securities, Kotak Securities
- **Best for**: Beginners wanting guidance, high-value investors

### Discount Brokers
- **Features**: Basic trading platform, minimal support
- **Cost**: Very low flat fees per trade
- **Examples**: Zerodha, Upstox, Groww, Angel One
- **Best for**: Cost-conscious traders, self-directed investors

## Required Documents for Account Opening

### Essential Documents (KYC Requirements)
1. **PAN Card** (mandatory)
2. **Aadhaar Card**
3. **Bank Account Details**
4. **Mobile Number** (linked to Aadhaar)
5. **Email ID**
6. **Passport-sized Photographs**
7. **Income Proof** (sometimes required)

### Account Types to Open
1. **Trading Account**: For buying/selling securities
2. **Demat Account**: For holding securities electronically
3. **Linked Bank Account**: For fund transfers

## Step-by-Step Account Opening Process

### 1. Choose a Broker
- Research fees, platforms, customer service
- Read user reviews and compare features
- Consider ease of use if you're a beginner

### 2. Complete the Online Application
- Visit broker's website or download their app
- Fill in personal details
- Upload digital copies of required documents

### 3. Complete the KYC Process
- Digital verification through Aadhaar
- In-person verification (occasionally required)
- Video KYC (becoming more common)

### 4. Sign Agreements
- Read the terms and conditions
- Understand the fee structure
- Digital signature or physical signing

### 5. Fund Your Account
- Transfer initial amount via UPI/NEFT/IMPS
- Link your bank account for future transfers
- Set up auto-pay if using SIPs

### 6. Install Trading Platforms
- Mobile app for on-the-go trading
- Desktop platform for detailed analysis
- Familiarize yourself with the interface

## Important Account Features to Consider

### Trading Tools
- Charting capabilities
- Real-time price updates
- Research reports access

### Fees to Understand
- **Account opening fees** (many brokers now offer free opening)
- **Annual maintenance charges** for demat account
- **Brokerage fees** per transaction
- **Taxes** (STT, GST, Stamp duty, etc.)
- **Convenience fees** for using certain payment methods

### Security Features
- Two-factor authentication
- Biometric login
- Withdrawal safeguards

## Setting Up Your Account Properly

### Risk Profile Configuration
- Many brokers require this during setup
- Be honest about your risk tolerance
- This may affect trading permissions

### Trading Limits
- Understand intraday vs. delivery limits
- Margin trading requirements (if applicable)
- F&O segment eligibility (for advanced trading)

### Nominee Registration
- Register a nominee for your account
- Update personal details accurately
- Keep beneficiary information current

## Common Mistakes to Avoid

### ❌ Choosing solely based on lowest fees
Look beyond cost to platform quality and service

### ❌ Not reading the fee structure carefully
Hidden charges can add up significantly

### ❌ Creating multiple accounts unnecessarily
This complicates tax reporting and portfolio tracking

### ❌ Providing incorrect personal information
Causes problems during verification and tax filing

### ❌ Rushing through the setup process
Take time to understand all features and limitations

## Getting Help

### Learning Resources
- Most brokers offer tutorials and demos
- YouTube videos on platform navigation
- Community forums for specific brokers

### Customer Support
- Save broker's support number in your contacts
- Know email support options
- Check if chat support is available

💡 **Pro Tip**: After opening your account, start by using the "paper trading" or demo features many brokers offer before investing real money. This will help you get comfortable with the platform without any risk.`,
              lesson_order: 1
            },
            {
              title: "Understanding Stock Market Indices",
              content: `# Understanding Stock Market Indices

📊 Stock market indices are essential tools that help investors track market performance and make more informed investment decisions.

## What is a Stock Market Index?

A stock market index is a measure of the value of a section of the stock market. It is computed from the prices of selected stocks, typically using a weighted average.

### Purpose of Indices
- **Market Performance Indicator**: Reflects overall market direction
- **Benchmark**: Comparison standard for investment performance
- **Investment Vehicle**: Basis for index funds and ETFs
- **Economic Indicator**: Reflects economic health and investor sentiment

## Major Indian Stock Market Indices

### Sensex (S&P BSE SENSEX)
- **Exchange**: Bombay Stock Exchange (BSE)
- **Components**: 30 largest, most liquid BSE-listed companies
- **Base Year**: 1978-79 = 100 points
- **Calculation**: Free-float market capitalization weighted
- **Significance**: Oldest index, widely followed benchmark

### Nifty 50 (NSE NIFTY 50)
- **Exchange**: National Stock Exchange (NSE)
- **Components**: 50 largest NSE-listed companies
- **Base Year**: November 3, 1995 = 1000 points
- **Calculation**: Free-float market capitalization weighted
- **Significance**: Most widely used index for derivatives

### Other Important Indian Indices
- **Nifty Next 50**: The next 50 companies after Nifty 50
- **BSE 500 & Nifty 500**: Broader market indices
- **Sectoral Indices**: Bank Nifty, Nifty IT, Nifty Auto, etc.
- **Nifty Midcap 150**: Mid-sized companies
- **Nifty Smallcap 250**: Smaller companies

## Major Global Indices

### United States
- **S&P 500**: 500 largest US companies
- **Dow Jones Industrial Average**: 30 significant stocks
- **NASDAQ Composite**: Technology-heavy index

### Other Countries
- **FTSE 100** (UK)
- **Nikkei 225** (Japan)
- **Shanghai Composite** (China)
- **DAX** (Germany)

## How Indices are Calculated

### Common Weighting Methods
1. **Market Capitalization Weighted**
   - Larger companies have more impact
   - Most common method (Sensex, Nifty, S&P 500)

2. **Price Weighted**
   - Higher-priced stocks have more impact
   - Example: Dow Jones Industrial Average

3. **Equal Weighted**
   - All stocks have same impact regardless of size
   - Example: Nifty50 Equal Weight Index

4. **Free-Float Market Cap Weighted**
   - Based on shares actually available for trading
   - Used by most modern indices including Nifty and Sensex

### Index Reconstitution
- Periodic review and updating of index components
- Companies added/removed based on defined criteria
- Maintains relevance and representation of the market

## How to Invest in Indices

### 1. Index Funds
- Mutual funds that track specific indices
- Low expense ratio compared to active funds
- Examples: UTI Nifty Index Fund, HDFC Sensex Index Fund

### 2. Exchange Traded Funds (ETFs)
- Trade on exchanges like individual stocks
- Often lower expense ratio than index funds
- Examples: Nippon India ETF Nifty BeES, SBI ETF Sensex

### 3. Index Futures and Options
- Derivative contracts based on indices
- Used for hedging or speculation
- Higher risk, requires more knowledge

## Reading and Interpreting Index Movements

### Daily Movement Terms
- **Points Change**: Absolute change in index value
- **Percentage Change**: Relative change (more meaningful)
- **Volume**: Number of shares traded
- **Breadth**: Advancing vs declining stocks

### Common Patterns
- **Bull Market**: Sustained uptrend (20%+ increase)
- **Bear Market**: Sustained downtrend (20%+ decrease)
- **Correction**: 10-20% drop from recent peak
- **Rally**: Strong short-term upward movement

### Technical Levels
- **Support**: Price level where buying pressure overcomes selling
- **Resistance**: Price level where selling pressure overcomes buying
- **Moving Averages**: 50-day, 200-day averages show trends

## Using Indices in Your Investment Strategy

### For Passive Investors
- Invest in broad market indices for diversification
- Regular SIPs into index funds for long-term wealth building
- Low-cost, tax-efficient approach

### For Active Investors
- Use as benchmarks to evaluate performance
- Track sector indices to identify rotation trends
- Monitor index internals for market health

### For Market Timing (Advanced)
- Index put/call ratios as sentiment indicators
- VIX (volatility index) for gauging market fear
- Index relative strength compared to global markets

## Popular Index Investing Strategies

### 1. Core-Satellite
- Core: Large allocation to broad index funds
- Satellite: Smaller allocations to active funds or individual stocks

### 2. Asset Allocation with Indices
- Different indices for different asset classes
- Regular rebalancing to maintain allocation

### 3. Tactical Allocation
- Overweight/underweight sectors based on economic cycles
- Use sector indices to implement views

💡 **Key Insight**: For most beginning investors, a simple strategy of regular investments into a broad market index fund (like Nifty 50 or Sensex) is often the most reliable path to long-term wealth creation.`,
              lesson_order: 2
            },
            {
              title: "Making Your First Stock Purchase",
              content: `# Making Your First Stock Purchase

🛒 This step-by-step guide will walk you through the process of researching, selecting, and purchasing your first stock.

## Before You Buy: Essential Preparation

### 1. Financial Readiness Checklist
✅ Emergency fund (3-6 months of expenses)
✅ No high-interest debt (credit cards, personal loans)
✅ Clear investment goals and time horizon
✅ Understanding of basic stock concepts
✅ Money you can afford to invest (not needed soon)

### 2. Research Resources to Bookmark
- **Company websites**: Investor relations pages
- **Stock screeners**: Screener.in, Tickertape, MoneyControl
- **Financial news**: Economic Times, LiveMint, Bloomberg Quint
- **Broker research**: Reports from your brokerage
- **Annual reports**: From company websites or BSE/NSE

### 3. Set Up Your Watchlist
- Create a list of 8-12 companies that interest you
- Track them for a few weeks before investing
- Note price movements and news impacts
- Get familiar with their business models

## Choosing Your First Stock

### 1. Consider Starting With
- **Blue-chip companies**: Established, stable businesses
- **Companies you understand**: Products/services you use
- **Dividend-paying stocks**: For some predictable returns
- **Index heavyweights**: Major components of Nifty/Sensex

### 2. Basic Analysis Factors
- **Revenue growth**: Consistent increases over years
- **Profit margins**: Stable or improving
- **Debt levels**: Manageable compared to equity
- **Competitive advantage**: What makes the company special
- **Valuation**: Price relative to earnings (P/E ratio)

### 3. Red Flags for Beginners to Avoid
- Extremely volatile price history
- No consistent profit history
- Recent major scandals or controversies
- Extremely high P/E ratio compared to peers
- Industries you don't understand

## Step-by-Step Purchase Process

### 1. Log Into Your Trading Platform
- Use your credentials to access your broker's website/app
- Ensure you have sufficient funds in your trading account
- Check trading hours (9:15 AM - 3:30 PM, Mon-Fri)

### 2. Find Your Selected Stock
- Enter the company name or stock symbol in search
- Verify you have the right stock (BSE vs NSE listing)
- Review the current market price and day's range

### 3. Order Placement Basics
- **Order Types**:
  - **Market Order**: Buy at current market price
  - **Limit Order**: Buy only at specified price or better
- **Timeline**:
  - **Intraday**: Must be sold same day (not recommended for beginners)
  - **Delivery/CNC**: For longer-term holding (recommended)

### 4. Placing Your First Order: Step by Step
1. Select the stock symbol
2. Choose "Buy" option
3. Select "Delivery/CNC" (for investment)
4. Enter quantity of shares to purchase
5. For beginners: Choose "Market" order
6. Review order details carefully
7. Submit the order
8. Check for confirmation notification

### 5. After Your Purchase
- Order confirmation will appear on screen
- Check "Portfolio" section to confirm holdings
- Contract note will be sent via email
- Shares will appear in your demat account (T+1 days)

## Common First-Time Buyer Questions

### "How many shares should I buy?"
Start small—perhaps 10-15% of your total planned portfolio in a single stock. Consider round lots for easier tracking.

### "Should I buy all at once or in parts?"
For beginners, consider splitting your purchase across 2-3 transactions to average your entry price.

### "What if the price drops after I buy?"
This is normal and expected. Focus on your long-term investment thesis rather than short-term price movements.

### "When should I sell?"
Set clear criteria before buying: target price, fundamental changes, or time horizon. Don't sell based on emotions.

## Tracking Your Investment

### Essential Monitoring Points
- Quarterly results announcements
- Important management changes
- Major news affecting the company or sector
- Annual reports and shareholder meetings

### Healthy Tracking Habits
- ✅ Review portfolio monthly, not daily
- ✅ Compare performance to appropriate benchmarks
- ✅ Focus on business fundamentals, not just price
- ✅ Keep trading activity minimal as a beginner

### Unhealthy Habits to Avoid
- ❌ Checking stock price multiple times daily
- ❌ Overreacting to short-term price movements
- ❌ Frequently changing your investment thesis
- ❌ Trading based on tips or rumors

## First Stock Purchase Dos and Don'ts

### DO:
✅ Start with a company you understand
✅ Invest an amount you're comfortable losing
✅ Document why you bought the stock
✅ Have realistic expectations
✅ Keep records for tax purposes

### DON'T:
❌ Try to time the market perfectly
❌ Put all your money in one stock
❌ Buy based on tips without research
❌ Expect to get rich quickly
❌ Panic sell if the market drops

💡 **Pro Tip**: After making your first purchase, write down your investment thesis—why you bought the stock and what you expect from it. Review this document before making any selling decisions to avoid emotional reactions.`,
              lesson_order: 3
            }
          ]
        },
        {
          title: "Investment Strategies for Beginners",
          description: "Learn foundational investment approaches suitable for new investors.",
          module_order: 3,
          lessons: [
            {
              title: "Understanding SIPs and Rupee Cost Averaging",
              content: `# Understanding SIPs and Rupee Cost Averaging

💰 Systematic Investment Plans (SIPs) and Rupee Cost Averaging are powerful strategies that help you build wealth consistently while reducing risk.

## What is a Systematic Investment Plan (SIP)?

A SIP is a method of investing a fixed amount at regular intervals (typically monthly) in mutual funds or stocks.

### Key Features of SIPs
- **Automated**: Set up once, runs automatically
- **Flexible**: Can start with as little as ₹500/month
- **Disciplined**: Enforces regular investing habit
- **Adjustable**: Can increase/decrease/pause as needed
- **Long-term**: Designed for wealth creation over time

## How Rupee Cost Averaging Works

Rupee Cost Averaging is the principle behind SIPs. By investing a fixed amount regularly regardless of market conditions:

- You buy **more units** when prices are low
- You buy **fewer units** when prices are high
- Your **average purchase price** is typically lower than the average market price over time

### Practical Example of Rupee Cost Averaging

| Month | Amount Invested | Market Price | Units Purchased | Total Units |
|-------|----------------|--------------|----------------|-------------|
| Jan   | ₹5,000         | ₹100         | 50.00          | 50.00       |
| Feb   | ₹5,000         | ₹80          | 62.50          | 112.50      |
| Mar   | ₹5,000         | ₹70          | 71.43          | 183.93      |
| Apr   | ₹5,000         | ₹90          | 55.56          | 239.49      |
| May   | ₹5,000         | ₹120         | 41.67          | 281.16      |
| Jun   | ₹5,000         | ₹110         | 45.45          | 326.61      |

**Total Invested**: ₹30,000
**Total Units**: 326.61
**Average Cost Per Unit**: ₹91.85 (₹30,000 ÷ 326.61)
**Average Market Price**: ₹95 (sum of prices ÷ 6)
**Current Value**: ₹35,927 (326.61 units × ₹110)

Even though the market price fluctuated significantly, your average purchase price is lower than the average market price!

## Benefits of SIP Investing

### 1. Disciplined Investing
- Removes emotional decision-making
- Creates a habit of regular saving
- Avoids the temptation to time the market

### 2. Risk Mitigation
- Spreads investments across different market cycles
- Reduces impact of market volatility
- Protects against poor timing decisions

### 3. Power of Compounding
- Regular investments maximize compound growth
- Earlier investments have more time to grow
- Even small increases in monthly amount have significant impact

### 4. Flexibility
- Can start with small amounts
- Option to increase contribution as income grows
- Facility to pause during financial emergencies

## Setting Up Your SIP Strategy

### 1. Choosing Between Mutual Funds and Direct Stocks
- **Mutual Fund SIPs**: Professionally managed, diversified
- **Direct Equity SIPs**: More control, potentially higher returns but higher risk
- **Beginners**: Usually better to start with mutual fund SIPs

### 2. Determining Your SIP Amount
- Start with what's comfortable (even ₹500-1000/month)
- Aim for 15-20% of your monthly income eventually
- Increase gradually with income growth

### 3. Selecting the Right Frequency
- **Monthly**: Most common and convenient
- **Quarterly**: For irregular income earners
- **Weekly**: More averaging benefit (but more transactions)

### 4. Setting Up the Process
- Through mutual fund apps/websites
- Via your bank's auto-debit facility
- Through broker platforms for stock SIPs

## SIPs for Different Financial Goals

### Short-Term Goals (1-3 years)
- **Suitable funds**: Liquid, ultra-short, short duration
- **Expected returns**: 5-7%
- **Risk level**: Very low to low

### Medium-Term Goals (3-7 years)
- **Suitable funds**: Balanced advantage, conservative hybrid
- **Expected returns**: 8-10%
- **Risk level**: Low to moderate

### Long-Term Goals (7+ years)
- **Suitable funds**: Equity, index funds
- **Expected returns**: 10-12%
- **Risk level**: Moderate to high

## Advanced SIP Strategies

### 1. SIP Top-Up
Increase your SIP amount annually to align with income growth:
- Start with ₹5,000/month
- Increase by 10% each year
- After 5 years: ₹8,053/month
- Significantly boosts long-term corpus

### 2. Value Averaging (Advanced)
Adjust your investment amount to reach a predetermined portfolio growth path:
- Invest more when market underperforms
- Invest less when market outperforms
- Requires more active management

### 3. SIP Diversification
Distribute your SIP across different types of funds:
- 50% in large-cap/index funds
- 30% in mid-cap funds
- 20% in small-cap/sector funds

## Common SIP Mistakes to Avoid

### ❌ Starting and stopping frequently
Disrupts the power of compounding and averaging

### ❌ Checking performance too often
SIPs are designed for long-term growth, not short-term gains

### ❌ Not increasing SIP with income growth
Limits the potential of your investment

### ❌ Withdrawing at first sign of market decline
Defeats the purpose of rupee cost averaging

### ❌ Not reviewing fund performance annually
Even SIPs need periodic assessment for optimization

💡 **Key Insight**: The magic of SIPs lies not in timing the market but in time in the market. Consistency over long periods, regardless of market conditions, is what leads to wealth creation.`,
              lesson_order: 1
            },
            {
              title: "Diversification for Beginners",
              content: `# Diversification for Beginners

🔄 Diversification is one of the most powerful risk management strategies available to investors—it's essentially not putting all your eggs in one basket.

## What is Diversification?

Diversification means spreading your investments across different assets to reduce risk without significantly sacrificing returns.

### The Core Principle Explained
- Different investments perform differently under various economic conditions
- Losses in one area can be offset by gains in another
- Overall portfolio volatility is reduced
- Long-term returns become more stable and predictable

## Why Every Investor Needs Diversification

### Risk Reduction
- Protects against company-specific issues
- Shields from sector-wide downturns
- Provides buffer against market crashes
- Reduces impact of regional economic problems

### Real Examples of Diversification Benefits
- **2008 Financial Crisis**: When stocks fell 50%+, government bonds gained value
- **COVID-19 Crash**: Technology stocks recovered quickly while travel/hospitality suffered
- **Inflation Periods**: Commodities and real estate often thrive while bonds struggle

## Types of Diversification for Beginners

### 1. Asset Class Diversification
Spreading investments across different types of assets:
- **Stocks**: Ownership in companies, higher growth potential
- **Bonds**: Fixed income securities, more stable
- **Cash/Liquid Funds**: For stability and emergencies
- **Gold**: Traditional hedge against inflation

### 2. Equity Diversification
Within your stock investments:
- **Market Capitalization**: Large, mid, and small-cap
- **Sectors**: IT, Banking, FMCG, Pharma, etc.
- **Investment Styles**: Growth, value, dividend
- **Geographic**: Domestic and international

### 3. Time Diversification
- **SIPs**: Regular investments over time
- **Staggered Entry**: Dividing lump sum into multiple investments
- **Laddering**: For fixed income investments with different maturities

## Simple Diversification Strategies for Beginners

### 1. The Basic Three-Fund Portfolio
- **70%**: Large-cap index fund (Nifty 50 or Sensex)
- **20%**: Bond fund or government securities
- **10%**: Gold ETF or sovereign gold bonds

### 2. The Five-Pocket Allocation
- **40%**: Large-cap fund
- **20%**: Mid and small-cap fund
- **20%**: International fund
- **15%**: Debt fund
- **5%**: Gold

### 3. Sector-Based Approach
- **25%**: Financial services
- **20%**: Information technology
- **15%**: Consumer goods
- **15%**: Healthcare
- **10%**: Manufacturing
- **15%**: Others (energy, utilities, etc.)

## Creating Your Diversified Portfolio

### Step 1: Assess Your Risk Tolerance
- **Conservative**: Higher allocation to bonds and stable assets
- **Moderate**: Balanced allocation between growth and stability
- **Aggressive**: Higher allocation to equities and growth assets

### Step 2: Consider Your Time Horizon
- **Short-term (1-3 years)**: Safety and liquidity prioritized
- **Medium-term (3-7 years)**: Moderate growth with stability
- **Long-term (7+ years)**: Growth prioritized, more equity

### Step 3: Build Your Core Holdings
- Start with broad market index funds
- Add bond funds for stability
- Consider a small gold allocation

### Step 4: Add Satellite Investments
- Sector funds for specific opportunities
- Individual stocks you understand well
- International exposure

## Warning Signs of Poor Diversification

### High Correlation Between Investments
- If all your investments move in the same direction at the same time
- Example: Multiple funds with overlapping holdings

### Overexposure to Single Factors
- Too much in one sector (e.g., only tech stocks)
- Concentrated in one geographic region
- Dependent on one economic factor (e.g., interest rates)

### Too Many Similar Investments
- Multiple funds with similar strategies
- Several stocks from the same industry
- Different instruments with the same underlying asset

## Common Diversification Mistakes

### ❌ Over-Diversification
- Owning too many similar funds or stocks
- Dilutes the benefit of top performers
- Makes portfolio tracking complicated
- Solution: Focus on 8-12 well-chosen investments

### ❌ Under-Diversification
- Concentrated in a few stocks or sectors
- Exposed to unnecessary specific risks
- Solution: Ensure representation across major sectors and asset classes

### ❌ Ignoring Correlation
- Investments that move together don't provide diversification
- Solution: Choose assets that historically behave differently

### ❌ Diversifying Without Research
- Buying random stocks across sectors
- Not understanding what you own
- Solution: Research each investment, even if it's for diversification

## Tools for Managing Diversification

### 1. Portfolio Trackers
- Morningstar Portfolio Manager
- ValueResearch Portfolio Manager
- Broker platforms with analytical tools

### 2. Rebalancing Strategy
- Review your portfolio every 6-12 months
- Bring allocations back to target percentages
- Systematically "buy low, sell high"

### 3. Correlation Analysis
- Check how your investments move in relation to each other
- Aim for assets with low or negative correlations
- Most portfolio analysis tools provide this feature

## Ready-Made Diversified Options for Beginners

### Multi-Asset Funds
- Single funds that invest across stocks, bonds, and gold
- Professional management of diversification
- Example: ICICI Prudential Multi-Asset Fund

### Asset Allocation Funds
- Automatically adjust between equity and debt based on market conditions
- Example: DSP Dynamic Asset Allocation Fund

### Index Funds
- Provide instant diversification across top companies
- Low-cost and simple
- Example: UTI Nifty Index Fund, SBI Sensex Fund

💡 **Key Insight**: Proper diversification shouldn't just spread your money—it should spread your risk. Aim for investments that respond differently to economic events while still aligning with your long-term goals.`,
              lesson_order: 2
            }
          ]
        },
        {
          title: "Stock Market Psychology",
          description: "Understand the psychological aspects of investing and how to overcome common cognitive biases.",
          module_order: 4,
          lessons: [
            {
              title: "Managing Emotions While Investing",
              content: `# Managing Emotions While Investing

🧠 The greatest challenge in investing isn't finding the best stocks—it's controlling your own emotions. Successful investors master their psychology first, then the markets.

## The Emotional Cycle of Investing

### Typical Emotional Stages
1. **Optimism**: "The market is doing well, I should invest!"
2. **Excitement**: "My investments are growing nicely!"
3. **Thrill**: "This is amazing! I'm making so much money!"
4. **Euphoria**: "I'm a genius investor! Nothing can go wrong!"
5. **Anxiety**: "Why is the market dropping? It's just temporary..."
6. **Denial**: "My stocks are solid, they'll bounce back soon."
7. **Fear**: "I'm losing too much money. What should I do?"
8. **Desperation**: "I need to do something to stop these losses!"
9. **Panic**: "I can't take it anymore! Sell everything!"
10. **Despondency**: "I'll never invest in stocks again."
11. **Depression**: "I've lost so much money..."
12. **Hope**: "Maybe the market is stabilizing now?"
13. **Relief**: "My portfolio is finally recovering."
14. **Optimism**: The cycle begins again...

### How This Affects Your Returns
- **Buy high**: Most people invest heavily during stages 3-4
- **Sell low**: Most people sell during stages 8-9
- **Miss recovery**: Most people stay out during stages 10-13
- **Result**: Significantly worse performance than the market average

## Common Emotional Biases in Investing

### 1. Fear of Missing Out (FOMO)
- **Symptoms**: Investing in hot stocks without research, buying near market tops
- **Dangers**: Buying overvalued assets, taking excessive risks
- **Example**: Cryptocurrency rushes, IPO frenzies

### 2. Loss Aversion
- **Symptoms**: Holding losing stocks too long, selling winners too early
- **Dangers**: Small winners, large losers in portfolio
- **Research**: People feel losses 2-3 times more strongly than equivalent gains

### 3. Confirmation Bias
- **Symptoms**: Only seeking information that supports your existing beliefs
- **Dangers**: Missing warning signs, ignoring negative developments
- **Example**: Following only bullish analysts when you own a stock

### 4. Recency Bias
- **Symptoms**: Giving too much weight to recent events
- **Dangers**: Extrapolating short-term trends too far into future
- **Example**: Assuming a bull market will continue indefinitely

### 5. Herd Mentality
- **Symptoms**: Investing based on what others are doing
- **Dangers**: Buying high, selling low alongside the crowd
- **Warren Buffett Quote**: "Be fearful when others are greedy, and greedy when others are fearful"

## Signs You're Making Emotional Decisions

### Red Flags in Your Behavior
- Checking your portfolio multiple times daily
- Making investment decisions late at night or when stressed
- Feeling urgency to act immediately
- Unable to explain your investment rationale clearly
- Borrowing money to invest because you "can't miss this opportunity"
- Feeling jealous about others' investment returns

### Physical and Mental Signs
- Increased heart rate when checking investments
- Sleep disruption due to market concerns
- Mood swings tied to portfolio performance
- Difficulty concentrating on other areas of life

## Building Your Emotional Resilience

### 1. Create a Written Investment Plan
- Document your goals, time horizon, and risk tolerance
- Establish clear criteria for buying and selling
- Set realistic return expectations
- Review during calm times, follow during volatile times

### 2. Implement Automatic Safeguards
- **Regular investing**: Set up SIPs to invest automatically
- **Rebalancing schedule**: Calendar-based, not emotion-based
- **Position sizing rules**: Limit exposure to any single investment
- **Stop-loss orders**: For traders, not long-term investors

### 3. Develop Healthy Information Habits
- Consume financial news in scheduled batches, not continuously
- Follow thoughtful analysts with different perspectives
- Distinguish between noise (daily market moves) and signal (fundamental changes)
- Take social media investment advice with extreme caution

### 4. Create Decision-Making Protocols
Before any significant investment decision, ask yourself:
1. Does this align with my written plan?
2. Would I make this same decision if the market were closed for the next week?
3. Can I clearly articulate why I'm making this move?
4. Am I acting out of fear or greed right now?
5. Have I considered the opposite viewpoint?

## Techniques for Specific Emotional Challenges

### For Market Crashes
- **Perspective shift**: View crashes as sales on quality companies
- **Historical context**: Review how markets have always recovered
- **Opportunity fund**: Keep cash ready to deploy during significant drops
- **Media diet**: Reduce financial news consumption during extreme volatility

### For Bull Markets
- **Valuation discipline**: Be increasingly cautious as valuations stretch
- **Rebalancing**: Systematically take some profits from winners
- **Contrarian thinking**: Consider what could go wrong when everyone is optimistic
- **Historical context**: Remember all bull markets eventually end

### For Personal Investment Mistakes
- **Journaling**: Document decisions and learn from results
- **Sunk cost thinking**: Past losses shouldn't influence future decisions
- **Forgiveness practice**: Everyone makes investing mistakes
- **Learning mindset**: Replace "failure" with "feedback"

## Professional Support Systems

### 1. Investment Advisors
A good advisor's greatest value often isn't stock picking but behavioral coaching during market extremes.

### 2. Accountability Partners
Share your investment plan with a trusted, level-headed friend who can question your emotional decisions.

### 3. Investment Communities
Join groups focused on rational, long-term investing approaches rather than get-rich-quick strategies.

## Mantras for Emotional Balance

- "Time in the market beats timing the market."
- "This too shall pass."
- "I'm investing for years, not days."
- "Be greedy when others are fearful, fearful when others are greedy."
- "The market is a voting machine in the short run, a weighing machine in the long run."

💡 **Key Insight**: Your investment returns are determined more by your behavior than by your knowledge. The investor who maintains emotional discipline through market cycles will outperform the knowledgeable investor who succumbs to fear and greed.`,
              lesson_order: 1
            },
            {
              title: "Building Long-Term Wealth Mindset",
              content: `# Building Long-Term Wealth Mindset

🌱 Successful investing is not about getting rich quick—it's about developing the mindset, habits, and patience to build wealth consistently over time.

## Understanding True Wealth Building

### The Mathematics of Wealth
- **Compound Growth**: The exponential effect of returns on returns
- **Time Advantage**: Starting early is more powerful than investing more
- **Consistency Premium**: Regular investing beats sporadic large investments
- **Sustainable Rate**: Steady 12-15% returns outperform volatile higher returns

### The 7-Year Doubling Rule
At 10% annual returns:
- ₹1 lakh becomes ₹2 lakhs in ~7 years
- ₹1 lakh becomes ₹4 lakhs in ~14 years
- ₹1 lakh becomes ₹8 lakhs in ~21 years
- ₹1 lakh becomes ₹16 lakhs in ~28 years

This exponential growth means the majority of your wealth accumulates in the later years—patience is essential.

## Core Principles of Long-Term Investing

### 1. Ignore Short-Term Fluctuations
- Daily, weekly, even monthly movements are just noise
- Market timing is consistently proven to reduce returns
- Focus on business fundamentals, not stock prices

### 2. Quality Over Speculation
- Invest in companies with:
  - Strong competitive advantages
  - Consistent profitability
  - Capable and honest management
  - Growth potential
- Avoid "hot tips" and market fads

### 3. Compounding as a Lifestyle
- Allow dividends to reinvest
- Let winners keep running
- Minimize turnover in your portfolio
- Think in decades, not years

### 4. View Market Drops as Opportunities
- Stock market "sales" happen periodically
- Downturns are when wealth transfers from impatient to patient investors
- Keep cash reserves to deploy during significant corrections

## Developing Patience as an Investor

### The Reality of Returns
- **Stock market averages**:
  - Positive years: ~70% of the time
  - Negative years: ~30% of the time
  - Average bull market: 6+ years
  - Average bear market: 1.3 years

- **Individual stocks**:
  - Even great companies have bad quarters
  - Most multibaggers had 30-50% drawdowns on their way up
  - Price often disconnects from value for extended periods

### Techniques to Cultivate Patience
- **Reduce monitoring frequency**: Check portfolios monthly, not daily
- **Focus on income streams**: Dividends provide tangible progress
- **Visualize end goals**: Connect investments to life objectives
- **Study investing history**: Understand market cycles and recoveries
- **Read investor biographies**: Learn from the masters of patience

## Creating Your Personal Wealth Philosophy

### Questions to Define Your Approach
1. What does financial success mean to you specifically?
2. What rate of return is realistically sustainable for your investment style?
3. What level of volatility can you truly tolerate emotionally?
4. How involved do you want to be with managing investments?
5. What are non-negotiable ethical considerations for your investments?

### Sample Wealth Philosophies
- "I invest in quality businesses at reasonable prices and hold them for years while they compound."
- "I build wealth through index funds while focusing my energy on my career and family."
- "I create a portfolio of dividend-growing stocks that will eventually replace my salary."

## Setting Realistic Expectations

### Returns Expectations
- **Aggressive growth**: 15-18% annually with significant volatility
- **Balanced growth**: 12-15% annually with moderate volatility
- **Conservative growth**: 8-12% annually with lower volatility
- **All approaches**: Will include years with negative returns

### Time Horizons for Different Goals
- **Retirement**: Longest horizon, highest growth allocation
- **Children's education**: Medium horizon, moderate growth/stability mix
- **Home purchase**: Shorter horizon, more stability focused

## Creating Accountability Systems

### 1. Annual Investment Review
Schedule a yearly "meeting with yourself" to assess:
- Performance versus appropriate benchmarks
- Alignment with long-term goals
- Changes needed to asset allocation
- Tax efficiency opportunities

### 2. Investment Journal
Keep records of:
- Why you purchased each investment
- What would make you sell
- Lessons learned from both wins and losses
- Emotional reactions to market events

### 3. Progress Milestones
Create meaningful targets:
- First ₹1 lakh invested
- First year of beating inflation
- First dividend that covers a monthly bill
- Portfolio value equals one year's salary

## Avoiding Wealth-Building Derailments

### 1. Lifestyle Inflation
- As income increases, maintain or increase savings rate
- Evaluate purchases by hours worked rather than rupee cost
- Practice conscious spending rather than automatic consumption

### 2. Get-Rich-Quick Temptations
- Recognize schemes that promise unrealistic returns
- Consider opportunity costs of speculative investments
- Remember: sustainable wealth rarely happens overnight

### 3. Overconfidence After Success
- Bull markets make everyone feel like a genius
- Initial success often leads to excessive risk-taking
- Maintain discipline regardless of recent performance

## Passing the Generational Wealth Mindset

### Teaching Children About Investing
- Start with simple concepts at young ages
- Demonstrate compound growth with real examples
- Share both successes and mistakes
- Emphasize purpose over pure accumulation

### Family Wealth Discussions
- Communicate values around money and wealth
- Create shared goals and milestones
- Discuss inheritance plans openly
- Consider family philanthropy projects

## The Bigger Picture: Wealth With Purpose

### Beyond Accumulation
- Define "enough" for your lifestyle
- Identify meaningful uses for wealth beyond basics
- Consider knowledge and time as forms of wealth to share
- Balance wealth building with present enjoyment

### Common Purposes For Building Wealth
- Financial independence and career flexibility
- Educational opportunities for family
- Philanthropic impact
- Legacy creation
- Life experiences and memories

💡 **Key Insight**: The most successful investors are not those who pick the best stocks, but those who maintain a consistent approach through market cycles, align investments with personal values, and focus on the long-term compounding of reasonable returns rather than pursuing spectacular short-term gains.`,
              lesson_order: 2
            }
          ]
        }
      ]
    };
    
    // Create the courses
    await createCourse(aiToolsCourse);
    await createCourse(stockMarketCourse);
    
    console.log("App data initialization complete");
  } catch (error) {
    console.error("Error initializing app data:", error);
  }
};
