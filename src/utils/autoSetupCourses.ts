
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

    // Module 1: Introduction to AI Tools
    const { data: module1Data, error: module1Error } = await supabase
      .from('course_modules')
      .insert({
        course_id: courseId,
        title: 'Introduction to AI Tools',
        description: 'Learn the basics of AI tools and how they can benefit students',
        module_order: 1,
        content: 'This module introduces you to AI tools and their importance for students.'
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
          content: `# What are AI Tools? 💻

AI tools are software applications powered by artificial intelligence that can help you complete tasks more efficiently.

## How AI Tools Work 🧠

AI tools use machine learning algorithms to:
- Understand natural language inputs (what you type or say)
- Process information from vast datasets
- Generate human-like outputs (text, images, code, etc.)

## Common Types of AI Tools for Students 📚

1. **Writing Assistants**
   - Help with essays, reports, and creative writing
   - Check grammar and suggest improvements
   - Example: Grammarly, Quillbot

2. **Research Tools**
   - Answer questions on any topic
   - Summarize complex information
   - Example: ChatGPT, Google Bard

3. **Creative Tools**
   - Generate images, videos, or music
   - Help with design projects
   - Example: Canva AI, Leonardo AI

4. **Productivity Tools**
   - Take and organize notes
   - Create study schedules
   - Example: Notion AI, Todoist

## Benefits of AI Tools 🌟

- Save time on repetitive tasks
- Get instant feedback on your work
- Learn complex topics more easily
- Enhance your creativity

Remember: AI tools are meant to assist you, not replace your own thinking and learning!`
        },
        {
          module_id: module1Data[0].id,
          title: 'Why AI is Important for Students',
          lesson_order: 2,
          content: `# Why AI is Important for Students 🎓

AI is transforming education and career preparation in significant ways. Here's why it matters for students like you:

## Academic Advantages 📝

### 1. Learning Enhancement
- **Personalized learning:** AI adapts to your pace and style
- **24/7 help:** Get answers and explanations anytime
- **Breaking down complex topics:** AI can explain difficult concepts in simple terms

### 2. Productivity Boost
- **Time-saving:** Automate repetitive tasks like formatting and citations
- **Organization:** Better notes, schedules, and study plans
- **Focus on what matters:** Less time on busywork, more on understanding

## Future-Proofing Your Career 💼

### 1. Job Market Reality
- 85% of jobs that will exist in 2030 haven't been invented yet
- Most future careers will involve working with AI in some capacity

### 2. Competitive Edge
- Students who understand AI tools have an advantage in internships and job applications
- Experience with AI tools demonstrates digital literacy to employers

## Life Skills Development 🌱

- **Critical thinking:** Learning which AI outputs to trust
- **Efficient problem-solving:** Using the right tool for each task
- **Digital literacy:** Navigating the increasingly AI-powered world

## Getting Started with AI 🚀

Start with one AI tool that solves a problem you have right now:
- Need writing help? Try Grammarly
- Want better notes? Explore Notion AI
- Need research assistance? Begin with ChatGPT

Remember: The goal is to use AI as a tool that empowers your own learning and creativity, not to replace your own thinking!`
        }
      ]);

    // Module 2: AI for Productivity
    const { data: module2Data, error: module2Error } = await supabase
      .from('course_modules')
      .insert({
        course_id: courseId,
        title: 'AI for Productivity',
        description: 'Learn how to use AI tools to boost your productivity and efficiency',
        module_order: 2,
        content: 'This module covers using AI tools for research, note-taking, and writing.'
      })
      .select();

    if (module2Error) throw module2Error;
    
    await supabase
      .from('lessons')
      .insert([
        {
          module_id: module2Data[0].id,
          title: 'Using ChatGPT for Research & Learning',
          lesson_order: 1,
          content: `# Using ChatGPT for Research & Learning 🔍

ChatGPT is an AI assistant that can help you with research and learning in numerous ways. Let's explore how to use it effectively!

## What is ChatGPT? 🤖

ChatGPT is an AI chatbot by OpenAI that can:
- Answer questions on almost any topic
- Explain complex concepts in simple terms
- Summarize information
- Help with problem-solving
- Generate creative ideas

## Research Applications for Students 📚

### 1. Starting Research Projects
- **Explore topics:** "Tell me about renewable energy technologies"
- **Find research questions:** "What are some interesting research questions about climate change?"
- **Locate sources:** "What are some credible sources on Indian economic policy?"

### 2. Understanding Complex Topics
- **Simple explanations:** "Explain quantum computing like I'm 15"
- **Step-by-step breakdowns:** "Walk me through how photosynthesis works"
- **Analogies:** "Compare and contrast mitosis and meiosis with a simple analogy"

## Effective Prompting Techniques 💬

The quality of ChatGPT's responses depends on your prompts:

### Good Prompts:
- Are specific and clear
- Include context about your needs
- Specify the format you want

### Example Prompts:

**Basic prompt:** "Tell me about climate change"

**Better prompt:** "I'm a first-year college student preparing a 5-minute presentation on climate change impacts in India. Can you provide 3-4 key points with simple explanations and a few statistics I could include?"

## Academic Integrity Guidelines ⚠️

- **Always cite ChatGPT** when you use its content in academic work
- **Verify information** with reliable sources (ChatGPT can make mistakes)
- **Use it as a learning aid**, not to replace your own analysis
- **Check your institution's policies** on AI tool usage

## Practical Exercise 🛠️

Try asking ChatGPT these questions to see how it can help with your studies:

1. "Explain [a concept from your current course] in simple terms"
2. "Create a study plan for [your upcoming exam]"
3. "Generate practice questions about [topic you're studying]"

Remember, ChatGPT is a starting point for research—not the final destination!`
        },
        {
          module_id: module2Data[0].id,
          title: 'Using Notion AI for Note-taking & Planning',
          lesson_order: 2,
          content: `# Using Notion AI for Note-taking & Planning 📝

Notion is a powerful productivity tool, and its AI features can transform how you take notes and plan your academic life.

## What is Notion AI? ✨

Notion AI integrates artificial intelligence into Notion's workspace platform, allowing you to:
- Generate and summarize text
- Improve your writing
- Create structured content quickly
- Extract key points from lengthy information

## Setting Up Notion for Students 🎒

### 1. Basic Setup
- Create a free Notion account at notion.so
- Enable Notion AI (note: AI features have a free trial, then require a subscription)
- Create a dashboard for your semester with pages for:
  - Courses
  - Assignments
  - Study notes
  - Project planning

### 2. Templates for Students
Notion offers pre-made templates for:
- Cornell Notes system
- Assignment tracker
- Reading list
- Project kanban boards
- Exam preparation

## AI-Powered Note-Taking 📋

### 1. During Class/Lectures
- Take rough notes in Notion
- After class, use the AI to:
  - **Summarize** with "Summarize this content"
  - **Create structure** with "Create a table of contents"
  - **Generate questions** with "Create practice questions from this material"

### 2. For Reading Materials
- Copy key paragraphs from reading assignments
- Ask Notion AI to:
  - "Extract key concepts from this text"
  - "Explain this in simpler terms"
  - "Create flashcards from this content"

## AI Planning Assistance 📅

### 1. Project Planning
Use Notion AI to:
- "Break down this project into manageable tasks"
- "Create a timeline for completing this assignment"
- "Generate a checklist for my research paper"

### 2. Study Planning
- "Create a study schedule for my finals"
- "Suggest a pomodoro schedule for studying this topic"
- "Prioritize these assignments based on deadline and importance"

## Tips for Maximum Benefit 💡

1. **Combine AI with your thinking:** Add your own insights to AI-generated content
2. **Create templates:** Save your favorite AI prompts as template buttons
3. **Use databases:** Organize AI-generated content in structured databases
4. **Collaborate:** Share your Notion pages with classmates for group projects
5. **Review and refine:** AI suggestions aren't perfect; always review and improve them

Notion AI works best when it complements your own organization system—make it work for your unique study style!`
        },
        {
          module_id: module2Data[0].id,
          title: 'Grammarly & Quillbot for Writing Help',
          lesson_order: 3,
          content: `# Grammarly & Quillbot for Writing Help ✍️

These two powerful AI writing tools can help you improve your writing for assignments, projects, and communication.

## Grammarly: Your Writing Assistant 📝

### What Grammarly Does
Grammarly is an AI writing assistant that helps with:
- Grammar and spelling corrections
- Punctuation and sentence structure
- Tone adjustments
- Clarity improvements
- Plagiarism detection (premium version)

### How to Use Grammarly as a Student

**1. Setup Options**
- Free browser extension (works on most websites)
- Desktop app for Windows/Mac
- Mobile keyboard app
- MS Word/Google Docs integration

**2. Features for Academic Writing**
- **Correctness:** Fixes basic errors
- **Clarity:** Suggests clearer phrasing
- **Engagement:** Helps make writing more interesting
- **Delivery:** Adjusts tone for academic context
- **Citations:** Helps format references (premium)

**3. Best Practices**
- Run all important assignments through Grammarly
- Adjust the goals setting for academic writing
- Review each suggestion critically—don't accept all changes
- Use the explanation feature to understand grammar rules

## Quillbot: Paraphrasing & Summarizing 🔄

### What Quillbot Does
Quillbot is an AI paraphrasing and summarizing tool that helps:
- Rewrite text in different ways
- Summarize long passages
- Expand short content
- Check for plagiarism (premium)

### How to Use Quillbot as a Student

**1. Setup Options**
- Free web version (with limitations)
- Chrome extension
- Premium version for full features

**2. Key Features**
- **Paraphraser:** 7 different modes (Standard, Formal, Simple, etc.)
- **Summarizer:** Create concise summaries of long texts
- **Citation Generator:** Create properly formatted citations
- **Grammar Checker:** Basic grammar checking

**3. Academic Use Cases**
- Understanding complex reading materials by simplifying
- Taking notes from textbooks by summarizing
- Improving your writing style
- Helping with writer's block by suggesting alternative phrasing

## Ethical Use Guidelines ⚠️

- **Never** use these tools to copy others' work
- **Always** cite sources properly
- **Understand** that using AI for complete assignments may violate academic integrity policies
- **Learn** from suggestions rather than just accepting them

## Workflow Example: Writing an Essay 📄

1. **Research & Plan:** Create outline and gather research
2. **First Draft:** Write without worrying about perfect grammar
3. **Quillbot:** Use summarizer to condense research materials
4. **Revision:** Use Grammarly to catch basic errors
5. **Polish:** Use Grammarly's suggestions for clarity and engagement
6. **Final Check:** Review everything manually before submission

These tools can dramatically improve your writing quality and efficiency when used thoughtfully!`
        }
      ]);

    // Module 3: AI for Creativity
    const { data: module3Data, error: module3Error } = await supabase
      .from('course_modules')
      .insert({
        course_id: courseId,
        title: 'AI for Creativity',
        description: 'Discover how to use AI tools for design, image creation, video editing, and music generation',
        module_order: 3,
        content: 'This module explores AI tools that can enhance your creativity across various mediums.'
      })
      .select();

    if (module3Error) throw module3Error;
    
    await supabase
      .from('lessons')
      .insert([
        {
          module_id: module3Data[0].id,
          title: 'Using Canva AI for Design',
          lesson_order: 1,
          content: `# Using Canva AI for Design 🎨

Canva is a popular design platform that has integrated powerful AI features to help students create professional designs without needing design experience.

## What is Canva AI? ✨

Canva AI refers to the artificial intelligence features within Canva that can:
- Generate designs from text descriptions
- Suggest design elements
- Remove backgrounds automatically
- Create text effects
- Suggest layouts and templates

## Getting Started with Canva 🚀

### 1. Setup
- Create a free Canva account at canva.com
- Students can get Canva Pro features with an education email
- Install the mobile app for on-the-go designing

### 2. AI Features for Students

**Magic Write (Text Generation)**
- Helps write descriptions, captions, and content
- Generate presentation content from simple prompts
- Create social media captions

**Magic Design**
- Turn text descriptions into complete designs
- Convert your ideas into visual templates
- Generate multiple design options from one prompt

**Background Remover**
- Automatically remove backgrounds from images
- Create clean, professional product photos
- Cut out subjects for collages or presentations

**Magic Edit/Magic Eraser**
- Edit or remove unwanted elements from images
- Clean up photos without Photoshop skills

## Student Projects with Canva AI 📚

### 1. Academic Presentations
- **Starting prompt:** "Create a professional slide deck about renewable energy"
- Add your specific content
- Use Magic Design to create consistent slide layouts
- Generate visualizations of data or concepts

### 2. Social Media Content
- Design club event promotions
- Create study group announcements
- Design personal branding materials for LinkedIn

### 3. Reports and Infographics
- Convert boring text reports into visual infographics
- Create data visualizations from research
- Design process diagrams and flowcharts

## Step-by-Step: Creating a Project Poster 📋

1. **Start** a new design with the "Poster" template
2. Use **Magic Write** to generate headline options: "Generate catchy headlines for my research project on water conservation"
3. Use **Magic Design** to create layout: "Create a scientific poster design with blue and green colors"
4. **Upload photos** of your project and use Background Remover to isolate important elements
5. Use **Brand Kit** to maintain consistent colors from your school or organization
6. Export as PDF or JPG for printing or digital distribution

## Tips for Impressive Designs 💡

- Start with Canva templates and customize them
- Use consistent colors (2-3 main colors)
- Stick to 1-2 font styles
- Use white space effectively
- Keep text concise
- Use high-quality images
- Align elements for professional appearance

Canva with AI makes professional-quality design accessible to every student—regardless of your design experience!`
        },
        {
          module_id: module3Data[0].id,
          title: 'Using Leonardo AI for Images',
          lesson_order: 2,
          content: `# Using Leonardo AI for Images 🖼️

Leonardo AI is a powerful tool for generating and editing images through artificial intelligence. As a student, you can use it to create unique visuals for projects, presentations, and creative work.

## What is Leonardo AI? 🎭

Leonardo AI is an image generation platform that:
- Creates images based on text descriptions
- Allows style customization
- Offers image editing capabilities
- Helps with visual concept development

## Getting Started with Leonardo AI 🚀

### 1. Setup
- Create an account at leonardo.ai
- Free tier offers limited generations
- Student discounts may be available
- Web-based interface (no installation needed)

### 2. Understanding Prompts
Creating effective prompts is key for good results:

**Prompt Structure:**
- **Subject:** What main thing you want to see
- **Setting:** Where the subject is located
- **Style:** Art style, rendering approach
- **Lighting:** How the scene is illuminated
- **Composition:** How elements are arranged

**Example Prompt:**
"A detailed illustration of a student studying in a modern library, digital art style, warm afternoon lighting, wide angle view"

## Student Applications 📚

### 1. Academic Projects
- **Biology:** Generate cell structures or anatomical illustrations
- **History:** Create period-accurate scene visualizations
- **Literature:** Visualize scenes from novels or poems
- **Engineering:** Conceptualize design ideas

### 2. Presentation Enhancement
- Custom header images for slides
- Concept visualization
- Data representation alternatives
- Consistent visual theme elements

### 3. Creative Projects
- Book cover designs
- Blog or website illustrations
- Social media content
- Creative writing inspiration

## Step-by-Step: Creating Project Visuals 📋

1. **Define your needs:** What visuals would enhance your project?
2. **Start simple:** Generate basic concepts first
3. **Refine prompts:** Add more detail for better results
4. **Iterate:** Use generated images to inspire better prompts
5. **Edit:** Use the editing features to perfect your image
6. **Export:** Download in appropriate resolution for your use case

## Ethical Guidelines ⚠️

- **Attribution:** Mention AI generation in your work
- **Copyright:** Understand that AI-generated images have complex copyright status
- **Academic integrity:** Check if your institution allows AI-generated images in assignments
- **Originality:** Use the tool to enhance your ideas, not replace your creativity

## Pro Tips for Better Results 💡

- **Be specific:** "A red car" will give random results; "A glossy red 2023 Tesla Model 3 photographed in a city street at sunset" will be more precise
- **Use reference images:** Upload reference images to guide the style
- **Learn from failures:** When results aren't good, adjust your prompt
- **Combine with other tools:** Use Leonardo outputs in Canva, Photoshop, etc.

Leonardo AI gives you the power to create professional visuals without needing artistic skills—perfect for student projects!`
        },
        {
          module_id: module3Data[0].id,
          title: 'Using Descript for Video Editing',
          lesson_order: 3,
          content: `# Using Descript for Video Editing 🎬

Descript is a revolutionary AI-powered video and audio editing tool that makes creating professional content as easy as editing a document.

## What is Descript? 🤖

Descript is a video and podcast editing software that:
- Transcribes your audio/video to text
- Allows you to edit video by editing text
- Offers AI voices for narration
- Removes filler words automatically
- Creates screen recordings
- Corrects mistakes with ease

## Getting Started with Descript 🚀

### 1. Setup
- Create an account at descript.com
- Free plan available with limitations
- Student discount available with education email
- Works on Mac and Windows

### 2. Core Features for Students

**Transcription & Text-Based Editing**
- Record or upload video/audio
- AI automatically transcribes speech to text
- Edit the transcript to edit the video
- Remove filler words ("um," "uh," "like") with one click

**Overdub (AI Voice)**
- Create an AI version of your voice (with consent)
- Fix mistakes without re-recording
- Generate narration from text
- Available in multiple languages

**Studio Sound**
- Enhance audio quality automatically
- Remove background noise
- Make recordings sound professional

**Screen Recording**
- Record your screen with webcam
- Edit the recording easily
- Perfect for tutorials and presentations

## Student Applications 📚

### 1. Academic Presentations
- Record presentations with minimal editing needed
- Create narrated slideshows
- Develop video assignments with professional quality
- Record group project discussions

### 2. Tutorial Creation
- Create how-to videos for study groups
- Record software demonstrations
- Explain complex concepts with visuals
- Share learning techniques with classmates

### 3. Documentation
- Record lab experiments
- Document project progress
- Create video notes for complex subjects
- Develop a portfolio of your work

## Step-by-Step: Creating an Educational Video 📋

1. **Plan your content:** Write a basic script or outline
2. **Record in Descript:** Use screen recording and/or webcam
3. **Edit the transcript:** Remove mistakes and filler words
4. **Enhance with Studio Sound:** Improve audio quality
5. **Add visuals:** Insert images, videos, or text elements
6. **Export:** Share as video file or upload directly to YouTube

## Tips for Professional Results 💡

- **Script important sections:** Have key points written out
- **Use good lighting:** Face a window or use a simple lamp
- **Consider audio:** Use a headset or microphone when possible
- **Keep it concise:** Aim for 3-5 minutes for instructional content
- **Practice basic sections:** Reduce editing needs through preparation
- **Use chapters:** Break longer videos into navigable sections

## Common Student Use Cases 🎓

- **Project presentations:** Create professional video presentations
- **Language practice:** Record and improve pronunciation/delivery
- **Study summaries:** Create video summaries of complex topics
- **Remote collaboration:** Record and share ideas with team members
- **Portfolio building:** Create professional samples of your work

Descript makes video creation accessible even without technical editing skills!`
        },
        {
          module_id: module3Data[0].id,
          title: 'Using Soundraw for Music Generation',
          lesson_order: 4,
          content: `# Using Soundraw for Music Generation 🎵

Soundraw is an AI music generation tool that allows you to create original, copyright-free music for your projects without any musical expertise.

## What is Soundraw? 🎹

Soundraw is a web-based AI tool that:
- Creates original music based on your specifications
- Offers different genres, moods, and instruments
- Provides royalty-free music for your projects
- Allows customization of length and structure
- Exports high-quality audio files

## Getting Started with Soundraw 🚀

### 1. Setup
- Visit soundraw.io
- Create a free account (limited generations)
- Paid plans available for more features
- No software installation needed (web-based)

### 2. How to Generate Music

**The Basic Process:**
1. Select a genre (Pop, Hip Hop, Lo-Fi, etc.)
2. Choose a mood (Happy, Sad, Energetic, Calm, etc.)
3. Set the length (30 seconds to 3+ minutes)
4. Select instruments to include or exclude
5. Generate multiple options
6. Download your favorite version

## Student Applications 🎓

### 1. Video Projects
- Create background music for presentations
- Add soundtracks to educational videos
- Develop music for student films
- Enhance social media content

### 2. Multimedia Presentations
- Add musical transitions between sections
- Create emotional impact for important points
- Develop theme music for recurring projects
- Match music to presentation tone

### 3. Creative Applications
- Podcast intros and outros
- Theatre production soundtracks
- Art installation audio
- Website background music

## Step-by-Step: Creating Project Music 📋

1. **Identify needs:** Determine mood, length, and style needed
2. **Select genre:** Choose the musical style that fits your project
3. **Adjust parameters:** Set BPM (speed), energy level, and instruments
4. **Generate options:** Create multiple versions to compare
5. **Fine-tune:** Adjust the arrangement if needed
6. **Export:** Download in appropriate format (MP3, WAV)

## Copyright Advantages ⚠️

- **Royalty-free:** No need to worry about copyright claims
- **Original music:** Each generation is unique
- **Full ownership:** You can use the music in any project
- **Attribution:** No need to credit Soundraw in your projects

## Tips for Effective Music Selection 💡

- **Match energy to content:** Fast-paced music for exciting content, slower for serious topics
- **Consider volume levels:** Ensure music doesn't overpower speech
- **Test with audience:** Get feedback on whether music enhances or distracts
- **Layer instrumental sections:** Use fuller music for intros/outros, simpler for backgrounds
- **Export at highest quality:** Always download the best quality for your final projects

## Creative Combinations 🌟

- Combine Soundraw music with Descript videos
- Use musical changes to signal new sections in presentations
- Create different themes for different course projects
- Develop a signature sound for your personal brand as a student

Soundraw makes it possible to have professional, original music for all your projects without musical training or copyright concerns!`
        }
      ]);

    // Module 4: Career & Future with AI
    const { data: module4Data, error: module4Error } = await supabase
      .from('course_modules')
      .insert({
        course_id: courseId,
        title: 'Career & Future with AI',
        description: 'Learn about job opportunities, freelancing, and building a portfolio with AI tools',
        module_order: 4,
        content: 'This module explores how AI tools can advance your career and future opportunities.'
      })
      .select();

    if (module4Error) throw module4Error;
    
    await supabase
      .from('lessons')
      .insert([
        {
          module_id: module4Data[0].id,
          title: 'Jobs that Use AI Tools',
          lesson_order: 1,
          content: `# Jobs that Use AI Tools 💼

AI is transforming nearly every industry, creating new opportunities for students who understand how to leverage these tools effectively.

## The AI-Enhanced Workforce 🌐

AI is not replacing most jobs—instead, it's changing how work is done. People who can work effectively with AI tools are becoming increasingly valuable across industries.

## Top Fields Using AI Tools 📊

### 1. Content Creation & Marketing
- **Digital Marketing Specialist**
  - Uses AI for audience analysis
  - Creates targeted content with AI writing tools
  - Analyzes campaign performance with AI insights
  
- **Content Creator**
  - Generates ideas with AI brainstorming
  - Edits content with AI assistance
  - Creates visuals and videos with AI tools

### 2. Business & Consulting
- **Business Analyst**
  - Processes data with AI analysis tools
  - Creates forecasts and predictions
  - Generates reports automatically
  
- **Project Manager**
  - Uses AI for scheduling and resource allocation
  - Automates progress tracking and reporting
  - Predicts bottlenecks before they occur

### 3. Design & Creative Fields
- **UX/UI Designer**
  - Generates design variations with AI
  - Creates user personas through data analysis
  - Tests interfaces with AI simulation
  
- **Graphic Designer**
  - Uses AI for initial concept generation
  - Automates routine design tasks
  - Enhances images with AI tools

### 4. Software & Technology
- **Software Developer**
  - Uses AI coding assistants (GitHub Copilot, etc.)
  - Automates testing and debugging
  - Generates code documentation
  
- **Data Scientist**
  - Creates predictive models
  - Automates data cleaning and preparation
  - Visualizes insights using AI tools

### 5. Healthcare & Sciences
- **Healthcare Administrator**
  - Manages scheduling with AI optimization
  - Processes documentation automatically
  - Analyzes operational efficiency
  
- **Research Assistant**
  - Summarizes research papers
  - Finds patterns in research data
  - Generates literature reviews

## Skills That Complement AI Knowledge 🔍

These skills make you more valuable when working with AI:

1. **Critical thinking** - Evaluating AI outputs
2. **Problem formulation** - Knowing what to ask AI systems
3. **Data literacy** - Understanding what data means
4. **Ethics awareness** - Recognizing bias and fairness issues
5. **Adaptability** - Learning new tools quickly

## How to Prepare for AI-Enhanced Careers 🚀

### 1. Education Focus
- Take courses in your field that incorporate AI
- Learn basic data analysis
- Understand the fundamentals of how AI works

### 2. Practical Experience
- Use AI tools in your school projects
- Document your experience with different AI applications
- Create before/after examples showing AI enhancement

### 3. Stay Updated
- Follow AI developments in your field of interest
- Join online communities (Reddit, Discord) about AI tools
- Experiment with new tools as they emerge

## Emerging Roles Specifically for AI 🌱

- **Prompt Engineer** - Specialist in creating effective AI instructions
- **AI Trainer** - Helps improve AI models with feedback
- **AI-Human Workflow Designer** - Creates processes combining AI and human work
- **AI Ethics Consultant** - Ensures AI is used responsibly
- **AI Implementation Specialist** - Helps companies adopt AI effectively

The best strategy is not to compete with AI, but to become someone who knows how to work with AI better than others in your field!`
        },
        {
          module_id: module4Data[0].id,
          title: 'Freelancing with AI',
          lesson_order: 2,
          content: `# Freelancing with AI 🚀

AI tools can give freelancers a significant competitive advantage, allowing you to deliver high-quality work more efficiently and take on more projects.

## Why AI + Freelancing is a Powerful Combination 💪

- **Scale your capabilities:** Do the work of a small team as an individual
- **Expand your service offerings:** Offer more services with AI assistance
- **Competitive pricing:** Complete work faster, allowing for better rates
- **Consistent quality:** Maintain high standards even with tight deadlines
- **Work-life balance:** Reduce time spent on repetitive tasks

## AI-Powered Freelance Opportunities 💼

### 1. Content Creation
- **Writing Services**
  - Blog posts (research with ChatGPT, polish with Grammarly)
  - Social media content (generate ideas and create variations)
  - Email newsletters (personalize content at scale)
  
- **Video Production**
  - Script writing assistance
  - Automated video editing (Descript)
  - Custom thumbnail generation

### 2. Design Services
- **Graphic Design**
  - Logo concepts (Leonardo AI + refinement)
  - Social media graphics (Canva AI)
  - Custom illustrations
  
- **Web Design**
  - UI component generation
  - Color scheme creation
  - User flow optimization

### 3. Marketing Services
- **SEO Optimization**
  - Keyword research automation
  - Content optimization for search
  - Performance prediction
  
- **Social Media Management**
  - Content scheduling with AI suggestions
  - Trend analysis
  - Engagement response assistance

### 4. Business Services
- **Virtual Assistance**
  - Email management with AI sorting
  - Calendar optimization
  - Document preparation
  
- **Data Analysis**
  - Automated report creation
  - Insight generation
  - Visualization of findings

## Getting Started with AI Freelancing 🛠️

### 1. Choose Your Niche
- Select services where:
  - You have basic skills already
  - AI can significantly enhance your capabilities
  - There is market demand
  - You enjoy the work

### 2. Build Your AI Toolkit
**Essential Tools:**
- ChatGPT or similar LLM
- Canva or other design AI
- Grammarly or editing assistant
- Notion AI for organization
- Industry-specific AI tools

### 3. Create Your Portfolio
- Show before/after examples of your work
- Highlight your process (not just AI outputs)
- Demonstrate value added beyond the AI
- Create case studies of successful projects

### 4. Set Up Your Freelance Presence
- Create profiles on freelance platforms (Upwork, Fiverr)
- Build a simple portfolio website
- Join relevant communities on Reddit, Discord, etc.
- Network with potential clients on LinkedIn

## Ethical Guidelines for AI Freelancing ⚖️

- **Transparency:** Be honest about AI use with clients
- **Value-add:** Ensure you're adding significant human value
- **Quality control:** Always review and improve AI outputs
- **Continuous learning:** Keep developing your own skills
- **Responsible pricing:** Charge fair rates for your expertise

## Example AI Freelance Service Packages 📦

### Content Creation Package
- 4 blog posts per month
- 16 social media posts
- 1 email newsletter
- Basic SEO optimization
- Monthly performance report

### Social Media Growth Package
- Platform strategy development
- Content calendar creation
- Daily post generation
- Engagement response assistance
- Weekly analytics report

### Student Website Package
- Personal portfolio site
- Content writing for about/services pages
- Basic SEO setup
- Social media integration
- Mobile optimization

By effectively combining your skills with AI tools, you can offer professional services even while studying—creating income and building valuable experience for your future career!`
        },
        {
          module_id: module4Data[0].id,
          title: 'Building Your Own AI Portfolio',
          lesson_order: 3,
          content: `# Building Your Own AI Portfolio 📊

Creating a portfolio that showcases your AI skills can significantly boost your career opportunities, whether you're applying for jobs, internships, or freelance work.

## Why Build an AI Portfolio? 🎯

- **Stand out from competitors:** Most students don't have AI portfolios yet
- **Demonstrate practical skills:** Show real results, not just course certificates
- **Showcase problem-solving:** Reveal your thought process using AI tools
- **Prove adaptability:** Show you're prepared for the evolving workplace
- **Create a personal brand:** Position yourself as tech-forward in your field

## What to Include in Your AI Portfolio 📂

### 1. AI Tool Proficiency Showcase
- **Tool mastery pages:** Dedicated sections for each major AI tool you know
- **Before/after examples:** Show how you transform raw content/ideas with AI
- **Process documentation:** Explain your approach to using each tool effectively

### 2. Project Case Studies
- **Problem statements:** Clearly define challenges you've addressed
- **AI approach:** Explain which tools you chose and why
- **Process documentation:** Show your prompts and iterations
- **Final results:** Demonstrate the outcome and impact
- **Lessons learned:** Share insights gained from each project

### 3. Field-Specific Applications
**For Business/Marketing Students:**
- Market analysis reports generated with AI assistance
- AI-enhanced presentation designs
- Social media campaigns with AI-generated content

**For Engineering/CS Students:**
- Code snippets created with AI pair programming
- AI-assisted design prototypes
- Data analysis with AI tools

**For Arts/Humanities Students:**
- Research papers with AI-assisted organization
- Creative projects combining human and AI elements
- Visual designs created with AI tools

## Portfolio Platform Options 🌐

### 1. Website Builders with AI Integration
- **Notion:** Create a comprehensive, easily-updated portfolio
- **Webflow:** More design control with AI-integration possibilities
- **Carrd:** Simple one-page showcase
- **WordPress:** Flexible with many integration options

### 2. Code Repository Platforms
- **GitHub:** For showing technical AI projects and implementations
- **GitLab:** Similar to GitHub with additional features
- **Replit:** For interactive AI-related demos

### 3. Design/Creative Platforms
- **Behance:** For visual AI projects and designs
- **Dribbble:** For showcasing AI-assisted designs
- **Medium:** For in-depth articles about your AI experiences

## Step-by-Step Portfolio Creation 📝

### 1. Planning Phase
- Identify 3-5 showcase projects
- Determine your unique value proposition with AI
- Choose your portfolio platform
- Outline your portfolio structure

### 2. Content Creation
- Document your AI processes with screenshots
- Create before/after comparisons
- Write clear explanations of your methods
- Record short demo videos if applicable

### 3. Design & Organization
- Create a clean, professional layout
- Organize projects by type/tool/industry
- Ensure mobile responsiveness
- Include clear contact information

### 4. Ongoing Maintenance
- Add new projects regularly
- Update with new AI tools as you learn them
- Refine based on feedback
- Track engagement and adjust accordingly

## Presenting Your AI Skills Effectively 💡

### 1. Focus on Outcomes, Not Just Tools
**Instead of:** "I know how to use ChatGPT"
**Better:** "I used ChatGPT to analyze customer feedback and identify three key product improvement areas"

### 2. Highlight Human+AI Collaboration
**Instead of:** "AI generated these designs"
**Better:** "I directed AI tools to explore 20+ design concepts, then refined and customized the most promising options"

### 3. Demonstrate Critical Thinking
**Instead of:** "The AI wrote this report"
**Better:** "I developed a system for using AI to research complex topics while maintaining accuracy through careful fact-checking and source verification"

## Portfolio Elements That Impress Employers 🌟

- Documentation of your prompt engineering skills
- Examples of problems you solved with AI assistance
- Quantifiable results (time saved, quality improved)
- Evidence of ethical AI use and awareness
- Continuous learning and adaptation to new AI tools

A well-crafted AI portfolio demonstrates not just your technical ability, but your forward-thinking approach to your field—making you an attractive candidate in any industry!`
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

    // Module 1: Basics of Investing
    const { data: module1Data, error: module1Error } = await supabase
      .from('course_modules')
      .insert({
        course_id: courseId,
        title: 'Basics of Investing',
        description: 'Understand the core concepts of investing in the stock market',
        module_order: 1,
        content: 'This module introduces you to the stock market and why investing is important, especially for students.'
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
          content: `# What is the Stock Market? 📈

The stock market is a place where people can buy and sell ownership shares in companies. Let's break this down into simple concepts!

## Stock Market Basics 🏢

### What is a Stock?
- A **stock** (or share) represents ownership in a company
- When you buy a stock, you become a partial owner of that company
- Companies sell stocks to raise money for growth, research, or expansion
- Stock owners can profit when the company performs well

### How the Stock Market Works
- Think of it as a giant marketplace where buyers and sellers meet
- The **price** of a stock is determined by supply and demand
- When more people want to buy than sell, prices go up
- When more people want to sell than buy, prices go down

## Stock Exchanges in India 🇮🇳

### National Stock Exchange (NSE)
- India's largest stock exchange
- Founded in 1992
- Located in Mumbai
- Trades in over 1,600 companies

### Bombay Stock Exchange (BSE)
- Asia's oldest stock exchange (established in 1875)
- Also located in Mumbai
- Lists more than 5,000 companies
- Known for the SENSEX index (tracks 30 major companies)

## Key Stock Market Terms 📝

### Must-Know Vocabulary
- **Bull Market:** When prices are rising consistently (think of a bull charging upward)
- **Bear Market:** When prices are falling consistently (think of a bear swiping downward)
- **Dividend:** Money paid to shareholders from company profits
- **Portfolio:** Collection of all stocks and investments you own
- **Market Cap:** Total value of a company's outstanding shares

### Market Indices
- **NIFTY 50:** Top 50 companies on NSE
- **SENSEX:** Top 30 companies on BSE
- These indices help track overall market performance

## How to Access the Stock Market 📱

### Trading Platforms
- **Brokers:** Traditional companies like ICICI Direct, HDFC Securities
- **Discount Brokers:** Lower-cost options like Zerodha, Upstox, Groww
- **Mobile Apps:** Most modern platforms have easy-to-use apps

### Account Types
- **Demat Account:** Where your shares are held electronically
- **Trading Account:** Used to buy and sell stocks
- Both are required to start investing

## The Stock Market's Importance 🌍

### Economic Impact
- Helps companies raise capital for growth
- Creates jobs and drives innovation
- Reflects the country's economic health

### Personal Opportunity
- Allows individuals to build wealth over time
- Provides passive income through dividends
- Offers higher potential returns than savings accounts

Remember: The stock market isn't just for the wealthy or financial experts. With the right knowledge and approach, it's accessible to students and beginners too!`
        },
        {
          module_id: module1Data[0].id,
          title: 'Why Should Students Invest Early?',
          lesson_order: 2,
          content: `# Why Should Students Invest Early? ⏰

Starting your investment journey while still a student can give you significant advantages for your financial future.

## The Power of Starting Early 🌱

### Compound Interest: Your Best Friend
- **Compound interest** means earning interest on both your initial investment AND on the interest you've already earned
- This creates a snowball effect that grows your money exponentially
- **Example:** ₹10,000 invested at age 20 vs. age 30 (with 10% annual returns):
  - Start at 20: Worth ₹4,52,593 by age 50
  - Start at 30: Worth ₹1,74,494 by age 50
  - Difference: ₹2,78,099 (159% more!)

### Time Heals Market Volatility
- Longer investment periods smooth out market ups and downs
- Students have decades ahead before retirement
- This time advantage allows for taking calculated risks with higher growth potential

## Financial Benefits for Students 💰

### Start with Small Amounts
- Begin with as little as ₹500 per month
- Increase investments gradually as income grows
- Small consistent investments are better than waiting to have "enough" money

### Student-Specific Advantages
- **Lower financial responsibilities:** Fewer bills than working adults
- **More risk tolerance:** Time to recover from investment mistakes
- **Tech familiarity:** Comfort with modern investment apps and platforms
- **Learning opportunity:** Practical education in financial literacy

## Beyond Money: Personal Development 🧠

### Building Essential Life Skills
- **Financial discipline:** Learning to save and invest regularly
- **Research abilities:** Analyzing companies and opportunities
- **Emotional control:** Managing reactions to market fluctuations
- **Long-term thinking:** Setting and working toward future goals

### Career Enhancement
- Practical knowledge that complements academic studies
- Conversation topics for networking and interviews
- Understanding of business and economic concepts
- Potential career paths in finance and investment

## Common Concerns and Solutions 🤔

### "I don't have enough money"
- **Solution:** Start with micro-investments through apps like Groww or Kuvera
- Even ₹100 per week builds good habits

### "The stock market is too risky"
- **Solution:** Begin with low-risk options like index funds or large stable companies
- Diversify even with small investments

### "I don't understand investing"
- **Solution:** Start simple with index funds while you learn
- Use free resources (YouTube, apps, websites) for education

### "I need my money for college expenses"
- **Solution:** Create a two-part strategy:
  - Emergency fund in savings account
  - Long-term money in investments

## Getting Started as a Student 🚀

### First Steps
1. **Learn the basics:** Complete this course!
2. **Set up accounts:** Open a savings account, demat, and trading account
3. **Start small:** Begin with an index fund like NIFTY 50
4. **Automate:** Set up small recurring investments

### Goal Setting
- Short-term: Learning and building habits
- Medium-term: Funding post-graduation goals
- Long-term: Creating financial independence

## Real Student Success Stories 📚

### Rahul from Delhi University
- Started investing ₹500 monthly in index funds at age 19
- By graduation at 22, had built basic portfolio worth ₹25,000
- Learning experience helped him land a job in financial services

### Priya from Bangalore
- Invested ₹1,000 from each internship payment
- Built a ₹40,000 portfolio during college
- Used investment knowledge to start a personal finance blog

Starting your investment journey as a student isn't about getting rich quickly—it's about building habits, knowledge, and a foundation that will benefit you for decades to come!`
        },
        {
          module_id: module1Data[0].id,
          title: 'Common Myths About Investing',
          lesson_order: 3,
          content: `# Common Myths About Investing 🔍

Many people avoid investing because of misconceptions. Let's debunk the most common myths that hold students back.

## Myth 1: "You Need Lots of Money to Start" ❌

### The Reality: ✅
- You can start investing with as little as ₹100 in some apps
- Many platforms have removed minimum investment requirements
- Systematic Investment Plans (SIPs) allow regular small investments
- Example: Monthly ₹500 investment can grow to ₹4.6+ lakhs in 25 years (at 12% average returns)

### Getting Started with Small Amounts:
- **Index funds:** Often allow investments starting at ₹500
- **Direct stocks:** Some shares cost less than ₹100
- **Micro-investing apps:** Round up everyday purchases and invest the difference

## Myth 2: "Investing is Like Gambling" ❌

### The Reality: ✅
- **Gambling** relies purely on chance with negative expected returns
- **Investing** is based on company performance, economic trends, and rational analysis
- Long-term investing in quality companies or diversified funds has historically grown wealth
- The longer your time horizon, the more predictable returns become

### Smart vs. Speculative Investing:
- **Smart investing:** Research-based decisions, long-term outlook, diversification
- **Speculative investing:** Short-term trading, following tips without research, concentration in high-risk assets

## Myth 3: "You Need to be a Math Genius" ❌

### The Reality: ✅
- Basic arithmetic is sufficient for most investment decisions
- Modern apps and calculators handle complex calculations
- You don't need to predict exact market movements
- Understanding concepts is more important than complex formulas

### Essential Skills (No Advanced Math Required):
- Understanding percentages (for returns and inflation)
- Basic addition and subtraction (for budgeting)
- Comparing numbers (for evaluating different investments)

## Myth 4: "The Stock Market is Too Risky for Students" ❌

### The Reality: ✅
- Risk varies greatly depending on your approach
- Students actually have the MOST time to recover from market downturns
- Diversification reduces individual investment risk
- Index funds spread risk across many companies

### Risk Management Strategies:
- Start with less volatile blue-chip companies
- Diversify across different sectors and company sizes
- Invest regularly regardless of market conditions (rupee cost averaging)
- Keep a long-term perspective (5+ years minimum)

## Myth 5: "You Need to Time the Market Perfectly" ❌

### The Reality: ✅
- Even professional investors cannot consistently time market highs and lows
- Research shows that **time in the market** beats **timing the market**
- Regular investing regardless of market conditions often outperforms trying to buy at the "perfect" time
- Missing just the 10 best market days over a decade can cut returns by more than half

### Better Approach:
- Systematic investment at regular intervals
- Focus on quality companies or funds with long-term growth potential
- Avoid emotional decisions based on news headlines

## Myth 6: "I Should Wait Until I Have a Full-Time Job" ❌

### The Reality: ✅
- Starting earlier, even with tiny amounts, builds crucial habits
- The learning experience is as valuable as the money invested
- Student years are perfect for making small mistakes and learning from them
- The habit of investing is harder to develop later when expenses increase

### Student Advantages:
- More time to learn from mistakes
- Lower financial commitments
- Access to educational resources
- Potentially more tech-savvy with investment apps

## Myth 7: "I Can Get Rich Quick Through Investing" ❌

### The Reality: ✅
- Sustainable wealth building is typically a slow, steady process
- Get-rich-quick schemes usually lead to losses
- Realistic annual returns on diversified investments range from 8-12% over long periods
- Compounding takes time but creates powerful results

### Realistic Expectations:
- First few years show modest absolute gains
- Middle years start showing meaningful growth
- Later years demonstrate the full power of compounding

Understanding these realities about investing can help you avoid common mistakes and start your investment journey with clear, realistic expectations!`
        }
      ]);

    // Module 2: Understanding Stocks
    const { data: module2Data, error: module2Error } = await supabase
      .from('course_modules')
      .insert({
        course_id: courseId,
        title: 'Understanding Stocks',
        description: 'Learn about different types of stocks, how to read stock charts, and what influences stock prices',
        module_order: 2,
        content: 'This module covers the fundamentals of understanding different stock types and how stock prices work.'
      })
      .select();

    if (module2Error) throw module2Error;
    
    await supabase
      .from('lessons')
      .insert([
        {
          module_id: module2Data[0].id,
          title: 'Types of Stocks (Blue-chip, Penny Stocks, etc.)',
          lesson_order: 1,
          content: `# Types of Stocks 📊

Stocks come in many varieties, each with different characteristics, risk levels, and potential rewards. Understanding these types will help you build a balanced portfolio.

## Market Capitalization Categories 📈

Market capitalization (market cap) = Share price × Total number of shares

### Large-Cap Stocks
- **Market cap:** Over ₹20,000 crore
- **Characteristics:** 
  - Well-established companies
  - Typically more stable
  - Often pay dividends
  - Lower growth potential but lower risk
- **Examples:** Reliance Industries, TCS, HDFC Bank
- **Best for:** Core portfolio holdings, stability

### Mid-Cap Stocks
- **Market cap:** ₹5,000 crore to ₹20,000 crore
- **Characteristics:**
  - Established businesses with growth potential
  - More volatile than large-caps
  - Balance of growth and stability
- **Examples:** Federal Bank, Jubilant FoodWorks, Voltas
- **Best for:** Growth potential with moderate risk

### Small-Cap Stocks
- **Market cap:** Less than ₹5,000 crore
- **Characteristics:**
  - Higher growth potential
  - More volatile and risky
  - Less analyst coverage (potential for undervaluation)
  - Less liquidity (harder to buy/sell quickly)
- **Examples:** Smaller manufacturing companies, regional businesses
- **Best for:** Aggressive growth, higher risk tolerance

## Quality-Based Categories 🏆

### Blue-Chip Stocks
- **Definition:** Shares of nationally recognized, well-established companies
- **Characteristics:**
  - Long history of stable earnings
  - Often pay regular dividends
  - Market leaders in their sectors
  - Strong balance sheets
- **Examples:** HDFC Bank, TCS, Hindustan Unilever
- **Best for:** Reliable long-term investments, income generation

### Growth Stocks
- **Definition:** Companies expected to grow earnings faster than the market
- **Characteristics:**
  - Reinvest profits rather than paying dividends
  - Often in technology, healthcare, or emerging sectors
  - Higher P/E ratios (price relative to earnings)
  - More volatile
- **Examples:** Many technology companies, emerging healthcare firms
- **Best for:** Long-term capital appreciation

### Value Stocks
- **Definition:** Companies trading below their intrinsic value
- **Characteristics:**
  - Lower P/E ratios
  - Often in established industries
  - May be temporarily out of favor
  - Usually pay dividends
- **Examples:** Certain banking, manufacturing, or energy stocks
- **Best for:** Potential price recovery and income

### Dividend Stocks
- **Definition:** Companies that regularly distribute profits to shareholders
- **Characteristics:**
  - Stable cash flow
  - Mature businesses
  - Lower growth but reliable income
  - Often in utilities, consumer staples, real estate
- **Examples:** Power Grid, ITC, Hindustan Unilever
- **Best for:** Income-focused investors, retirees

## Risk-Based Categories ⚠️

### Penny Stocks
- **Definition:** Very low-priced stocks, typically under ₹10
- **Characteristics:**
  - Extremely volatile
  - Often lack transparency
  - High potential returns but high failure rate
  - Limited information available
- **Examples:** Small, often struggling companies
- **Best for:** High-risk speculation only (NOT recommended for beginners)

### Cyclical Stocks
- **Definition:** Companies whose performance follows economic cycles
- **Characteristics:**
  - Perform well in economic booms
  - Struggle during recessions
  - More volatile than the overall market
- **Examples:** Automobile companies, cement, metals
- **Best for:** Economic recovery plays, timing-sensitive investments

### Defensive Stocks
- **Definition:** Companies that perform relatively well during economic downturns
- **Characteristics:**
  - Sell essential products/services
  - Stable demand regardless of economic conditions
  - Less growth during booms but more stability in recessions
- **Examples:** FMCG companies, healthcare, utilities
- **Best for:** Portfolio protection during uncertain times

## Building a Balanced Portfolio 🏗️

### Beginner's Approach
- **Core (60-70%):** Blue-chip and large-cap stocks or index funds
- **Growth (20-30%):** Select mid-cap stocks
- **Experimental (0-10%):** Small-cap stocks (only money you can afford to lose)

### Important Consideration: Diversification
- Spread investments across different:
  - Company sizes (large, mid, small)
  - Sectors (technology, healthcare, finance, etc.)
  - Stock types (growth, value, dividend)

### Red Flags to Avoid
- Companies with extremely high debt
- Businesses with unclear revenue models
- Stocks being heavily promoted on social media without fundamentals
- Companies with frequent management changes

Understanding these stock types will help you choose investments that match your financial goals, time horizon, and risk tolerance!`
        },
        {
          module_id: module2Data[0].id,
          title: 'How to Read a Stock Chart',
          lesson_order: 2,
          content: `# How to Read a Stock Chart 📊

Stock charts might look complicated at first, but understanding them is an essential skill for any investor. They tell the story of a stock's price movements over time.

## Basic Chart Types 📈

### Line Chart
- **What it shows:** Simple representation of closing prices connected by a line
- **Best for:** Quick overview of price trend
- **Limitation:** Doesn't show price fluctuations within each period

### Candlestick Chart
- **What it shows:** Open, high, low, and close prices for each period
- **Components:**
  - **Body:** Rectangle showing open and close prices
  - **Green/white candle:** Close higher than open (price went up)
  - **Red/black candle:** Close lower than open (price went down)
  - **Wicks/shadows:** High and low prices during the period
- **Best for:** Detailed analysis of price action and patterns

### Bar Chart
- **What it shows:** Similar to candlestick but with vertical lines
- **Components:**
  - **Vertical line:** High to low price range
  - **Left tick:** Opening price
  - **Right tick:** Closing price
- **Best for:** Alternative to candlesticks with same information

## Essential Chart Components 🧩

### Time Frame Selection
- **Intraday:** Minutes or hours (for short-term traders)
- **Daily:** Each candle/bar represents one day
- **Weekly/Monthly:** Each candle/bar represents one week/month
- **Yearly:** Long-term trends

### Price Scale
- **Linear scale:** Equal distance for equal price changes
- **Logarithmic scale:** Equal percentage changes appear equal on chart
- **Which to use:** Log scale better for long-term charts

### Volume Indicator
- **What it shows:** Number of shares traded during each period
- **Why it matters:**
  - High volume with price increase = strong buying interest
  - High volume with price decrease = strong selling pressure
  - Price change with low volume = less significant

### Moving Averages
- **What they are:** Average price over specified periods
- **Common periods:** 
  - 50-day (short-term trend)
  - 200-day (long-term trend)
- **Significance:**
  - Price above moving average = bullish
  - Price below moving average = bearish
  - Crossovers between different moving averages = potential trend changes

## Reading Chart Patterns 👁️

### Support and Resistance
- **Support:** Price level where stock tends to stop falling
- **Resistance:** Price level where stock tends to stop rising
- **Why they matter:** These psychological price points often influence trading decisions

### Common Patterns

**Trend Patterns:**
- **Uptrend:** Series of higher highs and higher lows
- **Downtrend:** Series of lower highs and lower lows
- **Sideways/Range:** Price moves within horizontal boundaries

**Reversal Patterns:**
- **Double Top:** M-shaped pattern suggesting potential downward reversal
- **Double Bottom:** W-shaped pattern suggesting potential upward reversal
- **Head and Shoulders:** Three peaks (middle highest) suggesting downward reversal

**Continuation Patterns:**
- **Flags:** Brief pause in trend before continuing same direction
- **Triangles:** Converging price action suggesting continuation after breakout

## Practical Chart Reading Process 🔍

### Step 1: Identify the Overall Trend
- Look at the big picture first
- Is the stock in an uptrend, downtrend, or trading sideways?
- Compare with broader market indices (Nifty/Sensex)

### Step 2: Check Key Price Levels
- Identify major support and resistance areas
- Look for previous high/low points
- Note psychological round numbers (like ₹100, ₹500)

### Step 3: Analyze Volume
- Is volume confirming price movements?
- Are major price moves happening on high volume?

### Step 4: Look for Patterns
- Identify any recognizable chart patterns
- Consider what these patterns typically indicate

### Step 5: Check Technical Indicators (Advanced)
- Moving averages
- Relative Strength Index (RSI)
- Moving Average Convergence Divergence (MACD)

## Tools for Chart Analysis 🛠️

### Free Charting Platforms
- **TradingView:** Comprehensive and user-friendly
- **NSE India Website:** Basic charts for Indian stocks
- **Investing.com:** Good mobile app options
- **Broker Platforms:** Most trading apps include basic charts

### Chart Reading Tips for Beginners 💡
- Start with simple line charts to understand trends
- Progress to daily candlestick charts
- Focus on price and volume before adding complex indicators
- Practice identifying patterns on historical charts
- Remember that charts show what has happened, not what will happen

Learning to read charts takes practice, but even understanding the basics can help you make more informed investment decisions!`
        },
        {
          module_id: module2Data[0].id,
          title: 'What Influences Stock Prices?',
          lesson_order: 3,
          content: `# What Influences Stock Prices? 🧠

Stock prices move up and down based on a complex mix of factors. Understanding these influences helps you make sense of market movements and make better investment decisions.

## Company-Specific Factors 🏢

### Financial Performance
- **Earnings announcements:** Quarterly and annual profit reports
- **Revenue growth:** Increasing sales typically boost stock prices
- **Profit margins:** Higher margins often lead to higher valuations
- **Revenue/earnings surprises:** Stock often moves based on performance vs expectations

### Business Developments
- **New product launches:** Potential for future growth
- **Winning major contracts:** Secure future revenue
- **Expansion plans:** New markets or facilities
- **Management changes:** New leadership can signal new direction
- **Mergers & acquisitions:** Can dramatically change company outlook

### Company News
- **Corporate scandals:** Can cause rapid price drops
- **Legal issues:** Lawsuits, regulatory problems
- **Strategic partnerships:** New business relationships
- **Research breakthroughs:** Especially important in healthcare/tech

## Industry & Sector Factors 🏭

### Sector Trends
- Stocks in the same sector often move together
- Example: Oil price increase affects all energy companies

### Competitive Landscape
- **Market share changes:** Gaining or losing ground to competitors
- **New competitors:** Disruption threats
- **Industry consolidation:** Fewer players may mean different opportunities

### Regulatory Environment
- **New laws or regulations:** Can create costs or opportunities
- **Policy changes:** Government decisions about industry oversight
- **Tax changes:** Impact on profitability

## Economic Factors 💹

### Interest Rates
- **Rising rates:** Often negative for stocks (especially growth stocks)
- **Falling rates:** Generally positive for stocks
- **Why?** Rates affect borrowing costs and make bonds more/less attractive alternatives

### Economic Indicators
- **GDP growth:** Overall economic health
- **Inflation:** Rising prices affect purchasing power and company costs
- **Unemployment:** Indicates consumer spending potential
- **Manufacturing activity:** Industrial health

### Currency Movements
- **For exporters:** Weaker rupee helps (products cheaper abroad)
- **For importers:** Stronger rupee helps (imports cost less)
- **For multinational companies:** Complex effects based on where revenue comes from

## Market Sentiment & Psychology 🧩

### Investor Sentiment
- **Fear vs. greed:** Emotional cycles drive market extremes
- **Market momentum:** Stocks often continue in same direction short-term
- **FOMO (Fear Of Missing Out):** Can drive prices higher in bull markets
- **Panic selling:** Can drive prices lower in market corrections

### Technical Factors
- **Support/resistance levels:** Price points where stocks tend to bounce/reverse
- **Short selling:** Betting against stocks can amplify downturns
- **Options expiration:** Monthly event that can cause volatility

### Media & Information Flow
- **Financial news coverage:** Can trigger short-term reactions
- **Analyst recommendations:** Upgrades/downgrades from research firms
- **Social media:** Growing influence on short-term stock movements

## Global & External Factors 🌍

### Geopolitical Events
- **Wars and conflicts:** Create uncertainty
- **Trade disputes:** Affect international companies
- **Political instability:** Impacts business environment
- **Elections:** New policies can benefit/harm different sectors

### Natural Disasters & Crises
- **Pandemics:** Disruption to business operations
- **Weather events:** Impact on supply chains
- **Resource shortages:** Affect production capabilities

### Global Market Movements
- **International market correlation:** Markets often move together
- **Foreign investment flows:** International money moving in/out of India

## Institutional vs. Retail Influence 🏦

### Institutional Investors
- Control majority of market volume
- Include mutual funds, pension funds, insurance companies
- Large buy/sell orders can move prices significantly

### Retail Investors
- Individual investors like you
- Growing influence through online platforms
- Can create significant impact when acting together

## Long-Term vs. Short-Term Factors ⏱️

### Short-Term Price Movers
- Daily news events
- Technical trading patterns
- Sentiment and emotions
- Temporary supply/demand imbalances

### Long-Term Price Drivers
- Consistent business performance
- Competitive advantages
- Industry growth prospects
- Economic fundamentals

## How to Use This Knowledge 💡

### For Long-Term Investors
- Focus on company fundamentals and industry trends
- Don't overreact to short-term news
- Understand economic factors that might affect 3-5 year outlook

### For Active Investors
- Monitor all categories of influences
- Develop a sense for which factors matter most for specific stocks
- Create a system to track relevant news and developments

Remember that stock prices reflect both current reality AND future expectations. Understanding these influences helps you evaluate whether price movements are justified or present buying/selling opportunities!`
        }
      ]);

    // Module 3: Getting Started
    const { data: module3Data, error: module3Error } = await supabase
      .from('course_modules')
      .insert({
        course_id: courseId,
        title: 'Getting Started',
        description: 'Learn the practical steps to start investing in the stock market',
        module_order: 3,
        content: 'This module provides practical guidance on how to open a demat account, pick your first stock, and determine how much to invest.'
      })
      .select();

    if (module3Error) throw module3Error;
    
    await supabase
      .from('lessons')
      .insert([
        {
          module_id: module3Data[0].id,
          title: 'How to Open a Demat Account',
          lesson_order: 1,
          content: `# How to Open a Demat Account 📝

A Demat (Dematerialized) account is essential for stock investing in India. It holds your shares in electronic form, similar to how a bank account holds your money.

## Understanding the Accounts You Need 🧩

### Three Essential Accounts
1. **Savings Bank Account:** For transferring money in/out
2. **Demat Account:** For storing your shares electronically
3. **Trading Account:** For executing buy/sell orders

Most brokers offer all three linked together for seamless operation.

## Types of Brokers in India 🏢

### Full-Service Brokers
- **Examples:** ICICI Direct, HDFC Securities, Kotak Securities
- **Pros:** 
  - Research support and advisory services
  - Physical branches for in-person assistance
  - Often linked to major banks
- **Cons:**
  - Higher brokerage fees (0.3-0.5% per trade)
  - Sometimes outdated technology
  - Minimum balance requirements

### Discount Brokers
- **Examples:** Zerodha, Upstox, Groww, Angel One
- **Pros:**
  - Lower fees (flat fee of ₹10-20 per trade)
  - Modern, user-friendly apps
  - No minimum balance requirements
- **Cons:**
  - Limited research and advisory
  - Primarily digital support (chat/email)
  - Less hand-holding for beginners

## Step-by-Step Account Opening Process 📋

### Step 1: Choose a Broker
**Consider these factors:**
- Brokerage charges
- User interface and ease of use
- Customer service reputation
- Additional tools and resources
- Account maintenance fees

### Step 2: Prepare Required Documents
- **PAN Card** (mandatory)
- **Aadhaar Card** (for eKYC)
- **Cancelled cheque** or bank statement
- **Mobile number** linked to Aadhaar
- **Email ID**
- **Passport-size photographs**
- **Income proof** (sometimes required)

### Step 3: Complete the Application
**Options:**
- **Online:** Most convenient and fastest
  - Visit broker's website/app
  - Fill digital application
  - Complete eKYC with Aadhaar
- **Offline:** Visit broker's office with physical documents

### Step 4: KYC Verification
- **eKYC:** Verification through Aadhaar OTP
- **Video KYC:** Short verification call (increasingly common)
- **In-person:** Physical verification (less common now)
- **Digital signature:** Using Aadhaar-based eSign

### Step 5: Sign Agreements
- Broker-client agreement
- Demat account opening form
- Trading account terms and conditions
- Risk disclosure documents

### Step 6: Account Activation
- Receive login credentials
- Set up two-factor authentication
- Link your bank account
- Download trading app/platform

## Important Fees to Understand 💰

### One-Time Fees
- **Account opening fee:** ₹0-500 (many offer free opening)
- **Documentation charges:** ₹0-300

### Recurring Fees
- **Annual maintenance charge (AMC):** ₹300-750 per year
- **Transaction charges:** ₹10-30 per trade (discount) or percentage based (full-service)
- **Securities Transaction Tax (STT):** Government tax on transactions
- **Goods and Services Tax (GST):** 18% on brokerage and charges

## Popular Broker Comparison for Students 🔍

### Zerodha
- **Account opening:** ₹0 (Free)
- **Maintenance:** ₹300/year
- **Brokerage:** Flat ₹20 per executed order
- **Best for:** Overall balance of features, platform stability

### Groww
- **Account opening:** ₹0 (Free)
- **Maintenance:** ₹0-250/year
- **Brokerage:** ₹20 per executed order
- **Best for:** Absolute beginners, very user-friendly interface

### Upstox
- **Account opening:** ₹0 (Free)
- **Maintenance:** ₹150-300/year
- **Brokerage:** Flat ₹20 per executed order
- **Best for:** Competitive pricing, good research tools

## After Opening Your Account: Next Steps 🚶

### 1. Fund Your Account
- Transfer money from your linked bank account
- Start with a small amount to get comfortable

### 2. Explore the Platform
- Familiarize yourself with the interface
- Try the demo/simulator if available
- Learn how to place different types of orders

### 3. Learn About Market Segments
- **Equity (Cash):** For long-term investing
- **Equity (F&O):** Futures and Options (advanced, riskier)
- **Currency:** For currency exchange rate trading
- **Commodity:** For trading gold, silver, etc.

### 4. Security Best Practices
- Use strong passwords
- Enable two-factor authentication
- Never share OTPs or passwords
- Log out after each session
- Check account statements regularly

Opening a demat account is your first practical step toward investing. Take your time to choose the right broker that fits your needs, and start with small investments as you learn!`
        },
        {
          module_id: module3Data[0].id,
          title: 'Picking Your First Stock',
          lesson_order: 2,
          content: `# Picking Your First Stock 🎯

Choosing your first stock can be both exciting and intimidating. This guide will help you approach this important step methodically and confidently.

## Start with the Right Mindset 🧠

### Your First Stock Should Be:
- A learning experience more than a profit opportunity
- A company you understand
- A business with products/services you use or know
- Financially stable with a good reputation
- Just one part of your eventual diverse portfolio

### Common First-Stock Mistakes to Avoid:
- Buying a stock just because it's "cheap" (low price per share)
- Following random tips without research
- Investing in complex businesses you don't understand
- Putting too much money into one stock
- Expecting quick profits

## Step-by-Step Selection Process 📋

### Step 1: Decide Your Investment Approach
- **Value investing:** Looking for undervalued companies
- **Growth investing:** Focusing on companies with high growth potential
- **Income investing:** Prioritizing dividend-paying stocks
- **Passive approach:** Consider starting with an index fund instead of individual stock

### Step 2: Choose a Sector You Understand
- **Technology:** If you understand digital products and services
- **Consumer goods:** If you follow retail and everyday products
- **Banking/Financial:** If you have interest in financial services
- **Healthcare:** If you understand medical or healthcare businesses
- **Automotive:** If you follow car manufacturers and trends

### Step 3: Create a Shortlist of Companies
- List 5-10 companies in your chosen sector
- Include companies whose products/services you use
- Mix of large established companies and growing mid-sized ones

### Step 4: Basic Analysis Checklist

**For Each Company, Check:**

**Business Fundamentals:**
- What does the company do? (in simple terms)
- How does it make money?
- Who are its customers?
- Who are its main competitors?
- What advantages does it have?

**Financial Health:**
- Consistent profit growth over 3-5 years
- Manageable debt levels
- Positive cash flow
- Return on equity (ROE) above 15%

**Management Quality:**
- Experienced leadership team
- Clear business strategy
- Ethical reputation
- Transparent communication

### Step 5: Valuation Check
- **Price-to-Earnings (P/E) ratio:** Compare to industry average
- **Dividend yield:** If income is important to you
- **Price-to-Book (P/B) ratio:** Is it reasonable for the industry?
- **Recent price trends:** Is it steadily growing or highly volatile?

## Research Sources for Beginners 📚

### Free Resources:
- **Company websites:** Annual reports, investor presentations
- **NSE/BSE websites:** Basic company information
- **Screener.in:** Financial data and ratios
- **Moneycontrol:** News and basic analysis
- **Tickertape:** Beginner-friendly analysis tools
- **Value Research:** Good for comparing stocks
- **Trading platform research:** Your broker's built-in research

### What to Look For in Research:
- Recent financial performance
- Future growth plans
- Industry trends
- Major risks and challenges
- Expert opinions (but don't rely solely on them)

## Beginner-Friendly Stock Categories 🏆

### Blue-Chip Stocks
- **Why good for beginners:** Stability, established businesses
- **Examples:** HDFC Bank, TCS, ITC, Reliance Industries
- **Advantage:** Lower volatility, established track record

### Consumer Companies You Know
- **Why good for beginners:** Familiarity with products
- **Examples:** Hindustan Unilever, Nestle India, Tata Consumer Products
- **Advantage:** Easier to understand business model

### Technology Leaders
- **Why good for beginners:** Visible growth, products you might use
- **Examples:** Infosys, TCS, Tech Mahindra
- **Advantage:** Exposure to growing sector

## Alternative First Investment: Index Funds 📊

### Consider an Index Fund Instead If:
- You feel overwhelmed by stock selection
- You want instant diversification
- You prefer lower risk to start
- You want to invest regularly in small amounts

### Popular Index Options:
- **Nifty 50 Index Fund:** Top 50 companies in India
- **Nifty Next 50:** The next 50 largest companies
- **Sensex Index Fund:** Top 30 companies on BSE

## Making Your Final Decision ✅

### Questions to Ask Yourself:
- Do I understand how this company makes money?
- Would I be comfortable holding this stock for 3+ years?
- Can I explain to a friend why I'm buying this stock?
- Am I buying based on research or emotion?
- Is the price reasonable for what I'm getting?

### Start Small:
- Limit your first purchase to an amount you're comfortable potentially losing
- Consider it partly an educational expense
- Plan to add more stocks over time for diversification

## After Buying: What's Next 🚀

### Monitor (But Don't Obsess):
- Check company news and quarterly results
- Follow industry developments
- Don't panic over short-term price movements

### Learn From The Experience:
- Track why the stock moves up or down
- Note your emotional reactions
- Use insights for future investments

### Build Your Portfolio:
- Add different stocks over time
- Aim for 8-10 stocks across different sectors eventually
- Consider regular investments in index funds alongside individual stocks

Remember, your first stock purchase is just the beginning of your investing journey. Focus on learning the process rather than making a perfect choice!`
        },
        {
          module_id: module3Data[0].id,
          title: 'How Much Money Should You Start With?',
          lesson_order: 3,
          content: `# How Much Money Should You Start With? 💰

Determining the right amount to begin your investment journey is a personal decision that depends on several factors. Let's explore the considerations for students.

## Minimum Requirements vs. Ideal Amounts 📊

### Absolute Minimums
- **Exchange minimum:** No official minimum for stock purchases
- **Practical minimum:** ₹500-1,000 per stock (to cover fees effectively)
- **SIP minimum:** Usually ₹500 monthly for mutual funds
- **Broker requirements:** Some may have minimum balance requirements

### What Makes an Ideal Starting Amount?
- Enough to buy at least 1-3 different stocks or funds
- Small enough that losing it won't affect your financial stability
- Large enough to keep fees as a reasonable percentage
- Amount you can invest without emotional stress

## The Percentage Approach 📝

### For Students With Part-Time Income
- Consider investing 10-20% of your earnings
- Example: If earning ₹5,000 monthly from internship/part-time work
  - ₹500-1,000 could go to investments
  - Start with one stock or SIP, add more over time

### For Students With Financial Support/Allowance
- Discuss with family about allocating 5-10% for investing
- Example: If receiving ₹3,000 monthly allowance
  - ₹150-300 could be investment learning budget
  - Focus on regular small investments to build habit

### For Students With Savings
- Consider investing 20-30% of existing savings
- Keep 70-80% for education expenses and emergencies
- Example: If you have ₹10,000 saved
  - ₹2,000-3,000 could start your investment journey
  - Enough for 1-2 stocks or several months of SIPs

## Student-Specific Considerations 🎓

### Priority Order for Students
1. Education expenses (books, courses, exams)
2. Emergency fund (1-3 months of basic expenses)
3. Investment for learning
4. Investment for growth

### Special Student Circumstances
- **Irregular income:** Focus on percentage of whatever you receive
- **Educational loans:** Consider small investments while focusing on future loan repayment
- **Career preparation expenses:** Prioritize career-advancing investments (courses, certificates)
- **Post-graduation plans:** Consider liquidity needs for relocation, first job expenses

## Starting Strategies Based on Amount 🧩

### Less than ₹1,000 Available
- Start with a mutual fund SIP (₹500 minimum)
- Consider micro-savings apps that round up expenses
- Focus on learning market basics while saving more

### ₹1,000-5,000 Available
- Option 1: One quality stock in a company you understand
- Option 2: Index fund investment
- Option 3: Split between 2 different mutual fund SIPs

### ₹5,000-10,000 Available
- Option 1: Two different stocks in different sectors
- Option 2: One stock + one index fund
- Option 3: Multiple mutual fund SIPs across equity categories

### ₹10,000+ Available
- Build a mini-portfolio of 3-5 stocks across different sectors
- Combine individual stocks with index investment
- Create a structured plan with regular additions

## Cost Considerations 💸

### Transaction Costs
- **Brokerage:** Flat ₹20 per trade with discount brokers
- **STT and other taxes:** Approximately 0.1% of transaction value
- **Impact on small investments:** Costs are proportionally higher on small amounts

### The Cost Efficiency Factor
- Example: ₹500 investment with ₹20 brokerage = 4% cost
- Example: ₹5,000 investment with ₹20 brokerage = 0.4% cost
- **Conclusion:** Larger individual purchases are more cost-efficient

## Building Over Time: The Power of Regular Investing 📈

### Monthly Investment Approaches
- **Fixed amount:** Same rupee amount each month
- **Fixed units:** Same number of shares each month
- **Opportunity-based:** More when market dips, less when expensive

### The Mathematical Advantage
- ₹1,000/month for 5 years = ₹60,000 invested
- At 12% average annual returns = approximately ₹80,000
- Benefits of rupee-cost averaging and compounding

## Practical First-Time Investor Examples 👥

### Rahul (1st Year Student)
- Starting amount: ₹2,000 from birthday gift
- Strategy: ₹1,000 in Nifty Index Fund + ₹500 monthly SIP
- Learning focus: Understanding market movements

### Priya (3rd Year Student with Internship)
- Starting amount: ₹5,000 saved from stipend
- Strategy: One blue-chip stock (₹3,000) + one growth stock (₹2,000)
- Learning focus: Company analysis and fundamentals

### Ajay (Final Year Student)
- Starting amount: ₹12,000 from multiple sources
- Strategy: 3 stocks (₹3,000 each) + ₹3,000 in index funds
- Learning focus: Portfolio management and sector analysis

## Final Recommendations 💡

### For Most Student Beginners
- **Ideal starter range:** ₹3,000-5,000 if available
- **Ideal monthly contribution:** ₹500-1,000 if possible
- **Allocation strategy:** Mix of individual stock(s) and index fund
- **Learning commitment:** 1-2 hours weekly reading and research

### Remember
- The amount is less important than starting the habit
- Knowledge gained is as valuable as initial returns
- Begin with what you're comfortable losing as a worst-case scenario
- Increase your investments gradually as your knowledge and comfort grow

The perfect starting amount is whatever gets you into the market without causing financial stress—even ₹500 invested is better than waiting for the "perfect" amount!`
        }
      ]);

    // Module 4: Smart Investment Strategies
    const { data: module4Data, error: module4Error } = await supabase
      .from('course_modules')
      .insert({
        course_id: courseId,
        title: 'Smart Investment Strategies',
        description: 'Learn about diversification, long-term vs short-term investing, and how to use news and trends for smart decisions',
        module_order: 4,
        content: 'This module covers essential investment strategies to help you make smarter decisions and build a successful portfolio.'
      })
      .select();

    if (module4Error) throw module4Error;
    
    await supabase
      .from('lessons')
      .insert([
        {
          module_id: module4Data[0].id,
          title: 'Diversification and Risk',
          lesson_order: 1,
          content: `# Diversification and Risk 🛡️

Diversification is often called the only "free lunch" in investing. It's a powerful strategy that can help reduce risk while maintaining potential returns.

## Understanding Investment Risk 📊

### Types of Risk in Stock Investing

**1. Company-Specific Risk**
- Issues unique to a specific company
- Examples: Management problems, product failures, competition
- Can be reduced through diversification

**2. Market Risk**
- Affects the entire market
- Examples: Economic downturns, interest rate changes, global events
- Cannot be eliminated through diversification
- Can be managed with asset allocation and time horizon

**3. Sector Risk**
- Affects specific industries
- Examples: Tech regulations, healthcare policy changes
- Can be reduced by investing across different sectors

## The Power of Diversification 🌈

### What is Diversification?
Spreading your investments across different assets to reduce risk without necessarily sacrificing returns.

### Why Diversification Works
- Different investments perform differently under various conditions
- Losses in one area may be offset by gains in another
- Reduces the impact of any single investment failing
- Smooths overall portfolio performance

### Diversification is Not Just About Quantity
- Having 20 similar tech stocks is not true diversification
- Quality diversification means spreading across different types of investments

## Diversification Dimensions 🧩

### 1. Across Companies
- Invest in multiple companies rather than just one
- Start with 5-10 different stocks as you build your portfolio
- Add new positions gradually as you learn

### 2. Across Sectors/Industries
- Technology
- Healthcare
- Financial services
- Consumer goods
- Manufacturing
- Energy
- And more...

### 3. Across Market Capitalization
- Large-cap: Established, stable companies
- Mid-cap: Growth potential with some stability
- Small-cap: Higher growth potential but higher risk

### 4. Across Geographies
- Domestic (Indian) stocks
- International exposure (through funds)
- Emerging markets vs. developed markets

### 5. Across Asset Classes (Advanced)
- Stocks (equity)
- Bonds (debt)
- Gold
- Real estate
- Cash/liquid funds

## Practical Diversification for Students 🎓

### Starter Portfolio with ₹10,000
- ₹4,000 in a large-cap stock (ex: HDFC Bank)
- ₹3,000 in a different sector stock (ex: Asian Paints)
- ₹3,000 in an index fund (ex: Nifty 50 fund)

### Monthly Investment Plan with ₹1,000
- ₹500 in Nifty index fund
- ₹500 accumulated for individual stock purchases when you reach ₹3,000

### Building Over Time
- Add new stocks in different sectors
- Aim for 8-12 stocks maximum for a beginner portfolio
- Maintain balance by not letting any single stock become too large a percentage

## The Mathematics of Diversification 🔢

### Risk Reduction Example
- Single stock volatility: Can move ±30% in a year
- Well-diversified portfolio: Typically moves ±15% in a year
- Extreme market events: Even diversified portfolios can drop 20%+ in crashes

### Correlation Matters
- **Positive correlation:** Assets move in same direction (most stocks during market crash)
- **Negative correlation:** Assets move in opposite directions (sometimes gold vs. stocks)
- **Low correlation:** Assets move independently (specific company developments)
- **Ideal:** Mix of assets with low correlation to each other

## Common Diversification Mistakes ⚠️

### Over-Diversification
- Too many stocks (20+) becomes hard to monitor
- Excessive diversification can limit potential returns
- May lead to "closet indexing" while paying higher fees

### Under-Diversification
- Too concentrated in one company/sector
- High exposure to specific risks
- Common when investing in familiar companies only

### False Diversification
- Multiple funds with overlapping holdings
- Several stocks in the same industry
- Different investment accounts all following similar strategies

## Implementing Diversification Strategies 📈

### For New Investors
1. **Start with an index fund:** Instant diversification across many companies
2. **Add individual stocks gradually:** Research one company at a time
3. **Track sector exposure:** Make sure you're not too heavily weighted in one area
4. **Rebalance occasionally:** Adjust if some investments grow to dominate your portfolio

### Tools to Help
- Broker portfolio analysis features
- Morningstar X-Ray (for mutual funds)
- Simple spreadsheet tracking sector allocation
- Apps like Ticker or Stock Trainer

## Balancing Risk and Return 🎯

### Finding Your Risk Tolerance
- **Conservative:** More large-caps, dividend stocks, some index funds
- **Moderate:** Mix of established companies and growth stocks
- **Aggressive:** Higher allocation to growth stocks, mid/small caps

### Age-Based Considerations
- Generally, younger investors can take more risk
- Long time horizon allows recovery from market downturns
- Consider increasing stability as specific goals approach

### The 100 Minus Age Rule (Simplified)
- Percentage in growth assets = 100 - your age
- Example: A 20-year-old might have 80% in growth-oriented investments
- Adjust based on personal risk tolerance

Remember, diversification doesn't guarantee profits or prevent losses, but it is one of the most effective tools for managing risk while pursuing returns over time!`
        },
        {
          module_id: module4Data[0].id,
          title: 'Long-term vs Short-term Investing',
          lesson_order: 2,
          content: `# Long-term vs Short-term Investing ⏳

Both long-term and short-term investing approaches have their place, but they involve very different strategies, mindsets, and risk profiles. Understanding these differences is crucial for student investors.

## Time Horizons Defined 📅

### Short-term Investing
- **Time frame:** Less than 1-2 years
- **Focus:** Price movements, market timing, trading patterns
- **Strategy:** Buy low, sell high within shorter periods
- **Example goal:** Saving for a laptop or post-graduation trip

### Medium-term Investing
- **Time frame:** 2-5 years
- **Focus:** Company growth and market position
- **Strategy:** Identifying growth opportunities and fair value
- **Example goal:** Saving for higher education or first home down payment

### Long-term Investing
- **Time frame:** 5+ years (often 10+ years)
- **Focus:** Company fundamentals, competitive advantages, industry trends
- **Strategy:** Buy and hold quality companies, compound returns
- **Example goal:** Building wealth for financial independence

## The Case for Long-Term Investing 🌳

### Statistical Advantages
- **Market predictability increases** with time horizon
- Historical data shows:
  - 1-year holding period: 73% chance of positive returns
  - 5-year holding period: 88% chance of positive returns
  - 10-year holding period: 95% chance of positive returns

### Key Benefits
1. **Compounding power:** Returns generating more returns over time
2. **Lower transaction costs:** Fewer trades mean lower total fees
3. **Tax efficiency:** Long-term capital gains taxed at lower rates
4. **Less stress:** Don't need to constantly watch markets
5. **Time to recover:** Can ride out market downturns

### The Power of Compounding 
- ₹10,000 invested at 12% annual growth:
  - After 5 years: ₹17,623 (76% growth)
  - After 15 years: ₹47,727 (377% growth)
  - After 30 years: ₹299,599 (2,896% growth)
- The longer your money works, the faster it grows!

## The Appeal of Short-Term Approaches 🏃‍♂️

### Potential Benefits
1. **Quick profits:** Possibility of faster returns
2. **Flexibility:** Capital not locked up for long periods
3. **Opportunity reaction:** Capitalize on short-term market inefficiencies
4. **Active engagement:** More hands-on involvement
5. **Skill development:** More frequent feedback on decisions

### Key Challenges
1. **Market timing difficulty:** Professionals struggle with this consistently
2. **Higher costs:** More transactions mean more fees
3. **Tax implications:** Short-term gains taxed at higher rates
4. **Time commitment:** Requires constant monitoring
5. **Emotional discipline:** Managing reactions to market volatility

## Student-Specific Considerations 🎓

### Advantages of Long-Term for Students
- **Learning curve:** Time to develop investment skills
- **Low maintenance:** Fits busy student schedules
- **Lower capital needed:** Small amounts grow meaningfully with time
- **Career focus:** Can concentrate on education without market distractions

### Advantages of Short-Term for Students
- **Practical learning:** Quick feedback on investment decisions
- **Skill building:** Developing analysis techniques
- **Engagement:** Hands-on experience with market mechanics
- **Flexibility:** Access to funds for educational opportunities

## Hybrid Approach: The Core-Satellite Strategy 🏆

### The Strategy
- **Core investments (70-80%):** Long-term holdings in index funds and blue-chip stocks
- **Satellite investments (20-30%):** Short/medium-term positions based on research or opportunities

### Benefits for Students
- Safety of long-term core with excitement of shorter-term positions
- Learn both approaches simultaneously
- Build disciplined habits while developing active skills

## Long-Term Investment Selection 🎯

### What to Look For:
1. **Sustainable competitive advantages:** Why the company will remain successful
2. **Industry growth prospects:** Tailwinds that will help the entire sector
3. **Quality management:** Leadership with integrity and vision
4. **Financial strength:** Low debt, strong cash flow, consistent profitability
5. **Reasonable valuation:** Not overpaying, even for great companies

### Examples of Long-Term Sectors:
- Consumer staples (products people always need)
- Healthcare (aging population, medical advances)
- Financial services (growing middle class, digital transformation)
- Technology infrastructure (increasing digital dependence)

## Short-Term Investment Selection 🔍

### What to Look For:
1. **Catalysts:** Upcoming events that could move the stock price
2. **Technical patterns:** Price and volume signals of potential movements
3. **Sentiment shifts:** Changes in how the market perceives a company
4. **Valuation discrepancies:** Temporary mispricing that may correct
5. **News-driven opportunities:** Overreactions to company announcements

### Risk Management is Crucial:
- Set stop-loss levels (when to sell if price drops)
- Determine profit targets in advance
- Use position sizing (don't risk too much on any one trade)
- Keep journal of trades and reasons for decisions

## Common Pitfalls to Avoid ⚠️

### Long-Term Pitfalls:
- Abandoning strategy during market downturns
- Neglecting to review holdings periodically
- Failing to adjust for major company/industry changes
- Checking portfolio too frequently (causing unnecessary anxiety)

### Short-Term Pitfalls:
- Treating investing like gambling
- Chasing hot tips without research
- Letting emotions drive decisions
- Failing to account for transaction costs
- Overtrading (excessive buying/selling)

## Which Approach is Right for You? 🤔

### Consider Your:
1. **Time commitment:** How much time can you devote to research and monitoring?
2. **Knowledge level:** How well do you understand market mechanics and analysis?
3. **Financial goals:** What are you investing for and when do you need the money?
4. **Emotional temperament:** How do you react to seeing investments decrease in value?
5. **Interest level:** Do you enjoy the process of analyzing investments?

### Most Student Investors Should:
- **Start with a long-term foundation:** Index funds and 2-3 quality companies
- **Experiment with short-term approaches:** With a small portion of portfolio
- **Develop both skillsets:** Understanding fundamental and technical analysis
- **Keep learning:** Both approaches require ongoing education

Remember that investing is a lifelong journey. Many successful investors use elements of both approaches at different times and for different portions of their portfolio.`
        },
        {
          module_id: module4Data[0].id,
          title: 'Using News & Trends for Smart Decisions',
          lesson_order: 3,
          content: `# Using News & Trends for Smart Decisions 📰

Financial news and market trends can significantly impact stock prices. Learning to interpret this information is a valuable skill for making better investment decisions.

## Types of Financial News That Move Markets 📊

### Company-Specific News
- **Earnings announcements:** Quarterly and annual results
- **Product launches:** New offerings or services
- **Management changes:** CEO/CFO appointments or departures
- **Corporate actions:** Mergers, acquisitions, spin-offs
- **Legal issues:** Lawsuits, regulatory investigations

### Economic News
- **GDP growth:** Overall economic expansion or contraction
- **Employment data:** Job creation, unemployment rate
- **Inflation reports:** Consumer Price Index (CPI), Wholesale Price Index (WPI)
- **Interest rate decisions:** RBI policy announcements
- **Manufacturing/services data:** Industrial production, PMI indices

### Industry/Sector News
- **Regulatory changes:** New laws or rules affecting specific industries
- **Commodity price movements:** Oil, metals, agricultural products
- **Technology breakthroughs:** Innovations disrupting an industry
- **Competitive developments:** New entrants, market share shifts

### Broader Market Influences
- **Global market trends:** International stock market movements
- **Geopolitical events:** Elections, conflicts, trade agreements
- **Natural disasters:** Earthquakes, floods, pandemics
- **Sentiment indicators:** Investor confidence surveys, fund flows

## How Different Investors Use News 🔍

### Long-Term Investors
- Focus on news that affects fundamental business outlook
- Filter out short-term noise
- Look for confirmation or contradiction of investment thesis
- Use significant price drops on temporary news as buying opportunities

### Short-Term Traders
- React quickly to breaking news
- Trade on surprise announcements
- Watch for gaps between expectations and actual results
- Monitor technical indicators alongside news

### Both Need To:
- Distinguish between meaningful signals and market noise
- Understand market expectations vs. actual announcements
- Consider how news fits into broader context
- Recognize that markets often "price in" anticipated news

## Key News Sources for Student Investors 📱

### Free Resources
- **Financial websites:** Moneycontrol, Economic Times Markets
- **Company investor relations:** Direct corporate announcements
- **Market apps:** Broker platforms often include news feeds
- **Social media:** Twitter accounts of reliable financial journalists
- **Government sites:** RBI, Ministry of Finance, SEBI

### Student-Friendly Aggregators
- **Yahoo Finance:** Comprehensive news and data
- **Google Finance:** Basic but useful for beginners
- **Investing.com app:** User-friendly market news
- **NSE/BSE websites:** Official market announcements

### Premium Options (Consider Later)
- **Bloomberg:** Professional-grade news and analysis
- **Reuters:** In-depth financial reporting
- **Financial newspapers:** Business Standard, Mint

## How to Develop a News Analysis System 📝

### Step 1: Build Your Information Diet
- Follow 2-3 reliable news sources
- Set up alerts for stocks you own
- Create a routine (e.g., 15 minutes morning and evening)

### Step 2: Categorize News by Importance
**High Impact:**
- Earnings surprises (positive or negative)
- Significant management changes
- Major regulatory decisions
- Disruption to business model

**Medium Impact:**
- Industry trends
- Competitive positioning changes
- Minor product updates
- Analyst rating changes

**Low Impact (Often Noise):**
- Daily price movements
- Minor news coverage
- Speculation without evidence
- Most TV "expert" opinions

### Step 3: Analyze News in Context
- Compare news to previous company statements
- Consider how it affects company's competitive position
- Look at news relative to industry peers
- Check if the market reaction seems proportional

## Understanding Market Reactions to News 🧠

### Markets React to Surprises
- News that matches expectations often has minimal impact
- The gap between expectations and reality drives price movements
- Market "whisper numbers" may differ from official estimates

### The "Buy the Rumor, Sell the News" Phenomenon
- Stocks often rise on anticipation of good news
- Actual announcement may lead to selling (profit-taking)
- Understanding this pattern helps avoid emotional decisions

### Contrarian Opportunities
- Overreaction to news can create buying/selling opportunities
- Market sentiment sometimes swings too far in either direction
- Ask: "Is this temporary news or a fundamental change?"

## Separating Signal from Noise 📢

### Red Flags for Low-Quality Information
- Anonymous sources
- Clickbait headlines
- Extreme predictions
- Conflicts of interest (undisclosed)
- Lack of specific data points

### Green Flags for High-Quality Information
- Named, credible sources
- Balanced perspective
- Historical context provided
- Data-backed statements
- Transparency about limitations

## Trends Worth Following for Students 📈

### Technological Disruption
- Follow innovations changing traditional industries
- Watch adoption rates of new technologies
- Monitor regulatory responses to tech advancement

### Consumer Behavior Shifts
- Changing preferences in your own demographic
- Products/services gaining popularity among peers
- Sustainability and ethical consumption trends

### Economic Indicators
- Interest rate trends (affects all investments)
- Inflation data (impacts purchasing power)
- Employment trends (indicates economic health)

### Industry-Specific Metrics
- Healthcare: Aging population, new treatments
- Technology: Digital transformation spending
- Finance: Lending growth, fintech adoption

## Common Mistakes in News Interpretation ⚠️

### Recency Bias
- Giving too much weight to latest news
- Forgetting longer-term trends
- Solution: Maintain investment journal noting original thesis

### Confirmation Bias
- Only noticing news that confirms existing beliefs
- Dismissing contradictory information
- Solution: Actively seek opposing viewpoints

### Herd Mentality
- Following crowd reactions without personal analysis
- Getting caught in market euphoria or panic
- Solution: Define your process and stick to it

### Overreacting to Headlines
- Trading on headlines without reading full stories
- Missing important context or details
- Solution: Wait for complete information before acting

## Practical Application for Students 🎓

### Starting Simple
1. **Follow 1-2 stocks closely:** Track all news and learn patterns
2. **Create a news journal:** Note news items and subsequent price movements
3. **Practice "paper trading":** Simulate decisions based on news without real money
4. **Post-analysis:** Review why markets moved as they did

### Advancing Your Skills
1. **Compare analyst expectations vs. results**
2. **Learn to read financial statements alongside news**
3. **Identify recurring patterns in specific companies/industries**
4. **Develop personal frameworks for news evaluation**

Remember that news and trends are tools for decision-making, not the sole basis for investment choices. The best investors use news to inform—not replace—fundamental analysis and long-term strategic thinking.`
        }
      ]);

    return { success: true, courseId };
  } catch (error) {
    console.error('Error setting up Stock Investment course:', error);
    return { success: false, error };
  }
};

/**
 * Create some purchase records for demonstration purposes
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
